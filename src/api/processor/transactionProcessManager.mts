import {TransactionProcessorHTTP} from "./transaction-processor-HTTP.mjs";
import { TransactionProcessorFS } from "./transaction-processor-FS.mjs";;
import { TransactionProcessorFTP } from "./transaction-processor-FTP.mjs";
import xmldom from "xmldom";

import { Transaction } from '../models/Transaction.mjs';
import { MessageStoreGeneric } from "../models/MessageStoreGeneric.mjs";
import { CommonTransactionUtils } from "./commonTransactionUtils.mjs";
import GlobalConfiguration from "../../GlobalConfiguration.mjs";
import { CommonFunctions } from "../models/CommonFunctions.mjs";

//processing transactions
export class TransactionProcessManager{
      _STAGE_PICKUP='_STAGE_PICKUP';
      _STAGE_DELIVERY='_STAGE_DELIVERY';
      _STAGE_PROCESSING='_STAGE_CONFIG_PROCESSING';

      transactionProcessorHTTP;
      transactionProcessorFS;
      transactionProcessorFTP;
      
      messageStore;
      transaction;
      configPickup;
      configDelivery;
      configProcessing;
      flowName;
      transactionProcessManagerStage:any;
      commonTransactionUtils;
      configurationFlow;

      constructor(configPickup:any,configDelivery:any,configProcessing:any,configurationFlow:any){
            this.transactionProcessorHTTP = new TransactionProcessorHTTP();
            this.transactionProcessorFS = new TransactionProcessorFS();
            this.transactionProcessorFTP = new TransactionProcessorFTP();
            

            this.configPickup = configPickup;
            this.configDelivery = configDelivery;
            this.configProcessing =  configProcessing;
            this.configurationFlow = configurationFlow;
            this.flowName = configurationFlow.flowName;
            this.messageStore = new MessageStoreGeneric("FS");
            this.commonTransactionUtils = new CommonTransactionUtils();
           
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
            

            
      }

      async processPickup(){
            this.transactionProcessManagerStage = this._STAGE_PICKUP;
            this.transaction.status =  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_PROCESSING_PICKUP;
            CommonFunctions.logWithTimestamp('Processing pickup : ', this.transaction.id);
            switch(this.configPickup.protocol){
                  //Pickup from file connector from localhost
                  case GlobalConfiguration.appEnumerations.COMMUNICATION_PROTOCOL_TYPE_FS: {
                        await this.transactionProcessorFS.transactionProcessorPickup(this);
                        this.commonTransactionUtils.addTransaction(this.transaction);   
                        await GlobalConfiguration.configurationProcessingQueue.enqueue(this); 
                        break;   
                  } 
                   //Pikcup from http GET request
                  case GlobalConfiguration.appEnumerations.COMMUNICATION_PROTOCOL_TYPE_HTTP: {
                        await this.transactionProcessorHTTP.transactionProcessorPickup(this)
                        this.commonTransactionUtils.addTransaction(this.transaction);  
                        await GlobalConfiguration.configurationProcessingQueue.enqueue(this);   
                        break; 
                  }           
                  case GlobalConfiguration.appEnumerations.COMMUNICATION_PROTOCOL_TYPE_FTP: {
                        //flow name is required as this is handled in seperate way
                        await this.transactionProcessorFTP.transactionProcessorPickup(this);
                        
                        //new transaction is created and added from ftp processor for each file from ftp server
                        // no need to log a transaction in this level simialr to HTTP
                        break;
                  }
                  default:
        
            } 

      }

      async configurationProcessing() {
            this.transactionProcessManagerStage = this._STAGE_PROCESSING;
            this.transaction.status =  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_PROCESSING_CONFIGURATIONS;
            CommonFunctions.logWithTimestamp('Processing configuration : ', this.transaction.id);

            //CommonFunctions.logWithTimestamp(this.configProcessing);
            if(this.configProcessing && this.configProcessing.code){
                  // Decode the base64 encoded code to a string
                  //const decodedCode = atob(this.configProcessing.code);
                  const decodedCode = Buffer.from(this.configProcessing.code, 'base64').toString('utf-8');
                  //CommonFunctions.logWithTimestamp('Decoded Code:', decodedCode); // Debugging statement to see the decoded code
            
                  try {
                  // Use Function constructor to create a new function from the decoded code
                  const generatedObject = new Function(`return ${decodedCode}`)();
                  //CommonFunctions.logWithTimestamp('Generated Object:', generatedObject);
                  //CommonFunctions.logWithTimestamp('Method from Object:', generatedObject.method);
            
                  // Check if generatedObject is defined and has a method to execute
                  if (generatedObject && typeof generatedObject.method === 'function') {
                        CommonFunctions.logWithTimestamp('Method is a function and will be executed.');
            
                        this.commonTransactionUtils.addTransaction(this.transaction);
                        await GlobalConfiguration.deliveryProcessingQueue.enqueue(this);
            
                        // Execute the method
                        const result = await generatedObject.method(this);
                        CommonFunctions.logWithTimestamp('Method executed successfully:', result);
                        //return result; // Return result if needed
                  } else {
                        CommonFunctions.logWithTimestamp('Generated object does not have a valid method to execute.');
                  }
                  } catch (error:any) {
                  this.transaction.configurationProcessingError=error.toString();
                  this.commonTransactionUtils.addTransaction(this.transaction);
                  CommonFunctions.logWithTimestamp('Error executing processing transformation:', error);
                  // Handle error accordingly, maybe return a default value or rethrow
                  return false;
                  }
            }else {
                  await GlobalConfiguration.deliveryProcessingQueue.enqueue(this);
            }
            
        }
        
        

      
      async processDelivery(){
            this.transactionProcessManagerStage = this._STAGE_DELIVERY;
            this.transaction.status =  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_PROCESSING_DELIVERY;
            CommonFunctions.logWithTimestamp('Processing delivery : ', this.transaction.id);
            switch(this.configDelivery.protocol){
                  //Delviery to localhost through file connector
                  case GlobalConfiguration.appEnumerations.COMMUNICATION_PROTOCOL_TYPE_FS: {
                        await this.transactionProcessorFS.transactionProcessorDelivery(this);
                        this.commonTransactionUtils.addTransaction(this.transaction); 
                        break;
                  }
                  //Delivery to HTTP POST
                  case GlobalConfiguration.appEnumerations.COMMUNICATION_PROTOCOL_TYPE_HTTP: {
                        CommonFunctions.logWithTimestamp('********** HTTP DELIVERY');
                        await this.transactionProcessorHTTP.transactionProcessorDelivery(this);
                        this.commonTransactionUtils.addTransaction(this.transaction); 
                        break;
                  } 
                  case GlobalConfiguration.appEnumerations.COMMUNICATION_PROTOCOL_TYPE_FTP: {
                        //flow name is required as this is handled in seperate way
                        CommonFunctions.logWithTimestamp('********** FTP DELIVERY');
                        await this.transactionProcessorFTP.transactionProcessorDelivery(this);
                        this.commonTransactionUtils.addTransaction(this.transaction); 
                        break;
                  }
                  
                  case 'HTTPS':
                        break;
                  default:
                        
            }
      }

      async setTransaction(transaction:any){
            this.transaction = transaction;
      }
}