import { v4 as uuidv4 } from 'uuid';
import { copyFileSync, promises as fs } from 'fs';
import os from 'os';
import mqtt from 'mqtt';
import appEnumerations from '../utilities/severInitFunctions.mjs';
import { CommonTransactionUtils } from './commonTransactionUtils.mjs';

export class TransactionProcessorMQTT {
    client;
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

    // Connect to the MQTT broker
    async connect(config) {
        const  options = {
            host: config.host,
            port: Number(config.port),
            protocol: config.protocol.toLowerCase(),
            username: config.userName,
            password: config.password,
            clientId: config.clientId,
        };
        
        Object.assign(config,options);

        // initialize the MQTT client
        this.client = mqtt.connect(config);


        return new Promise((resolve, reject) => {
            this.client.on('connect', () => {
                console.log('Connected to MQTT broker');
                resolve(true);
            });

            this.client.on('error', (error) => {
                console.error('Connection error:', error);
                reject(false);
            });
        });
    }

    // Subscribe and receive messages from a topic
    async subscribeAndReceive(topic) {
        return new Promise((resolve, reject) => {
            this.client.subscribe(topic, (error) => {
                if (error) {
                    return reject(error);
                }

                console.log(`Subscribed to topic: ${topic}`);
                this.client.on('message', (topic, message) => {
                    resolve({ topic, content: message.toString() });
                });
            });
        });
    }

    // Publish a message to a topic
    async publish(topic, message) {
        return new Promise((resolve, reject) => {
            this.client.publish(topic, message, {}, (error) => {
                if (error) {
                    return reject(error);
                }
                console.log(`Message published to ${topic}: ${message}`);
                resolve(true);
            });
        });
    }

    // Disconnect from the MQTT broker
    async disconnect() {
        return new Promise((resolve) => {
            this.client.end(true, () => {
                console.log('Disconnected from MQTT broker');
                resolve();
            });
        });
    }

    // Method to handle message pickup from MQTT
    async transactionProcessorPickup(transactionProcessManagerInput) {
        try {
            console.log('XXXXXXXXXXXXXXXXXXXXXXXXXX');
            const config = transactionProcessManagerInput.configPickup;
            const  options = {
                host: config.host,
                port: Number(config.port),
                protocol: config.protocol.toLowerCase(),
                username: config.userName,
                password: config.password,
                clientId: config.clientId,
            };
            
            Object.assign(config,options);
           
            // initialize the MQTT client
            this.client = mqtt.connect(config);
            const connected = await this.retryOperation(() => this.connect(config));

            if (connected) {
                console.log('Connected to MQTT for pickup.');

                const messageList = await this.retryOperation(() => this.subscribeAndReceive(config.topic));
                console.log('Received messages from MQTT:', messageList);

                const childTransaction = {};
                Object.assign(childTransaction, transactionProcessManagerInput.transaction);
                childTransaction.pickupPath = `mqtt://${config.brokerUrl}/${config.topic}`;
                childTransaction.id = uuidv4();
                childTransaction.currentMessage = messageList.content;

                // Set transaction metadata
                childTransaction.messageName = `MQTT_Message_${uuidv4()}`;
                childTransaction.processingTime = new Date().toISOString();
                childTransaction.pickupTime = new Date().toISOString();
                childTransaction.pickupStatus = appEnumerations.TRANSACTION_STATUS_COMPLETED;

                // Store the message and handle post-pickup actions
                await this.storeMessage(childTransaction, transactionProcessManagerInput.messageStore, 'PIM');
                this.commonTransactionUtils.addTransaction(childTransaction, transactonsStatisticsMap);

                const transactionProcessManager = new TransactionProcessManager(
                    transactionProcessManagerInput.configPickup,
                    transactionProcessManagerInput.configDelivery,
                    transactionProcessManagerInput.configProcessing,
                    transactionProcessManagerInput.configurationFlow
                );

                await transactionProcessManager.setTransaction(childTransaction);
                await configurationProcessingQueue.enqueue(transactionProcessManager);
            } else {
                transactionProcessManagerInput.transaction.pickupStatus = appEnumerations.TRANSACTION_STATUS_FAILED;
                this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction, transactonsStatisticsMap);
            }
        } catch (error) {
            console.log('Error processing from MQTT:', error);
            transactionProcessManagerInput.transaction.pickupError = error.message;
            transactionProcessManagerInput.transaction.pickupStatus = appEnumerations.TRANSACTION_STATUS_FAILED;
            this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction, transactonsStatisticsMap);
            return false;
        } finally {
            await this.disconnect(); // Ensure the MQTT connection is closed
        }

        // Returning false to stop adding this to the delivery queue from parent classes.
        return false;
    }

    // Method to handle message delivery to MQTT
    async transactionProcessorDelivery(transactionProcessManagerInput) {
        try {
            const config = transactionProcessManagerInput.configDelivery;
            const connected = await this.retryOperation(() => this.connect(config));
            
            if (connected) {
                await this.publish(config.topic, transactionProcessManagerInput.transaction.currentMessage);
                // Additional delivery logic can go here...
                transactionProcessManagerInput.transaction.deliveryTime = new Date().toISOString();
                transactionProcessManagerInput.transaction.deliveryStatus = appEnumerations.TRANSACTION_STATUS_COMPLETED;
                
                this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction, transactonsStatisticsMap);
            }
        } catch (error) {
            console.log('Error sending message to MQTT:', error);
            transactionProcessManagerInput.transaction.deliveryError = error.message;
            transactionProcessManagerInput.transaction.deliveryStatus = appEnumerations.TRANSACTION_STATUS_FAILED;
            this.commonTransactionUtils.addTransaction(transactionProcessManagerInput.transaction, transactonsStatisticsMap);
            return false;
        } finally {
            await this.disconnect(); // Ensure the MQTT connection is closed
        }

        // Returning false to stop adding this to the delivery queue from parent classes.
        return false;
    }

    async storeMessage(transaction, messageStore, leg) {
        switch (leg) {
            case 'PIM': {
                [transaction.pickupInboundMessagePath, transaction.pickupInboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
                break;
            }
            case 'POM': {
                [transaction.pickupOutboundMessagePath, transaction.pickupOutboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
                break;
            }
            case 'DIM': {
                [transaction.deliveryInboundMessagePath, transaction.deliveryInboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
                break;
            }
            case 'DOM': {
                [transaction.deliveryOutboundMessagePath, transaction.deliveryOutboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
                break;
            }
            default: {
                // Handle default case if necessary
            }
        }

        return true;
    }
}
