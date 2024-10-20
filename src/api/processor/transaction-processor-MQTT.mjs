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
        // If there's no client or if it's disconnected, create a new one
        if (!TransactionProcessorMQTT.client || !TransactionProcessorMQTT.client.connected) {
            const config_copy = { ...config };
            const options = {
                host: config_copy.host,
                port: Number(config_copy.port),
                protocol: config_copy.protocol.toLowerCase(),
                username: config_copy.userName,
                password: config_copy.password,
            };
            
            Object.assign(config_copy, options);

            // Create the client
            console.log('config_copy',config_copy);
            TransactionProcessorMQTT.client = mqtt.connect(config_copy);

            // Handle connection errors
            TransactionProcessorMQTT.client.on('error', (error) => {
                console.error('MQTT Connection Error:', error);
            });

            // Handle client disconnection
            TransactionProcessorMQTT.client.on('close', () => {
                console.log('MQTT client disconnected.');
                TransactionProcessorMQTT.client = null; // Clear the client on disconnect
            });
        }

        // Return the connected client
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
        console.log(config);
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
    async publish(topic, message, config) {
        const client = TransactionProcessorMQTT.getClient(config);

        return new Promise((resolve, reject) => {
            // Wait for the client to connect before publishing
            if (client.connected) {
                const payload = typeof message === 'string' ? message : JSON.stringify(message);

                client.publish(topic, payload, {}, (error) => {
                    if (error) {
                        console.error('Failed to publish message:', error);
                        return reject(error);
                    }
                    console.log(`Message published to ${topic}: ${payload}`);
                    resolve(true);
                });
            } else {
                // If client isn't connected, wait for the 'connect' event
                client.on('connect', () => {
                    const payload = typeof message === 'string' ? message : JSON.stringify(message);

                    client.publish(topic, payload, {}, (error) => {
                        if (error) {
                            console.error('Failed to publish message:', error);
                            return reject(error);
                        }
                        console.log(`Message published to ${topic}: ${payload}`);
                        resolve(true);
                    });
                });

                client.on('error', (error) => {
                    console.error('Error while waiting for connection:', error);
                    reject(error);
                });
            }
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
            // Copy and prepare configuration for MQTT connection
            const config_copy = { ...transactionProcessManagerInput.configPickup };
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
                    childTransaction.currentMessage = await message.content;
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
            // Copy and prepare configuration for MQTT connection
            const config_copy = { ...transactionProcessManagerInput.configDelivery };
        
            // Attempt to connect to the MQTT broker
            const connected = await this.retryOperation(() => this.connect(config_copy));

            if (connected) {
                console.log(`Successfully connected to MQTT broker at ${config_copy.host}:${config_copy.port}`);

                // Ensure the topic and message are valid before publishing
                const topic = config_copy.topic;
                const message = transactionProcessManagerInput.transaction.currentMessage;

                if (!topic || !message) {
                    throw new Error('Invalid topic or message. Topic or message cannot be null.');
                }

                console.log(`Preparing to publish message ${message} to topic: ${topic}`);

                // Publish the message
                await this.publish(topic, message, config_copy);
                console.log(`Message successfully published to topic: ${topic}`);

                // Update transaction status upon successful delivery
                transactionProcessManagerInput.transaction.deliveryTime = new Date().toISOString();
                transactionProcessManagerInput.transaction.deliveryStatus = appEnumerations.TRANSACTION_STATUS_COMPLETED;

                // Log the transaction in the system
                this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction, transactonsStatisticsMap);

                // Cleanly disconnect from the MQTT broker
                await this.disconnect();
                console.log('Disconnected from MQTT broker after successful message delivery.');

            } else {
                throw new Error('Failed to connect to MQTT broker.');
            }
        } catch (error) {
            // Error handling: log the error and update the transaction status
            console.error('Error during MQTT message delivery:', error.message);

            // Update transaction process with error information
            transactionProcessManagerInput.transaction.deliveryError = error.message;
            transactionProcessManagerInput.transaction.deliveryStatus = appEnumerations.TRANSACTION_STATUS_FAILED;

            // Log the failed transaction in the system
            this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction, transactonsStatisticsMap);

            return false; // Return false to indicate delivery failure
        }

        // Returning false to stop further queue processing
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
