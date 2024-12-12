
import { TransactionMessageStorageI } from "./TransactionMessageStorageI.mjs";

export abstract class TransactionMessageStorageA implements TransactionMessageStorageI{
     // Abstract method for storing a message
  abstract storeMessage(value: any): Promise<[string, number]>;

  // Abstract method for retrieving a message
  abstract getMessage(id: string): Promise<string|undefined>;
}