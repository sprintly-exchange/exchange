import appEnumerations from "../../api/utilities/severInitFunctions.mjs";

export function countFlowNamePerMinute(events) {
    const counts = {};
    events.forEach(entry => {
      const date = new Date(entry.processingTime);
      const minute = date.toISOString().substring(0, 16); // Format: "YYYY-MM-DDTHHMM"
  
      if (!counts[minute]) {
        counts[minute] = 0;
      }
  
      counts[minute]++;
    });
    
    return counts;

   
  }
  export function transactionSummary(events) {
    const counts = { 'SUCCESS': 0, 'FAILED': 0, 'INPROCESSING': 0 };
    
    events.forEach(entry => {
      if (entry.status === appEnumerations.TRANSACTION_STATUS_INPROCESSING ||
          entry.status === appEnumerations.TRANSACTION_STATUS_PROCESSING_PICKUP ||
          entry.status === appEnumerations.TRANSACTION_STATUS_PROCESSING_DELIVERY ||
          entry.status === appEnumerations.TRANSACTION_STATUS_PROCESSING_CONFIGURATIONS) {
        counts['INPROCESSING']++;
      } else {
        counts[entry.status]++;
      }
    });
  
    const summary = {
      total: `${events.length}`,
      failures: `${counts.FAILED}`,
      successes: `${counts.SUCCESS}`,
      inprocessing: `${counts.INPROCESSING}`,
    };
  
    return JSON.stringify(summary);
  }
  

  export function transactionSummaryWithTimeInMinutes(events) {
    const counts = {};
  
    events.forEach(entry => {
      const date = new Date(entry.processingTime);
      const minute = date.toISOString().substring(0, 16); // Format: "YYYY-MM-DDTHHMM"
      const status = entry.status;
  
      if (!counts[minute]) {
        counts[minute] = {};
      }

      if (!counts[minute][status]) {
        counts[minute][status] = 0;
      }
  
      counts[minute][status]++;
    });
  
    return counts;
  }


  export function countFlowsPerMinute(events) {
    const counts = {};
  
    events.forEach(entry => {
      const date = new Date(entry.processingTime);
      const minute = date.toISOString().substring(0, 16); // Format: "YYYY-MM-DDTHHMM"
      const flowName = entry.flowName;
  
      if (!counts[minute]) {
        counts[minute] = {};
      }

      if (!counts[minute][flowName]) {
        counts[minute][flowName] = 0;
      }
  
      counts[minute][flowName]++;
    });
  
    return counts;
  }

  export function countFlows(events) {
    const counts = {};
  
    events.forEach(entry => {
      const flowName = entry.flowName;
  
      if (!counts[flowName]) {
        counts[flowName] = 0;
      }
  
      counts[flowName]++;
    });
  
    return counts;
  }

  export function searchTranscationsBetweenDatesByEpochTime(start,end,events) {
    return events.filter((transaction) => {
      const transactionEpochTime = new Date(transaction.processingTime).getTime();
      if((start <= transactionEpochTime) && (transactionEpochTime <= end)){
        //console.debug('transaction.processingTime : ',transaction.processingTime);
        //console.debug('transaction.processingTime-epoch : ',transactionEpochTime);
        //console.debug('transaction search start time ',start);
        //console.debug('transaction search end time:',end);
        return transaction;
      }
      
    })
  }

  export function searcTransationSearchByIds(messageId, senderId, receiverId, events) {
    return events.filter((transaction) => {
      // Log for debugging purposes
      console.log('Searching for:', messageId, senderId, receiverId);
  
      // Check if the transaction's fields include the search values (wildcard search)
      const messageIdMatch = messageId ? (transaction.messageId && typeof transaction.messageId === 'string' && transaction.messageId.includes(messageId)) : true;
      const senderIdMatch = senderId ? (transaction.senderId && typeof transaction.senderId === 'string' && transaction.senderId.includes(senderId)) : true;
      const receiverIdMatch = receiverId ? (transaction.receiverId && typeof transaction.receiverId === 'string' && transaction.receiverId.includes(receiverId)) : true;
  
      // Return transactions that match any of the fields
      return messageIdMatch || senderIdMatch || receiverIdMatch;
    });
  }
  