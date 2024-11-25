import GlobalConfiguration from "../../GlobalConfiguration";
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
              
        //console.log('Transaction Id : ',transaction.id);
        //console.log('Flow Name : ',transaction.flowName);
        //console.log('Transaction Pickup Status : ',transaction.pickupStatus);
        //console.log('Transaction Delivery Status : ',transaction.deliveryStatus);
        //console.log('Transaction Overall Status : ',transaction.status);
        //console.log('Transaction organizationId : ',transaction.organizationId);
        const redactedTransaction={};
        Object.assign(redactedTransaction,transaction);
        if ('currentMessage' in redactedTransaction) {
            delete redactedTransaction.currentMessage;
         }
         if ('id' in redactedTransaction && typeof redactedTransaction.id === 'string') {
            GlobalConfiguration.transactionsStatisticsMap.set(redactedTransaction.id, redactedTransaction);
        }
        console.debug(`Number of total transactions : ${GlobalConfiguration.transactonsStatisticsMap.size}`);
      }
}
