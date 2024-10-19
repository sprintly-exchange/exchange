import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs'; // Removed unused copyFileSync
import os from 'os';
import mqtt from 'mqtt';
import appEnumerations from '../utilities/severInitFunctions.mjs';
import { CommonTransactionUtils } from './commonTransactionUtils.mjs';
import { TransactionProcessManager } from './transactionProcessManager.mjs';

export class TransactionProcessorMQTT {
    static client = null; // Single client instance
    commonTransactionUtils;

    constructor() {
        this.commonTransactionUtils = new CommonTransactionUtils();
    }

    // Singleton pattern to ensure a single persistent MQTT connection
    static getClient(config) {
        if (!TransactionProcessorMQTT.client || !TransactionProcessorMQTT.client.connected) {
            const options = {
                ...config,
                keepalive: 60, // MQTT keepalive interval in seconds
                reconnectPeriod: 5000, // Automatically reconnect after 5 seconds if disconnected
            };
            TransactionProcessorMQTT.client = mqtt.connect(options);
        }
        return TransactionProcessorMQTT.client;
    }

    // Retry logic with exponential backoff
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

    // Connect to the MQTT broker
    async connect(config) {
        const client = TransactionProcessorMQTT.getClient(config);

        return new Promise((resolve, reject) => {
            client.on('connect', () => {
                console.log('Connected to MQTT broker');
                resolve(true);
            });

            client.on('error', (error) => {
                console.error('Connection error:', error);
                reject(false);
            });
        });
    }

    // Subscribe and receive messages from a topic (handling multiple messages)
    subscribeAndReceive(topic, config) {
        const client = TransactionProcessorMQTT.getClient(config);

        return new Promise((resolve, reject) => {
            const messages = [];

            client.subscribe(topic, (error) => {
                if (error) {
                    return reject(error);
                }

                console.log(`Subscribed to topic: ${topic}`);

                client.on('message', (topic, message) => {
                    console.log(`Received message from topic ${topic}: ${message.toString()}`);
                    messages.push({ topic, content: message.toString() });
                });
            });

            setTimeout(() => {
                resolve(messages); // Resolve with all collected messages
            }, 5000); // Adjust timeout as needed
        });
    }

    // Publish a message to a topic
    async publish(topic, message) {
        const client = TransactionProcessorMQTT.getClient();
        return new Promise((resolve, reject) => {
            client.publish(topic, message, {}, (error) => {
                if (error) {
                    return reject(error);
                }
                console.log(`Message published to ${topic}: ${message}`);
                resolve(true);
            });
        });
    }

    // Disconnect from the MQTT broker (if necessary)
    async disconnect() {
        if (TransactionProcessorMQTT.client) {
            return new Promise((resolve) => {
                TransactionProcessorMQTT.client.end(true, () => {
                    console.log('Disconnected from MQTT broker');
                    TransactionProcessorMQTT.client = null; // Reset the client after disconnection
                    resolve();
                });
            });
        }
    }

    // Message pickup handler
    async transactionProcessorPickup(transactionProcessManagerInput) {
        try {
            const config_copy = { ...transactionProcessManagerInput.configPickup };
            const options = {
                host: config_copy.host,
                port: Number(config_copy.port),
                protocol: config_copy.protocol.toLowerCase(),
                username: config_copy.userName,
                password: config_copy.password,
            };

            Object.assign(config_copy, options);
            const connected = await this.retryOperation(() => this.connect(config_copy));

            if (connected) {
                console.log('Connected to MQTT for pickup.');
                const messageList = await this.retryOperation(() => this.subscribeAndReceive(config_copy.topic, config_copy));

                for (const message of messageList) {
                    const childTransaction = {
                        ...transactionProcessManagerInput.transaction,
                        pickupPath: `mqtt://${config_copy.host}:${config_copy.port}/${config_copy.topic}`,
                        id: uuidv4(),
                        currentMessage: message.content,
                        messageName: `MQTT_Message_${uuidv4()}`,
                        pickupStatus: appEnumerations.TRANSACTION_STATUS_COMPLETED,
                    };

                    childTransaction.processingTime = new Date().toISOString();
                    childTransaction.pickupTime = new Date().toISOString();
                    childTransaction.currentMessage =await message.content;
                    console.log("processing pickup message", childTransaction.currentMessage);
                    

                    await this.storeMessage(childTransaction, transactionProcessManagerInput.messageStore, 'PIM');
                    childTransaction.pickupStatus = appEnumerations.TRANSACTION_STATUS_COMPLETED;

                    const transactionProcessManager = new TransactionProcessManager(
                        transactionProcessManagerInput.configPickup,
                        transactionProcessManagerInput.configDelivery,
                        transactionProcessManagerInput.configProcessing,
                        transactionProcessManagerInput.configurationFlow
                    );

                    await transactionProcessManager.setTransaction(childTransaction);
                    this.commonTransactionUtils.addTransaction(childTransaction, transactonsStatisticsMap);
                    await configurationProcessingQueue.enqueue(transactionProcessManager);
                }

                await this.disconnect();
            }
        } catch (error) {
            console.log('Error processing from MQTT:', error);
            transactionProcessManagerInput.transaction.pickupError = error.message;
            //transactionProcessManagerInput.transaction.pickupStatus = appEnumerations.TRANSACTION_STATUS_FAILED;
            //this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction, transactonsStatisticsMap);
            return false;
        }

        return false; // Stops adding this to the delivery queue from parent classes.
    }

    // Message delivery handler
    async transactionProcessorDelivery(transactionProcessManagerInput) {
        try { 
            console.log('OOOOOOOOOOOOOXXX transactionProcessManagerInput' );
            const config_copy = { ...transactionProcessManagerInput.configDelivery };
            const options = {
                host: config_copy.host,
                port: Number(config_copy.port),
                protocol: config_copy.protocol.toLowerCase(),
                username: config_copy.userName,
                password: config_copy.password,
                clientId: config_copy.clientId,
            };

            

            Object.assign(config_copy, options);
            const connected = await this.retryOperation(() => this.connect(config_copy));
    

            if (connected) {
            
                await this.publish(config_copy.topic, transactionProcessManagerInput.transaction.currentMessage);
                transactionProcessManagerInput.transaction.deliveryTime = new Date().toISOString();
                transactionProcessManagerInput.transaction.deliveryStatus = appEnumerations.TRANSACTION_STATUS_COMPLETED;

                this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction, transactonsStatisticsMap);
                    await this.disconnect();
            }
        } catch (error) {
            console.log('XXXXXXXXXX  Error sending message to MQTT:', error);
            transactionProcessManagerInput.transaction.deliveryError = error.message;
            transactionProcessManagerInput.transaction.deliveryStatus = appEnumerations.TRANSACTION_STATUS_FAILED;
            this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction, transactonsStatisticsMap);
            return false;
        }

        return false;
    }

    // Store message with the appropriate leg
    async storeMessage(transaction, messageStore, leg) {
        switch (leg) {
            case 'PIM':
                [transaction.pickupInboundMessagePath, transaction.pickupInboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
                break;
            case 'POM':
                [transaction.pickupOutboundMessagePath, transaction.pickupOutboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
                break;
            case 'DIM':
                [transaction.deliveryInboundMessagePath, transaction.deliveryInboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
                break;
            case 'DOM':
                [transaction.deliveryOutboundMessagePath, transaction.deliveryOutboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
                break;
            default:
                break;
        }
        return true;
    }
}
