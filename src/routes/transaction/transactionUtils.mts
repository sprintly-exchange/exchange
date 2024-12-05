import Transaction from "../../api/models/Transaction.mjs";
import GlobalConfiguration from "../../GlobalConfiguration.mjs";
import { CommonFunctions } from '../../api/models/CommonFunctions.mjs';

export function countFlowNamePerMinute(events: any): any {
  const counts: Record<string, number> = {};

  events.forEach((entry:any):any => {
      const date = new Date(entry.processingTime);
      const minute = date.toISOString().substring(0, 16) + "Z"; // Format: "YYYY-MM-DDTHH:MM"

      if (!counts[minute]) {
          counts[minute] = 0;
      }

      counts[minute]++;
  });

  return counts;
}
  


export function transactionSummary(events:any) {
    if (!events || typeof events.forEach !== 'function') {
      console.error("Invalid 'events' provided:", events);
      return { total: '0', failures: '0', successes: '0', inprocessing: '0' };
    }
  
    const counts = { SUCCESS: 0, FAILED: 0, INPROCESSING: 0 };
  
    events.forEach((entry:any) => {
      if (
        entry.status === GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_INPROCESSING ||
        entry.status === GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_PROCESSING_PICKUP ||
        entry.status === GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_PROCESSING_DELIVERY ||
        entry.status === GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_PROCESSING_CONFIGURATIONS
      ) {
        counts.INPROCESSING++;
      } else if (entry.status === GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_SUCCESS) {
        counts.SUCCESS++;
      } else if (entry.status === GlobalConfiguration.appEnumerations.TRANSACTION_STATUS_FAILED) {
        counts.FAILED++;
      }
    });
  
    const summary = {
      total: `${events.size ? events.size : 0}`,
      failures: `${counts.FAILED}`,
      successes: `${counts.SUCCESS}`,
      inprocessing: `${counts.INPROCESSING}`,
    };
  
    CommonFunctions.logWithTimestamp('Transaction Summary:', summary);
    return summary;
  }
  
  

  export function transactionSummaryWithTimeInMinutes(events: any): any {
    const counts: Record<string, Record<string, number>> = {};

    // Step 1: Count existing events per minute and status
    events.forEach((entry:any) => {
        const date = new Date(entry.processingTime);
        const minute = date.toISOString().substring(0, 16) + "Z"; // Format: "YYYY-MM-DDTHH:MM"
        const status = entry.status;

        if (!counts[minute]) {
            counts[minute] = {};
        }

        if (!counts[minute][status]) {
            counts[minute][status] = 0;
        }

        counts[minute][status]++;
    });

    // Step 2: Find the earliest processing time in events (firstEntryTime)
    const firstEntryTime = new Date(
        Math.min(...events.map((entry:any) => new Date(entry.processingTime).getTime()))
    );

    // Step 3: Get all unique statuses
    const allStatuses = [...new Set(events.map((entry:any) => entry.status))];

    // Step 4: Fill missing minutes with counts of 0 up to the current time
    const currentTime = new Date();
    let currentMinute = new Date(firstEntryTime);

    while (currentMinute <= currentTime) {
        const minuteKey = currentMinute.toISOString().substring(0, 16) + "Z";

        if (!counts[minuteKey]) {
            counts[minuteKey] = {};
        }

        allStatuses.forEach((status:any) => {
            if (!counts[minuteKey][status]) {
                counts[minuteKey][status] = 0;
            }
        });

        currentMinute.setMinutes(currentMinute.getMinutes() + 1);
    }

    //sort by minute
    const sortedCounts = Object.fromEntries(
        Object.entries(counts)
          .sort(([minuteKeyA], [minuteKeyB]) => {
            // Compare keys as ISO 8601 strings, which sort lexicographically in time order
            return minuteKeyA.localeCompare(minuteKeyB);
          })
      );
      
    

    return sortedCounts;
}

  
  

  
  export function countFlowsPerMinute(events: any): any {
    const counts: Record<string, Record<string, number>> = {};

    // Step 1: Count existing events per minute
    events.forEach((entry:any) => {
        const date = new Date(entry.processingTime);
        const minute = date.toISOString().substring(0, 16) + "Z"; // Format: "YYYY-MM-DDTHH:MM"
        const flowName = entry.flowName;

        if (!counts[minute]) {
            counts[minute] = {};
        }

        if (!counts[minute][flowName]) {
            counts[minute][flowName] = 0;
        }

        counts[minute][flowName]++;
    });

    // Step 2: Find the earliest processing time in events (firstEntryTime)
    const firstEntryTime = new Date(
        Math.min(...events.map((entry:any) => new Date(entry.processingTime).getTime()))
    );

    // Step 3: Get all unique flow names
    const allFlows = [...new Set(events.map((entry:any) => entry.flowName))];

    // Step 4: Fill missing minutes with counts of 0 up to the current time
    const currentTime = new Date();
    let currentMinute = new Date(firstEntryTime);

    while (currentMinute <= currentTime) {
        const minuteKey = currentMinute.toISOString().substring(0, 16) + "Z";

        if (!counts[minuteKey]) {
            counts[minuteKey] = {};
        }

        allFlows.forEach((flowName:any) => {
            if (!counts[minuteKey][flowName]) {
                counts[minuteKey][flowName] = 0;
            }
        });

        currentMinute.setMinutes(currentMinute.getMinutes() + 1);
    }

      //sort by minute
      const sortedCounts = Object.fromEntries(
        Object.entries(counts)
          .sort(([minuteKeyA], [minuteKeyB]) => {
            // Compare keys as ISO 8601 strings, which sort lexicographically in time order
            return minuteKeyA.localeCompare(minuteKeyB);
          })
      );

    return sortedCounts;
}
  
  
  export function countFlows(events: any): any {
      const counts: Record<string, number> = {};
      events.forEach((entry:any) => {
          const flowName = entry.flowName;

          if (!counts[flowName]) {
              counts[flowName] = 0;
          }

          counts[flowName]++;
      });

      return counts;
  }

  export function searchTranscationsBetweenDatesByEpochTime(start:any, end:any, events:any) {
    return events.filter((transaction:Transaction) => {
      const transactionEpochTime = new Date(transaction.processingTime).getTime();
      // Check if transaction's time is within the start and end range
      return start <= transactionEpochTime && transactionEpochTime <= end;
    });
  }
  

  export function searcTransationSearchByIds(messageId:string, senderId:string, receiverId:string, events:any) {
    return events.filter((transaction:Transaction) => {
      // Log for debugging purposes
      CommonFunctions.logWithTimestamp('Searching for:', messageId, senderId, receiverId);
  
      // Check if the transaction's fields include the search values (wildcard search)
      const messageIdMatch = messageId ? (transaction.messageId && typeof transaction.messageId === 'string' && transaction.messageId.includes(messageId)) : true;
      const senderIdMatch = senderId ? (transaction.senderId && typeof transaction.senderId === 'string' && transaction.senderId.includes(senderId)) : true;
      const receiverIdMatch = receiverId ? (transaction.receiverId && typeof transaction.receiverId === 'string' && transaction.receiverId.includes(receiverId)) : true;
  
      // Return transactions that match any of the fields
      return messageIdMatch || senderIdMatch || receiverIdMatch;
    });
  }
  