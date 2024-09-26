import { v4 as uuidv4 } from 'uuid';
import { Kafka } from 'kafkajs';
import { CommonTransactionUtils } from './commonTransactionUtils.mjs';
import appEnumerations from '../utilities/severInitFunctions.mjs';

export class TransactionProcessorKAFKA {
  commonTransactionUtils;

  constructor() {
    this.commonTransactionUtils = new CommonTransactionUtils();
  }

  async retryOperation(operation, maxRetries = 3, delay = 1000) {
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

  async transactionProcessorPickup(transactionProcessManagerInput) {
    const {
      brokers,
      clientId,
      saslMechanism,
      saslUsername,
      saslPassword,
      topic,
    } = transactionProcessManagerInput.configPickup.kafkaTemplate;

    const kafka = new Kafka({
      brokers,
      clientId,
      ssl: true,
      sasl: {
        mechanism: saslMechanism,
        username: saslUsername,
        password: saslPassword,
      },
    });

    const producer = kafka.producer();

    try {
      await this.retryOperation(() => producer.connect());

      const childTransaction = {
        ...transactionProcessManagerInput.transaction,
        id: uuidv4(),
        pickupTime: new Date().toISOString(),
      };

      await this.retryOperation(() =>
        producer.send({
          topic,
          messages: [{ value: JSON.stringify(childTransaction) }],
        })
      );

      transactionProcessManagerInput.transaction.pickupStatus = appEnumerations.TRANSACTION_STATUS_COMPLETED;
      await this.commonTransactionUtils.addTransaction(childTransaction, transactonsStatisticsMap);

      console.log('Message sent to Kafka topic:', topic);
    } catch (error) {
      console.error('Kafka producer error:', error);
      transactionProcessManagerInput.transaction.pickupError = error.message;
      transactionProcessManagerInput.transaction.pickupStatus = appEnumerations.TRANSACTION_STATUS_FAILED;
      await this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction, transactonsStatisticsMap);
      return false;
    } finally {
      await producer.disconnect();
    }

    return false; // Returning false to stop adding this to the delivery queue
  }

  async transactionProcessorDelivery(transactionProcessManagerInput) {
    const {
      brokers,
      clientId,
      saslMechanism,
      saslUsername,
      saslPassword,
      topic,
      groupId,
    } = transactionProcessManagerInput.configDelivery.kafkaTemplate;

    const kafka = new Kafka({
      brokers,
      clientId,
      ssl: true,
      sasl: {
        mechanism: saslMechanism,
        username: saslUsername,
        password: saslPassword,
      },
    });

    const consumer = kafka.consumer({ groupId });

    try {
      await this.retryOperation(() => consumer.connect());
      await this.retryOperation(() => consumer.subscribe({ topic, fromBeginning: true }));

      await consumer.run({
        eachMessage: async ({ message }) => {
          const receivedMessage = JSON.parse(message.value.toString());
          console.log('Received message:', receivedMessage);

          transactionProcessManagerInput.transaction.deliveryTime = new Date().toISOString();
          transactionProcessManagerInput.transaction.deliveryStatus = appEnumerations.TRANSACTION_STATUS_COMPLETED;
          await this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction, transactonsStatisticsMap);
        },
      });
    } catch (error) {
      console.error('Kafka consumer error:', error);
      transactionProcessManagerInput.transaction.deliveryError = error.message;
      transactionProcessManagerInput.transaction.deliveryStatus = appEnumerations.TRANSACTION_STATUS_FAILED;
      await this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction, transactonsStatisticsMap);
      return false;
    } finally {
      await consumer.disconnect();
    }

    return false; // Returning false to stop adding this to the delivery queue
  }

  async setCommonPickupProcessingParameters(transaction) {
    // Implement as necessary
    return true;
  }

  async setCommonDeliveryProcessingParameters(transaction) {
    // Implement as necessary
    return true;
  }
}
