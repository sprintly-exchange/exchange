import { v4 as uuidv4 } from 'uuid';
import { CommonFunctions } from '../api/models/CommonFunctions.mjs';

export class TransactionProcessorWEBSOCKET {
  constructor() {}

  async transactionProcessorPickup(transactionProcessManagerInput:any) {
    const { host, port, protocol, headers } = transactionProcessManagerInput.websocketTemplate;
    const websocket = new WebSocket(`${protocol}://${host}:${port}`);

    websocket.onopen = () => {
      // Generate a unique ID for the child transaction
      const childTransaction = {
        ...transactionProcessManagerInput.transaction,
        id: uuidv4(),
        pickupTime: new Date().toISOString(),
      };

      // Convert the child transaction to JSON string before sending
      const payload = JSON.stringify(childTransaction);

      // Send the child transaction as a message to the WebSocket server
      websocket.send(payload);

      // Close the WebSocket connection
      websocket.close();
    };

    websocket.onerror = (error) => {
      CommonFunctions.logWithTimestamp('WebSocket error:', error);
    };
  }

  async transactionProcessorDelivery(transactionProcessManagerInput:any) {
    const { host, port, protocol, headers } = transactionProcessManagerInput.websocketTemplate;
    const websocket = new WebSocket(`${protocol}://${host}:${port}`);

    websocket.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      CommonFunctions.logWithTimestamp('Received message:', receivedMessage);
      // Perform the desired action with the received message

      // After processing the message, update the delivery status and time
      transactionProcessManagerInput.transaction.deliveryStatus = 'COMPLETED';
      transactionProcessManagerInput.transaction.deliveryTime = new Date().toISOString();
    };

    websocket.onerror = (error:any) => {
      CommonFunctions.logWithTimestamp('WebSocket error:', error);
      // Set the delivery error in case of WebSocket error
      transactionProcessManagerInput.transaction.deliveryError = error.message;
    };
  }

  async setCommonPickupProcessingParameters(transaction:any) {
    return true;
  }

  async setCommonDeliveryProcessingParameters(transaction:any) {
    return true;
  }
}
