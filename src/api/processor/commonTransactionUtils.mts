import GlobalConfiguration from "../../GlobalConfiguration.mjs";
import Transaction from "../models/Transaction.mjs";
import { CommonFunctions } from "../models/CommonFunctions.mjs";

export class CommonTransactionUtils {


      constructor(){
            //
      }

       async addTransaction(transaction:Transaction){
        if(transaction.pickupStatus ===  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_COMPLETED && transaction.deliveryStatus ===  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_COMPLETED ){
            transaction.status =  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_SUCCESS;
        }       
        else if(transaction.pickupStatus ===  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_FAILED || transaction.deliveryStatus ===  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_FAILED  ){
              transaction.status =  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_FAILED;//Handle later when transactions are set to processing state
        }   
        else if(transaction.pickupStatus ===  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_PROCESSING_PICKUP || transaction.deliveryStatus ===  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_PROCESSING_DELIVERY ){
              transaction.status =  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_INPROCESSING;//Handle later when transactions are set to processing state
        }   
        else {
              //transaction.status =  GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_FAILED;
        }
              
        const redactedTransaction={};
        Object.assign(redactedTransaction,transaction);
        if ('currentMessage' in redactedTransaction) {
            delete redactedTransaction.currentMessage;
         }
         if ('id' in redactedTransaction && typeof redactedTransaction.id === 'string') {
            CommonFunctions.logWithTimestamp(`Trasnaction added with id : ${redactedTransaction.id}`);
            CommonFunctions.logWithTimestamp(`Number of total transactions : ${GlobalConfiguration.transactionsStatisticsMap.size}`);
            GlobalConfiguration.transactionsStatisticsMap.set(redactedTransaction.id, redactedTransaction);
            
        }
        
      }
}
