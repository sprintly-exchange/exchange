import { v4 as uuidv4 } from 'uuid';
import { FtpClientProcessor } from '../../client/ftpClientProcessor.mjs';
import { TransactionProcessManager } from './transactionProcessManager.mjs';
import { fileSync } from 'tmp';
import { promises as fs } from 'fs';
import { CommonTransactionUtils } from './commonTransactionUtils.mjs';
import os from 'os';
import Transaction from '../models/Transaction.mjs';
import GlobalConfiguration from '../../GlobalConfiguration.mjs';
import { TransactionProcessorA } from './TransactionProcessorA.js';

export class TransactionProcessorFTP  extends TransactionProcessorA {
    ftpClientProcessor:any;
    commonTransactionUtils;

    constructor() {
        super();
        this.commonTransactionUtils = new CommonTransactionUtils();
    }

    async retryOperation(operation:any, maxRetries = 3, delay = 1000) {
        let attempt = 0;
        while (attempt < maxRetries) {
            try {
                return await operation();
            } catch (err) {
                attempt++;
                if (attempt >= maxRetries) throw err;
                console.log(`Retrying operation (${attempt}/${maxRetries}) after delay of ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            }
        }
    }

    async transactionProcessorPickup(transactionProcessManagerInput:TransactionProcessManager) {
        const ftpProcessor = new FtpClientProcessor(transactionProcessManagerInput.configPickup);

        try {
            transactionProcessManagerInput.transaction.pickupPath = (await ftpProcessor.getFtpUrlWithoutPassword()).toString();


            const connected = await this.retryOperation(() => ftpProcessor.connect());
            if (connected) {
                const fileList = await this.retryOperation(() => ftpProcessor.listFiles());
                console.log('fileList', fileList);
                let count = 0;

                for (const file of fileList) {
                    if (file.isFile) {
                        count++;
                        let childTransaction:any = {};
                        childTransaction && Object.assign(childTransaction, transactionProcessManagerInput.transaction);
                        childTransaction.pickupPath = (await ftpProcessor.getFtpUrlWithoutPassword()).toString();
                        childTransaction.id = uuidv4();
                        childTransaction.currentMessage = await this.retryOperation(() => ftpProcessor.downloadFile(`${file.name}`));
                        await this.retryOperation(() => ftpProcessor.deleteFile(`${file.name}`));

                        childTransaction.messageName = `${file.name}`;
                        childTransaction.processingTime = new Date().toISOString();
                        childTransaction.pickupTime = new Date().toISOString();
                        childTransaction.pickupStatus =  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_COMPLETED;

                        await this.storeMessage(childTransaction, transactionProcessManagerInput.messageStore, GlobalConfiguration.appEnumerations.STORAGE_PICKUP_INBOUND_MESSAGE);
                        this.commonTransactionUtils.addTransaction(childTransaction);

                        const transactionProcessManager = new TransactionProcessManager(
                            transactionProcessManagerInput.configPickup,
                            transactionProcessManagerInput.configDelivery,
                            transactionProcessManagerInput.configProcessing,
                            transactionProcessManagerInput.configurationFlow
                        );
                        await transactionProcessManager.setTransaction(childTransaction);
                        await GlobalConfiguration.configurationProcessingQueue.enqueue(transactionProcessManager);
                    }

                    if(count >= GlobalConfiguration.serverConfigurationMap.get( GlobalConfiguration.appEnumerations.FTP_PICKUP_MAX_FILE_DOWNLOAD_LIST_LIMIT_PER_SESSION)){
                        console.warn(`${ GlobalConfiguration.appEnumerations.FTP_PICKUP_MAX_FILE_DOWNLOAD_LIST_LIMIT_PER_SESSION} limit exedded : `,GlobalConfiguration.serverConfigurationMap.get( GlobalConfiguration.appEnumerations.FTP_PICKUP_MAX_FILE_DOWNLOAD_LIST_LIMIT_PER_SESSION))
                        break;
                    }
                }
            } else {
                transactionProcessManagerInput.transaction.pickupStatus =  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_FAILED;
                this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction);
            }
        } catch (error:any) {
            console.log('Error processing from ftp', error);
            transactionProcessManagerInput.transaction.pickupError = error.message;
            transactionProcessManagerInput.transaction.pickupStatus =  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_FAILED;
            this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction);
            return false;
        } finally {
            await ftpProcessor.disconnect(); // Ensure connection is closed
        }

        // Returning false to stop adding this to the delivery queue from parent classes.
        // In the case of FTP, the delivery queue is filled for each downloaded file with a new child transaction.
        return false;
    }

    async transactionProcessorDelivery(transactionProcessManagerInput:TransactionProcessManager) {
        const ftpProcessor = new FtpClientProcessor(transactionProcessManagerInput.configDelivery);

        try {
            transactionProcessManagerInput.transaction.deliveryPath = (await ftpProcessor.getFtpUrlWithoutPassword()).toString();

            const connected = await this.retryOperation(() => ftpProcessor.connect());
            if (connected) {
                await this.createTempFileFromString(transactionProcessManagerInput.transaction.currentMessage)
                    .then(async (tempFilePath) => {
                        console.log('`${transactionProcessManagerInput.transaction.messageName}`', `${transactionProcessManagerInput.transaction.messageName}`);
                        await this.retryOperation(() => ftpProcessor.uploadFileCustom(tempFilePath, `${transactionProcessManagerInput.transaction.messageName}`));

                        await this.storeMessage(transactionProcessManagerInput.transaction, transactionProcessManagerInput.messageStore, GlobalConfiguration.appEnumerations.STORAGE_DELIVERY_OUTBOUND_MESSAGE);
                        transactionProcessManagerInput.transaction.deliveryTime = new Date().toISOString();
                        transactionProcessManagerInput.transaction.deliveryStatus =  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_COMPLETED;
                    })
                    .catch((err) => {
                        console.error(err);
                        transactionProcessManagerInput.transaction.deliveryTime = new Date().toISOString();
                        transactionProcessManagerInput.transaction.deliveryStatus =  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_FAILED;
                        transactionProcessManagerInput.transaction.deliveryError = err.message;
                    });

                this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction);
            }
        } catch (error:any) {
            console.log('Error sending file to ftp', error);
            transactionProcessManagerInput.transaction.deliveryError = error.message;
            transactionProcessManagerInput.transaction.deliveryStatus =  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_FAILED;
            this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction);
            return false;
        } finally {
            await ftpProcessor.disconnect(); // Ensure connection is closed
        }

        // Returning false to stop adding this to the delivery queue from parent classes.
        // In the case of FTP, the delivery queue is filled for each downloaded file with a new child transaction.
        return false;
    }

    async createTempFileFromString(content:any) {
        try {
            // Create a temporary file
            const tmpFile = fileSync();
            let tempFilePath = tmpFile.name;

            // Write the string content to the temporary file
            await fs.writeFile(tempFilePath, content, { encoding: 'utf8', mode: 0o777 });

            // Clean up the path: remove any double slashes
            tempFilePath = tempFilePath.replace(/\/\//g, '/');
            return tempFilePath;
        } catch (err) {
            console.error("Error creating temporary file:", err);
            throw err;
        }
    }

}
