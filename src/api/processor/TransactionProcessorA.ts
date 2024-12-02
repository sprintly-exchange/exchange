import { TransactionProcessManager } from "./transactionProcessManager.mjs";
import { TransactionProcessorI } from "./TransactionProcessorI";
import Transaction from '../models/Transaction.mjs';

export abstract class TransactionProcessorA implements TransactionProcessorI {
    constructor(){
    }

    abstract transactionProcessorDelivery(transactionProcessManagerInput: TransactionProcessManager): Promise<boolean>;
    abstract transactionProcessorPickup(transactionProcessManagerInput: TransactionProcessManager): Promise<boolean>;

    async storeMessage(transaction:Transaction,messageStore:any,leg:string) {
        console.log('Trying to store message HTTP : ',transaction.currentMessage);
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
}