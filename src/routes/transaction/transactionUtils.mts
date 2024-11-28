import Transaction from "../../api/models/Transaction.mjs";
import appEnumerations from "../../api/utilities/severInitFunctions.mjs";

interface Event {
  flowName: string;
  processingTime: string,
  status: string,
}

export function countFlowNamePerMinute(events: Event[]): Record<string, number> {
  const counts: Record<string, number> = {};

  events.forEach((entry) => {
      const date = new Date(entry.processingTime);
      const minute = date.toISOString().substring(0, 16) + "Z"; // Format: "YYYY-MM-DDTHH:MM"

      if (!counts[minute]) {
          counts[minute] = 0;
      }

      counts[minute]++;
  });

  return counts;
}
  
enum AppEnumerations {
  TRANSACTION_STATUS_INPROCESSING = "INPROCESSING",
  TRANSACTION_STATUS_PROCESSING_PICKUP = "PROCESSING_PICKUP",
  TRANSACTION_STATUS_PROCESSING_DELIVERY = "PROCESSING_DELIVERY",
  TRANSACTION_STATUS_PROCESSING_CONFIGURATIONS = "PROCESSING_CONFIGURATIONS",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED"
}

export function transactionSummary(events: Event[]): string {
  const counts = { SUCCESS: 0, FAILED: 0, INPROCESSING: 0 };

  events.forEach((entry) => {
      if (
          entry.status === AppEnumerations.TRANSACTION_STATUS_INPROCESSING ||
          entry.status === AppEnumerations.TRANSACTION_STATUS_PROCESSING_PICKUP ||
          entry.status === AppEnumerations.TRANSACTION_STATUS_PROCESSING_DELIVERY ||
          entry.status === AppEnumerations.TRANSACTION_STATUS_PROCESSING_CONFIGURATIONS
      ) {
          counts.INPROCESSING++;
      } else if (entry.status === AppEnumerations.SUCCESS) {
          counts.SUCCESS++;
      } else if (entry.status === AppEnumerations.FAILED) {
          counts.FAILED++;
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
  

  export function transactionSummaryWithTimeInMinutes(events: Event[]): Record<string, Record<string, number>> {
    const counts: Record<string, Record<string, number>> = {};

    // Step 1: Count existing events per minute and status
    events.forEach((entry) => {
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
        Math.min(...events.map((entry) => new Date(entry.processingTime).getTime()))
    );

    // Step 3: Get all unique statuses
    const allStatuses = [...new Set(events.map((entry) => entry.status))];

    // Step 4: Fill missing minutes with counts of 0 up to the current time
    const currentTime = new Date();
    let currentMinute = new Date(firstEntryTime);

    while (currentMinute <= currentTime) {
        const minuteKey = currentMinute.toISOString().substring(0, 16) + "Z";

        if (!counts[minuteKey]) {
            counts[minuteKey] = {};
        }

        allStatuses.forEach((status) => {
            if (!counts[minuteKey][status]) {
                counts[minuteKey][status] = 0;
            }
        });

        currentMinute.setMinutes(currentMinute.getMinutes() + 1);
    }

    return counts;
}

  
  

  
  export function countFlowsPerMinute(events: Event[]): Record<string, Record<string, number>> {
    const counts: Record<string, Record<string, number>> = {};

    // Step 1: Count existing events per minute
    events.forEach((entry) => {
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
        Math.min(...events.map((entry) => new Date(entry.processingTime).getTime()))
    );

    // Step 3: Get all unique flow names
    const allFlows = [...new Set(events.map((entry) => entry.flowName))];

    // Step 4: Fill missing minutes with counts of 0 up to the current time
    const currentTime = new Date();
    let currentMinute = new Date(firstEntryTime);

    while (currentMinute <= currentTime) {
        const minuteKey = currentMinute.toISOString().substring(0, 16) + "Z";

        if (!counts[minuteKey]) {
            counts[minuteKey] = {};
        }

        allFlows.forEach((flowName) => {
            if (!counts[minuteKey][flowName]) {
                counts[minuteKey][flowName] = 0;
            }
        });

        currentMinute.setMinutes(currentMinute.getMinutes() + 1);
    }

    return counts;
}
  
  
  export function countFlows(events: Event[]): Record<string, number> {
      const counts: Record<string, number> = {};
      events.forEach((entry) => {
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
      console.log('Searching for:', messageId, senderId, receiverId);
  
      // Check if the transaction's fields include the search values (wildcard search)
      const messageIdMatch = messageId ? (transaction.messageId && typeof transaction.messageId === 'string' && transaction.messageId.includes(messageId)) : true;
      const senderIdMatch = senderId ? (transaction.senderId && typeof transaction.senderId === 'string' && transaction.senderId.includes(senderId)) : true;
      const receiverIdMatch = receiverId ? (transaction.receiverId && typeof transaction.receiverId === 'string' && transaction.receiverId.includes(receiverId)) : true;
  
      // Return transactions that match any of the fields
      return messageIdMatch || senderIdMatch || receiverIdMatch;
    });
  }
  