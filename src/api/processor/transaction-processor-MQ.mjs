import { v4 as uuidv4 } from 'uuid';
import { MQ } from 'ibmmq';

export class TransactionProcessorMQ {
  constructor() {}

  async transactionProcessorPickup(transactionProcessManagerInput) {
    try {
      const { host, port, channel, queueManager, queueName } = mqTemplate;

      const conn = await MQ.connect({
        hostname: host,
        port,
        channelName: channel,
        queueManagerName: queueManager,
      });

      const msgObj = {
        ...transactionProcessManagerInput.transaction,
        id: uuidv4(),
        pickupTime: new Date().toISOString(),
      };

      const openOptions = {
        MQOO_OUTPUT: true,
        MQOO_INPUT_AS_Q_DEF: true,
      };

      const queue = await conn.openQueue(queueName, openOptions);
      await queue.put(JSON.stringify(msgObj));
      await queue.close();
      await conn.disconnect();

      console.log('Message sent to MQ');
    } catch (error) {
      console.error('MQ error:', error);
      transactionProcessManagerInput.transaction.pickupError = error.message;
    }
  }

  async transactionProcessorDelivery(transactionProcessManagerInput) {
    try {
      const { host, port, channel, queueManager, queueName } = mqTemplate;

      const conn = await MQ.connect({
        hostname: host,
        port,
        channelName: channel,
        queueManagerName: queueManager,
      });

      const openOptions = {
        MQOO_INPUT_AS_Q_DEF: true,
        MQOO_FAIL_IF_QUIESCING: true,
      };

      const queue = await conn.openQueue(queueName, openOptions);
      const message = await queue.get();
      await queue.close();
      await conn.disconnect();

      const receivedMessage = JSON.parse(message);
      console.log('Received message:', receivedMessage);

      // Perform the desired action with the received message

      transactionProcessManagerInput.transaction.deliveryStatus = 'COMPLETED';
      transactionProcessManagerInput.transaction.deliveryTime = new Date().toISOString();
    } catch (error) {
      console.error('MQ error:', error);
      transactionProcessManagerInput.transaction.deliveryError = error.message;
    }
  }

  async setCommonPickupProcessingParameters(transaction) {
    return true;
  }

  async setCommonDeliveryProcessingParameters(transaction) {
    return true;
  }
}
