import { TransactionProcessManager } from './transactionProcessManager.mjs';
import Transaction from '../models/Transaction.mjs';

export interface TransactionProcessorI {
    /**
     * Processes transactions during the pickup phase.
     * @param transactionProcessManagerInput - Input data for transaction processing.
     */
    transactionProcessorPickup(transactionProcessManagerInput: TransactionProcessManager): Promise<boolean>;

    /**
     * Processes transactions during the delivery phase.
     * @param transactionProcessManagerInput - Input data for transaction delivery.
     */
    transactionProcessorDelivery(transactionProcessManagerInput: TransactionProcessManager): Promise<boolean>;

    /**
     * Stores a message based on the transaction and leg type.
     * @param transaction - The transaction object to process.
     * @param messageStore - The message store to save data.
     * @param leg - The leg type (PIM, POM, DIM, DOM).
     */
    storeMessage(transaction: Transaction, messageStore: any, leg: string): Promise<boolean>;


}
