import { TransactionProcessManager } from "./transactionProcessManager.mjs";
import { TransactionProcessorI } from "./TransactionProcessorI.mjs";
import Transaction from '../models/Transaction.mjs';
import GlobalConfiguration from "../../GlobalConfiguration.mjs";

export abstract class TransactionProcessorA implements TransactionProcessorI {
    constructor(){
    }

    abstract transactionProcessorDelivery(transactionProcessManagerInput: TransactionProcessManager): Promise<boolean>;
    abstract transactionProcessorPickup(transactionProcessManagerInput: TransactionProcessManager): Promise<boolean>;

    async storeMessage(transaction:Transaction,messageStore:any,leg:string) {
        console.log('Trying to store message HTTP : ',transaction.currentMessage);
        switch(leg){
          case GlobalConfiguration.appEnumerations.STORAGE_PICKUP_INBOUND_MESSAGE: {
            [transaction.pickupInboundMessagePath,transaction.pickupInboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
            break;
          }
          case GlobalConfiguration.appEnumerations.STORAGE_PICKUP_OUTBOUND_MESSAGE : {
            [transaction.pickupOutboundMessagePath,transaction.pickupOutboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
            break;
          }
          case GlobalConfiguration.appEnumerations.STORAGE_DELIVERY_INBOUND_MESSAGE : {
            [transaction.deliveryInboundMessagePath,transaction.deliveryInboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
            break;
          }
          case GlobalConfiguration.appEnumerations.STORAGE_DELIVERY_OUTBOUND_MESSAGE : {
            [transaction.deliveryOutboundMessagePath,transaction.deliveryOutboundMessageSize] = await messageStore.storeMessage(transaction.currentMessage);
            break;
          } default : {
  
          }
        }
          
        return true;
      }
}