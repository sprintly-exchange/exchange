import GlobalConfiguration from "../../GlobalConfiguration.mjs";
import Transaction from "../models/Transaction.mjs";
import appEnumerations from "../utilities/severInitFunctions.mjs";

export class CommonTransactionUtils {

      constructor(){
            //
      }

      async addTransaction(transaction:Transaction){
            //console.log('Transaction Pickup Status  XXX : ',transaction.pickupStatus);
            //console.log('Transaction Delivery Status XXX : ',transaction.deliveryStatus);
            //console.debug(transaction);  
        if(transaction.pickupStatus === appEnumerations.TRANSACTION_STATUS_COMPLETED && transaction.deliveryStatus === appEnumerations.TRANSACTION_STATUS_COMPLETED ){
            //console.log('XXXXXX', 'both completed');
            transaction.status = appEnumerations.TRANSACTION_STATUS_SUCCESS;
        }       
        else if(transaction.pickupStatus === appEnumerations.TRANSACTION_STATUS_FAILED || transaction.deliveryStatus === appEnumerations.TRANSACTION_STATUS_FAILED  ){
              transaction.status = appEnumerations.TRANSACTION_STATUS_FAILED;//Handle later when transactions are set to processing state
        }   
        else if(transaction.pickupStatus === appEnumerations.TRANSACTION_STATUS_PROCESSING_PICKUP || transaction.deliveryStatus === appEnumerations.TRANSACTION_STATUS_PROCESSING_DELIVERY ){
              transaction.status = appEnumerations.TRANSACTION_STATUS_INPROCESSING;//Handle later when transactions are set to processing state
        }   
        else {
              //transaction.status = appEnumerations.TRANSACTION_STATUS_FAILED;
        }
              
        const redactedTransaction={};
        Object.assign(redactedTransaction,transaction);
        if ('currentMessage' in redactedTransaction) {
            delete redactedTransaction.currentMessage;
         }
         if ('id' in redactedTransaction && typeof redactedTransaction.id === 'string') {
            console.debug(`Trasnaction added with id : ${redactedTransaction.id}`);
            console.debug(`Number of total transactions : ${GlobalConfiguration.transactionsStatisticsMap.size}`);
            GlobalConfiguration.transactionsStatisticsMap.set(redactedTransaction.id, redactedTransaction);
            
        }
        
      }
}