export interface ISender {
  send(document: string, senderID: string, recipientID: string): Promise<void>;
}
