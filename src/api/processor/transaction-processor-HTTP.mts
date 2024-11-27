import { HTTPClient } from "../../client/http-client.mjs";
import Transaction from "../models/Transaction.mjs";
import appEnumerations from "../utilities/severInitFunctions.mjs";
import { TransactionProcessManager } from "./transactionProcessManager.mjs";

export class TransactionProcessorHTTP {

    constructor(){

    }


    async transactionProcessorPickup(transactionProcessManagerInput:TransactionProcessManager){
        const baseURL = `${transactionProcessManagerInput.configPickup.port === 443}` 
        ? 
          `${transactionProcessManagerInput.configPickup.host}${transactionProcessManagerInput.configPickup.basePath}` 
        :
          `${transactionProcessManagerInput.configPickup.host}:${transactionProcessManagerInput.configPickup.port}${transactionProcessManagerInput.configPickup.basePath}`;
        console.debug(`Trying to fetch from ${baseURL}`);
        const headers: Record<string, string> = {};
        //add all headers if defined
      Object.keys(transactionProcessManagerInput.configPickup.headers).length > 0 ? Object.assign(headers,transactionProcessManagerInput.configPickup.headers):'';
      console.debug('HTTP Request Type : ',`${transactionProcessManagerInput.configPickup.method}-${transactionProcessManagerInput.configPickup.authenticationType}`.toUpperCase());
      console.debug('HTTP Request URL : ',baseURL);
      console.debug('HTTP request headers : ',headers);

      //common params
      transactionProcessManagerInput.transaction.pickupTime = new Date().toISOString();

      switch(`${transactionProcessManagerInput.configPickup.method}-${transactionProcessManagerInput.configPickup.authenticationType}`.toUpperCase()){
          case 'GET-NOAUTH':{
              try{ 
                  const httpClient = new HTTPClient(baseURL);
                  const response = await httpClient.get('', headers);
                  if (response === false) {
                      throw new Error("HTTP request failed");
                  }
                  const [responseFromHttpCall, statusCode] = response; // Safe to destructure if response is an array

                  console.log('responseFromHttpCall : ', await responseFromHttpCall);
                  console.log('statusCode : ', await statusCode);
                  transactionProcessManagerInput.transaction.currentMessage = responseFromHttpCall;
                  await this.storeMessage(transactionProcessManagerInput.transaction,transactionProcessManagerInput.messageStore,'PIM');
                  await this.setCommonPickupProcessingParameters(responseFromHttpCall,statusCode,baseURL,transactionProcessManagerInput.transaction);
              }catch(error:any){
                  //console.error("Unexpected error : ",error);
                  transactionProcessManagerInput.transaction.pickupError = error.message;
                  transactionProcessManagerInput.transaction.pickupStatus = appEnumerations.TRANSACTION_STATUS_FAILED;
                  return false;
                  
              }
              break;
          }
          case 'GET-BASICAUTHENTICATION':{
            try{
                  //in case of basic auth, set basic auth to headers
                  const credentials = btoa(`${transactionProcessManagerInput.configPickup.username}:${transactionProcessManagerInput.configPickup.password}`);
                  headers['Authorization'] = `Basic ${credentials}`

                  const httpClient = new HTTPClient(baseURL);
                  const response = await httpClient.get('', headers);
                  if (response === false) {
                      throw new Error("HTTP request failed");
                  }
                  const [responseFromHttpCall, statusCode] = response; // Safe to destructure if response is an array
                  console.log('responseFromHttpCall : ', await responseFromHttpCall);
                  console.log('statusCode : ', await statusCode);
                  transactionProcessManagerInput.transaction.currentMessage = responseFromHttpCall;
                  await this.storeMessage(transactionProcessManagerInput.transaction,transactionProcessManagerInput.messageStore,'PIM');
                  await this.setCommonPickupProcessingParameters(responseFromHttpCall,statusCode,baseURL,transactionProcessManagerInput.transaction);
            }catch(error:any){
                //console.error("Unexpected error : ",error);
                transactionProcessManagerInput.transaction.pickupError = error.message;
                transactionProcessManagerInput.transaction.pickupStatus = appEnumerations.TRANSACTION_STATUS_FAILED;
                return false;
                
            }
            break;
          }     
          default:{
              console.debug('No config found for http pickup processing.');
              return false;
          }
      }
      //await deliveryProcessingQueue.enqueue(transactionProcessManagerInput);
      
      return true;          
    }

  
    async checkUndefined(value:any){
        return value === undefined ? '' : value ;
    }

    async transactionProcessorDelivery(transactionProcessManagerInput:TransactionProcessManager){
        const baseURL = `${transactionProcessManagerInput.configDelivery.host}:${transactionProcessManagerInput.configDelivery.port}${transactionProcessManagerInput.configDelivery.basePath}`;
        console.debug(`Trying to send  to ${baseURL}`);
        const headers: Record<string, string> = {};
        //add all headers if defined
      Object.keys(transactionProcessManagerInput.configDelivery.headers).length > 0 ? Object.assign(headers,transactionProcessManagerInput.configDelivery.headers):'';
      console.debug('HTTP Request Type : ',`${transactionProcessManagerInput.configDelivery.method}-${transactionProcessManagerInput.configDelivery.authenticationType}`.toUpperCase());
      console.debug('HTTP Request URL : ',baseURL);
      console.debug('HTTP request headers : ',headers);

      //common params
      transactionProcessManagerInput.transaction.deliveryTime = new Date().toISOString();

      switch(`${transactionProcessManagerInput.configDelivery.method}-${transactionProcessManagerInput.configDelivery.authenticationType}`.toUpperCase()){
          case 'GET-NOAUTH':{
              try{ 
                  const httpClient = new HTTPClient(baseURL);
                  const response = await httpClient.get('', headers);
                  if (response === false) {
                      throw new Error("HTTP request failed");
                  }
                  const [responseFromHttpCall, statusCode] = response; // Safe to destructure if response is an array
                  console.log('responseFromHttpCall : ', await responseFromHttpCall);
                  console.log('statusCode : ', await statusCode);
                  transactionProcessManagerInput.transaction.currentMessage = responseFromHttpCall;
                  await this.storeMessage(transactionProcessManagerInput.transaction,transactionProcessManagerInput.messageStore,'DOM');
                  await this.setCommonDeliveryProcessingParameters(responseFromHttpCall,statusCode,baseURL,transactionProcessManagerInput.transaction); 
              }catch(error:any){
                  //console.error("Unexpected error : ",error);
                  transactionProcessManagerInput.transaction.deliveryProcessingError = error;
                  transactionProcessManagerInput.transaction.deliveryStatus = appEnumerations.TRANSACTION_STATUS_FAILED;
                  transactionProcessManagerInput.transaction.deliveryError = error.message;
                  return false;
                  
              }
              break;
          }
          case 'GET-BASICAUTHENTICATION':{
            try{
                //in case of basic auth, set basic auth to headers
                const credentials = btoa(`${transactionProcessManagerInput.configPickup.username}:${transactionProcessManagerInput.configPickup.password}`);
                headers['Authorization'] = `Basic ${credentials}`
                
                const httpClient = new HTTPClient(baseURL);
                  const response = await httpClient.get('', headers);
                  if (response === false) {
                      throw new Error("HTTP request failed");
                  }
                const [responseFromHttpCall, statusCode] = response; // Safe to destructure if response is an array
                console.log('responseFromHttpCall : ', await responseFromHttpCall);
                console.log('statusCode : ', await statusCode);
                transactionProcessManagerInput.transaction.currentMessage = responseFromHttpCall;
                await this.storeMessage(transactionProcessManagerInput.transaction,transactionProcessManagerInput.messageStore,'DOM');
                await this.setCommonDeliveryProcessingParameters(responseFromHttpCall,statusCode,baseURL,transactionProcessManagerInput.transaction);
            }catch(error:any){
                //console.error("Unexpected error : ",error);
                transactionProcessManagerInput.transaction.pickupProcessingError = error;
                transactionProcessManagerInput.transaction.deliveryStatus = appEnumerations.TRANSACTION_STATUS_FAILED;
                transactionProcessManagerInput.transaction.deliveryError = error.message;
                return false;
                
            }
            break;
          }
          case 'POST-NOAUTH':{
            try{ 
                const httpClient = new HTTPClient(baseURL);
                const response = await httpClient.post('',transactionProcessManagerInput.transaction.currentMessage,headers);
                if (response === false) {
                    throw new Error("HTTP request failed");
                }
                const [responseFromHttpCall, statusCode] = response; // Safe to destructure if response is an array

                console.log('responseFromHttpCall : ', await responseFromHttpCall);
                console.log('statusCode : ', await statusCode);
                transactionProcessManagerInput.transaction.currentMessage = responseFromHttpCall;
                await this.storeMessage(transactionProcessManagerInput.transaction,transactionProcessManagerInput.messageStore,'DOM');
                await this.setCommonDeliveryProcessingParameters(responseFromHttpCall,statusCode,baseURL,transactionProcessManagerInput.transaction);         
              }catch(error:any){
                //console.error("Unexpected error : ",error);
                transactionProcessManagerInput.transaction.deliveryProcessingError = error;
                transactionProcessManagerInput.transaction.deliveryStatus = appEnumerations.TRANSACTION_STATUS_FAILED;
                transactionProcessManagerInput.transaction.deliveryError = error.message;
                return false;
                
            }
            break;
        }
        case 'POST-BASICAUTHENTICATION':{
          try{
              //in case of basic auth, set basic auth to headers
              const credentials = btoa(`${transactionProcessManagerInput.configPickup.username}:${transactionProcessManagerInput.configPickup.password}`);
              headers['Authorization'] = `Basic ${credentials}`
              
              const httpClient = new HTTPClient(baseURL);
              const response = await httpClient.post('',transactionProcessManagerInput.transaction.currentMessage,headers);
              if (response === false) {
                  throw new Error("HTTP request failed");
              }
              const [responseFromHttpCall, statusCode] = response; // Safe to destructure if response is an array
              console.log('responseFromHttpCall : ', await responseFromHttpCall);
              console.log('statusCode : ', await statusCode);
              transactionProcessManagerInput.transaction.currentMessage = responseFromHttpCall;
              await this.storeMessage(transactionProcessManagerInput.transaction,transactionProcessManagerInput.messageStore,'DOM');
              await this.setCommonDeliveryProcessingParameters(responseFromHttpCall,statusCode,baseURL,transactionProcessManagerInput.transaction);
          }catch(error:any){
              //console.error("Unexpected error : ",error);
              transactionProcessManagerInput.transaction.pickupProcessingError = error;
              transactionProcessManagerInput.transaction.deliveryStatus = appEnumerations.TRANSACTION_STATUS_FAILED;
              transactionProcessManagerInput.transaction.deliveryError = error.message;
              return false;
              
          }
          break;
        }     
        default:{
            console.debug('No config found for http pickup processing.');
            return false;
        }
      }
      return true;
    }

    async setDeliveryStatusFromResponseCode(transaction:Transaction,statusCode:string){
      console.log('Number(statusCode)',Number(statusCode));
      const checkStatus = Number(statusCode);
      if( (200 <= checkStatus) && (checkStatus <= 299) ){
        transaction.deliveryStatus= appEnumerations.TRANSACTION_STATUS_COMPLETED;
      } else if((200 <= checkStatus) && (checkStatus <= 299)){
        transaction.deliveryStatus= appEnumerations.TRANSACTION_STATUS_FAILED;
      } else {
        transaction.deliveryStatus= appEnumerations.TRANSACTION_STATUS_FAILED;
      }
    }

    async setPickupStatusFromResponseCode(transaction:Transaction,statusCode:string){
      console.log('Number(statusCode)',Number(statusCode));
      const checkStatus = Number(statusCode);
      if( (200 <= checkStatus) && (checkStatus <= 299) ){
        transaction.pickupStatus= appEnumerations.TRANSACTION_STATUS_COMPLETED;
      } else if((200 <= checkStatus) && (checkStatus <= 299)){
        transaction.pickupStatus= appEnumerations.TRANSACTION_STATUS_FAILED;
      } else {
        transaction.pickupStatus= appEnumerations.TRANSACTION_STATUS_FAILED;
      }
      console.log('transaction.pickupStatus : ', transaction.pickupStatus);
    }


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


    async setCommonPickupProcessingParameters(responseFromHttpCall:any,statusCode:any,baseURL:string,transaction:Transaction){
      transaction.pickupStatusCode = statusCode;
      transaction.pickupPath = baseURL;
      await this.setPickupStatusFromResponseCode(transaction,statusCode);
      return true;
     
    }
    
    async setCommonDeliveryProcessingParameters(responseFromHttpCall:any,statusCode:any,baseURL:string,transaction:Transaction){
      transaction.deliveryStatusCode = statusCode;
      transaction.deliveryPath = baseURL;
      await this.setDeliveryStatusFromResponseCode(transaction,statusCode);
      return true;
    }
    
}