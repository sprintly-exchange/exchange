import {TransactionProcessorHTTP} from "./transaction-processor-HTTP.mjs";
import { TransactionProcessorFS } from "./transaction-processor-FS.mjs";;
import { TransactionProcessorFTP } from "./transaction-processor-FTP.mjs";
import { TransactionProcessorSFTP } from "./transaction-processor-SFTP.mjs";
import { TransactionProcessorKAFKA } from "./transaction-processor-KAFKA.mjs";
import xmldom from "xmldom";

import { Transaction } from '../models/Transaction.mjs';
import { MessageStoreGeneric } from "../models/MessageStoreGeneric.mjs";
import { CommonTransactionUtils } from "./commonTransactionUtils.mjs";
import { TemplatePartner } from "../../custom-connections/templatePartner.mjs";
import appEnumerations from "../utilities/severInitFunctions.mjs";

//processing transactions
export class TransactionProcessManager{
      _STAGE_PICKUP='_STAGE_PICKUP';
      _STAGE_DELIVERY='_STAGE_CONFIG_PROCESSING';
      _STAGE_PROCESSING='_STAGE_DELIVERY';

      transactionProcessorHTTP;
      transactionProcessorFS;
      trasactionProcessorKAFKA;
      
      messageStore;
      transaction;
      configPickup;
      configDelivery;
      configProcessing;
      flowName;
      transactionProcessManagerStage;
      commonTransactionUtils;
      configurationFlow;

      constructor(configPickup,configDelivery,configProcessing,configurationFlow){
            this.transactionProcessorHTTP = new TransactionProcessorHTTP();
            this.transactionProcessorFS = new TransactionProcessorFS();
            this.transactionProcessorFTP = new TransactionProcessorFTP();
            this.trasactionProcessorKAFKA = new TransactionProcessorKAFKA();
            

            this.configPickup = configPickup;
            this.configDelivery = configDelivery;
            this.configProcessing =  configProcessing;
            this.configurationFlow = configurationFlow;
            this.flowName = configurationFlow.flowName;
            this.messageStore = new MessageStoreGeneric("FS");
            this.commonTransactionUtils = new CommonTransactionUtils();

            try{
                  this.transaction = new Transaction(
                        new Date().toISOString(),
                        '',
                        configPickup.id,
                        configPickup.protocol,
                        configPickup.host,
                        configPickup.port,
                        configPickup.connectionName,
                        configDelivery.id,
                        configDelivery.protocol,
                        configDelivery.host,
                        configDelivery.port,
                        configDelivery.connectionName,
                        0,
                        0,
                        0,
                        configurationFlow.flowName,
                        configurationFlow.organizationId,

                  );
                  
            
            } catch(error) {
                        console.error('Error processing record flowName: ', flowName);
                        console.error('Error processing record configDelivery: ', configDelivery);
                        console.error('Error processing record configProcessing:  ', configProcessing);
                        console.error('Error processing record configPickup: ', configPickup);
                        return;
            }
            
      }

      async processPickup(){
            this.transactionProcessManagerStage = this._STAGE_PICKUP;
            this.transaction.status = appEnumerations.TRANSACTION_STATUS_PROCESSING_PICKUP;
            switch(this.configPickup.protocol){
                  //Pickup from file connector from localhost
                  case 'FS': {
                        await this.transactionProcessorFS.transactionProcessorPickup(this);
                        this.commonTransactionUtils.addTransaction(this.transaction);   
                        await configurationProcessingQueue.enqueue(this); 
                        break;   
                  } 
                   //Pikcup from http GET request
                  case 'HTTP': {
                        await this.transactionProcessorHTTP.transactionProcessorPickup(this)
                        this.commonTransactionUtils.addTransaction(this.transaction);  
                        await configurationProcessingQueue.enqueue(this);   
                        break; 
                  }           
                  case 'FTP': {
                        //flow name is required as this is handled in seperate way
                        await this.transactionProcessorFTP.transactionProcessorPickup(this);
                        
                        //new transaction is created and added from ftp processor for each file from ftp server
                        // no need to log a transaction in this level simialr to HTTP
                        break;
                  }
                  case 'KAFKA': {
                        //flow name is required as this is handled in seperate way
                        await this.trasactionProcessorKAFKA.transactionProcessorPickup(this);
                        //new transaction is created and added from kafka processor for each message from kafka server
                        // no need to log a transaction in this level simialr to HTTP
                        break;
                  }
                  default:
        
            } 

      }

      async configurationProcessing() {
            this.transactionProcessManagerStage = this._STAGE_CONFIG_PROCESSING;
            this.transaction.status = appEnumerations.TRANSACTION_STATUS_PROCESSING_CONFIGURATIONS;
            //console.log(this.configProcessing);
            if(this.configProcessing && this.configProcessing.code){
                  // Decode the base64 encoded code to a string
                  //const decodedCode = atob(this.configProcessing.code);
                  const decodedCode = Buffer.from(this.configProcessing.code, 'base64').toString('utf-8');
                  //console.log('Decoded Code:', decodedCode); // Debugging statement to see the decoded code
            
                  try {
                  // Use Function constructor to create a new function from the decoded code
                  const generatedObject = new Function(`return ${decodedCode}`)();
                  //console.log('Generated Object:', generatedObject);
                  //console.log('Method from Object:', generatedObject.method);
            
                  // Check if generatedObject is defined and has a method to execute
                  if (generatedObject && typeof generatedObject.method === 'function') {
                        console.log('Method is a function and will be executed.');
            
                        this.commonTransactionUtils.addTransaction(this.transaction);
                        await deliveryProcessingQueue.enqueue(this);
            
                        // Execute the method
                        const result = await generatedObject.method(this);
                        console.log('Method executed successfully:', result);
                        //return result; // Return result if needed
                  } else {
                        console.error('Generated object does not have a valid method to execute.');
                  }
                  } catch (error) {
                  console.error('Error executing processing transformation:', error);
                  // Handle error accordingly, maybe return a default value or rethrow
                  return false;
                  }
            }else {
                  await deliveryProcessingQueue.enqueue(this);
            }
            
        }
        
        

      
      async processDelivery(){
            this.transactionProcessManagerStage = this._STAGE_DELIVERY;
            this.transaction.status = appEnumerations.TRANSACTION_STATUS_PROCESSING_DELIVERY;
            switch(this.configDelivery.protocol){
                  //Delviery to localhost through file connector
                  case 'FS': {
                        await this.transactionProcessorFS.transactionProcessorDelivery(this);
                        this.commonTransactionUtils.addTransaction(this.transaction); 
                        break;
                  }
                  //Delivery to HTTP POST
                  case 'HTTP': {
                        await this.transactionProcessorHTTP.transactionProcessorDelivery(this);
                        this.commonTransactionUtils.addTransaction(this.transaction); 
                        break;
                  } 
                  case 'FTP': {
                        //flow name is required as this is handled in seperate way
                        await this.transactionProcessorFTP.transactionProcessorDelivery(this);
                        this.commonTransactionUtils.addTransaction(this.transaction); 
                        break;
                  }                  
                  case 'KAFKA': {
                        //flow name is required as this is handled in seperate way
                        await this.trasactionProcessorKAFKA.transactionProcessorDelivery(this);
                        // no need to log a transaction in this level simialr to HTTP
                        break;
                  }
                  
                  case 'HTTPS':
                        break;
                  default:
                        
            }

            switch(this.configDelivery.connectionId){
                  case 'connectionIDPartnerTemplate' : {
                        const templatePartener = new TemplatePartner();
                        //to do...
                        this.commonTransactionUtils.addTransaction(this.transaction);
                        break;
                  }
                  default: {
                        break;
                  }
            }
      }

      async setTransaction(transaction){
            this.transaction = transaction;
      }
}