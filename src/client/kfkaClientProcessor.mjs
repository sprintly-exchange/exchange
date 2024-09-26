import { kafkaRecordType } from './protocolTemplates.mjs'; // Adjust path as per your structure
import { Kafka, logLevel } from 'kafkajs';

export class KfkaClientProcessor {
  constructor(config) {
    const {
      connectionName,
      brokers,
      clientId,
      username,
      password,
      ssl,
    } = config;

    this.connectionName = connectionName;
    this.brokers = brokers;
    this.clientId = clientId;
    this.username = username;
    this.password = password;
    this.ssl = ssl || false;

    this.kafka = new Kafka({
      clientId: this.clientId,
      brokers: this.brokers,
      ssl: this.ssl,
      sasl: this.username && this.password ? {
        mechanism: 'plain',
        username: this.username,
        password: this.password,
      } : null,
      logLevel: logLevel.INFO,
    });
  }

  async produceMessage() {
    const producer = this.kafka.producer();
    try {
      await producer.connect();
      const topic = 'test-topic'; // Replace with your Kafka topic
      const message = {
        key: 'key1',
        value: 'Hello Kafka!',
      };
      await producer.send({
        topic,
        messages: [
          { value: JSON.stringify(message) },
        ],
      });
      console.log(`Produced message to topic: ${topic}`);
    } catch (error) {
      console.error('Error producing message:', error.message);
    } finally {
      await producer.disconnect();
      console.log('Disconnected Kafka producer');
    }
  }

  async consumeMessages() {
    const consumer = this.kafka.consumer({ groupId: 'test-group' }); // Replace with your consumer group ID
    try {
      await consumer.connect();
      const topic = 'test-topic'; // Replace with your Kafka topic
      await consumer.subscribe({ topic, fromBeginning: true });
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log({
            partition,
            offset: message.offset,
            value: message.value.toString(),
          });
        },
      });
    } catch (error) {
      console.error('Error consuming messages:', error.message);
    } finally {
      await consumer.disconnect();
      console.log('Disconnected Kafka consumer');
    }
  }

  async execute() {
    await this.produceMessage();
    await this.consumeMessages();
  }
}

/*
// Example usage
const kafkaClient = new KafkaClient(kafkaRecordType);
kafkaClient.execute();
*/
