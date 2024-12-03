import {v4 as uuidv4} from 'uuid';
import { FSClient } from '../../client/fs-client.mjs';
import { TransactionProcessManager } from './transactionProcessManager.mjs';
import Transaction from '../models/Transaction.mjs';
import { TransactionProcessorA } from './TransactionProcessorA.js';
import GlobalConfiguration from '../../GlobalConfiguration.mjs';

export class TransactionProcessorFS extends TransactionProcessorA{
    constructor(){
      super();
    }

    checkUndefined(value:any){
        return value === undefined ? '' : value ;
    }   

    async transactionProcessorPickup(transactionProcessManagerInput:TransactionProcessManager){
        const fsClient = new FSClient();
        const fileName = await fsClient.getOldestFile(transactionProcessManagerInput.configPickup.path);
        console.debug("File name from local disk recived is ", await fileName);
        //common params
        transactionProcessManagerInput.transaction.pickupTime = new Date().toISOString();

        if(fileName != null) {
              const message = await fsClient.readFile(`${transactionProcessManagerInput.configPickup.path}/${await fileName}`);
              await fsClient.deleteFile(`${transactionProcessManagerInput.configPickup.path}/${await fileName}`);
              transactionProcessManagerInput.transaction.pickupInboundMessageName = fileName;
              transactionProcessManagerInput.transaction.messageName = fileName;
              transactionProcessManagerInput.transaction.currentMessage = message;
              transactionProcessManagerInput.transaction.pickupPath = `${this.checkUndefined(transactionProcessManagerInput.configPickup.path)}`;
              transactionProcessManagerInput.transaction.pickupStatus = GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_COMPLETED;
              await this.storeMessage(transactionProcessManagerInput.transaction,transactionProcessManagerInput.messageStore,GlobalConfiguration.appEnumerations.STORAGE_PICKUP_INBOUND_MESSAGE);
              if(transactionProcessManagerInput.configProcessing === undefined || transactionProcessManagerInput.configProcessing === ''){
                    console.debug('No config processing defined, setting messageStore.setDeliveryOutboundMessage');
                    return true;
              }else{
                    return true;
                    //apply processing rules
              }
        }else{
               console.log('Writing Transaction : ', transactionProcessManagerInput.transaction.id);
               
              return false;
        }     
    }

    async transactionProcessorDelivery(transactionProcessManagerInput:TransactionProcessManager){
        const fsClient = new FSClient();
        transactionProcessManagerInput.transaction.messageName != '' ? transactionProcessManagerInput.transaction.deliveryOutboundMessageName  = transactionProcessManagerInput.transaction.messageName: transactionProcessManagerInput.transaction.deliveryOutboundMessageName = `${uuidv4()}`;
        await fsClient.writeFile(`${transactionProcessManagerInput.configDelivery.path}/${transactionProcessManagerInput.transaction.deliveryOutboundMessageName}`,`${transactionProcessManagerInput.transaction.currentMessage}`) ? transactionProcessManagerInput.transaction.deliveryStatus = 'SUCCESS':transactionProcessManagerInput.transaction.deliveryStatus = 'ERROR';
        await this.storeMessage(transactionProcessManagerInput.transaction,transactionProcessManagerInput.messageStore,GlobalConfiguration.appEnumerations.STORAGE_DELIVERY_OUTBOUND_MESSAGE);
        transactionProcessManagerInput.transaction.deliveryStatus = GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_COMPLETED;
        return true;
    }



    async setCommonPickupProcessingParameters(transaction:Transaction){
        
        return true;
    }
      
    async setCommonDeliveryProcessingParameters(transaction:Transaction){
        return true;
    }
   
}