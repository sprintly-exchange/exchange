import { v4 as uuidv4 } from 'uuid';
import pkg from 'ssh2';
const { SFTP } = pkg;

export class TransactionProcessorSFTP {
  constructor() {}

  async transactionProcessorPickup(transactionProcessManagerInput) {
    const {
      host,
      port,
      userName,
      password,
      privateKey,
      passphrase,
      remotePath,
      localPath,
    } = sftpTemplate;

    const sftp = new SFTP();

    try {
      await new Promise((resolve, reject) => {
        sftp.on('ready', resolve);
        sftp.on('error', reject);

        sftp.connect({
          host,
          port,
          username: userName,
          password,
          privateKey,
          passphrase,
        });
      });

      const fileList = await new Promise((resolve, reject) => {
        sftp.readdir(remotePath, (err, fileList) => {
          if (err) {
            reject(err);
          } else {
            resolve(fileList);
          }
        });
      });

      console.log('fileList', fileList);

      for (const file of fileList) {
        if (file.type === 'file') {
          const childTransaction = {
            ...transactionProcessManagerInput.transaction,
            id: uuidv4(),
            pickupTime: new Date().toISOString(),
            pickupPath: remotePath,
          };

          const localFilePath = `${localPath}/${file.name}`;

          await new Promise((resolve, reject) => {
            sftp.fastGet(
              `${remotePath}/${file.name}`,
              localFilePath,
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          });

          await new Promise((resolve, reject) => {
            sftp.unlink(`${remotePath}/${file.name}`, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            });
          });

          childTransaction.messageName = file.name;
          childTransaction.processingTime = new Date().toISOString();
          childTransaction.pickupStatus = 'COMPLETED';
          await this.storeMessage(
            childTransaction,
            transactionProcessManagerInput.messageStore,
            'PIM'
          );
          this.commonTransactionUtils.addTransaction(
            childTransaction,
            transactonsStatisticsMap
          );
          const transactionProcessManager = new TransactionProcessManager(
            transactionProcessManagerInput.configPickup,
            transactionProcessManagerInput.configDelivery,
            transactionProcessManagerInput.configProcessing,
            transactionProcessManagerInput.flowName
          );
          await transactionProcessManager.setTransaction(childTransaction);
          await deliveryProcessingQueue.enqueue(transactionProcessManager);
        }
      }

      console.log('Files downloaded and deleted successfully');
    } catch (error) {
      console.error('SFTP error:', error);
      transactionProcessManagerInput.transaction.pickupError = error.message;
      this.commonTransactionUtils.addTransaction(
        transactionProcessManagerInput.transaction,
        transactonsStatisticsMap
      );
      return false;
    } finally {
      sftp.end();
    }

    // Returning false to stop adding this to the delivery queue from parent classes.
    // In the case of SFTP, the delivery queue is filled for each downloaded file with a new child transaction.
    return false;
  }

  async transactionProcessorDelivery(transactionProcessManagerInput) {
    const {
      host,
      port,
      userName,
      password,
      privateKey,
      passphrase,
      remotePath,
    } = sftpTemplate;

    const sftp = new SFTP();

    try {
      await new Promise((resolve, reject) => {
        sftp.on('ready', resolve);
        sftp.on('error', reject);

        sftp.connect({
          host,
          port,
          username: userName,
          password,
          privateKey,
          passphrase,
        });
      });

      const localFilePath = transactionProcessManagerInput.transaction.currentMessage;

      await new Promise((resolve, reject) => {
        sftp.fastPut(localFilePath, `${remotePath}/${transactionProcessManagerInput.transaction.messageName}`, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      await this.storeMessage(
        transactionProcessManagerInput.transaction,
        transactionProcessManagerInput.messageStore,
        'DOM'
      );

      transactionProcessManagerInput.transaction.deliveryTime = new Date().toISOString();
      transactionProcessManagerInput.transaction.deliveryStatus = 'COMPLETED';

      this.commonTransactionUtils.addTransaction(
        transactionProcessManagerInput.transaction,
        transactonsStatisticsMap
      );
    } catch (error) {
      console.error('SFTP error:', error);
      transactionProcessManagerInput.transaction.deliveryError = error.message;
      this.commonTransactionUtils.addTransaction(
        transactionProcessManagerInput.transaction,
        transactonsStatisticsMap
      );
      return false;
    } finally {
      sftp.end();
    }

    // Returning false to stop adding this to the delivery queue from parent classes.
    // In the case of SFTP, the delivery queue is filled for each downloaded file with a new child transaction.
    return false;
  }

  async setCommonPickupProcessingParameters(transaction) {
    return true;
  }

  async setCommonDeliveryProcessingParameters(transaction) {
    return true;
  }
}
