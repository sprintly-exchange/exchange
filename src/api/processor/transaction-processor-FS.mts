import {v4 as uuidv4} from 'uuid';
import { FSClient } from '../../client/fs-client.mjs';

export class TransactionProcessorFS {
    constructor(){

    }

    checkUndefined(value){
        return value === undefined ? '' : value ;
    }   

    async transactionProcessorPickup(transactionProcessManagerInput){
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
              transactionProcessManagerInput.transaction.pickupStatus = 'COMPLETED';
              await this.storeMessage(transactionProcessManagerInput.transaction,transactionProcessManagerInput.messageStore,'PIM');
              if(transactionProcessManagerInput.configProcessing === undefined || transactionProcessManagerInput.configProcessing === ''){
                    console.debug('No config processing defined, setting messageStore.setDeliveryOutboundMessage');
                    return true;
              }else{
                    //apply processing rules
              }
        }else{
               console.log('Writing Transaction : ', transactionProcessManagerInput.transaction.id);
               
              return false;
        }     
    }

    async transactionProcessorDelivery(transactionProcessManagerInput){
        const fsClient = new FSClient();
        transactionProcessManagerInput.transaction.messageName != '' ? transactionProcessManagerInput.transaction.deliveryOutboundMessageName  = transactionProcessManagerInput.transaction.messageName: transactionProcessManagerInput.transaction.deliveryOutboundMessageName = `${uuidv4()}`;
        await fsClient.writeFile(`${transactionProcessManagerInput.configDelivery.path}/${transactionProcessManagerInput.transaction.deliveryOutboundMessageName}`,`${transactionProcessManagerInput.transaction.currentMessage}`) ? transactionProcessManagerInput.transaction.deliveryStatus = 'SUCCESS':transactionProcessManagerInput.transaction.deliveryStatus = 'ERROR';
        await this.storeMessage(transactionProcessManagerInput.transaction,transactionProcessManagerInput.messageStore,'DOM');
        transactionProcessManagerInput.transaction.deliveryStatus = 'COMPLETED';
    }

    async storeMessage(transaction,messageStore,leg) {
      switch(leg){
        case 'PIM' : {
          [transaction.pickupInboundMessagePath,transaction.pickupInboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
          break;
        }
        case 'POM' : {
          [transaction.pickupOutboundMessagePath,transaction.pickupOutboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
          break;
        }
        case 'DIM' : {
          [transaction.deliveryInboundMessagePath,transaction.deliveryInboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
          break;
        }
        case 'DOM' : {
          [transaction.deliveryOutboundMessagePath,transaction.deliveryOutboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
          break;
        } default : {

        }
      }
        
      return true;
    }


    async setCommonPickupProcessingParameters(transaction){
        
        return true;
    }
      
    async setCommonDeliveryProcessingParameters(transaction){
        return true;
    }
   
}