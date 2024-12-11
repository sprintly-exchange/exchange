import { DocumentBuilder } from './services/DocumentBuilder.mjs';
import { Signer } from './services/Signer.mjs';
import { Sender } from './services/Sender.mjs';

interface Config {
  senderID: string;
  recipientID: string;
  accessPointURL: string;
  privateKeyPath: string;
}

export class InvoiceClient {
  private documentBuilder: DocumentBuilder;
  private signer: Signer;
  private sender: Sender;
  private senderID: string;
  private recipientID: string;

  constructor(config: Config) {
    this.documentBuilder = new DocumentBuilder();
    this.signer = new Signer(config.privateKeyPath);
    this.sender = new Sender(config.accessPointURL);
    this.senderID = config.senderID;
    this.recipientID = config.recipientID;
  }

  async processAndSendInvoice(
    senderName: string,
    recipientName: string,
    invoiceID: string,
    amount: number
  ): Promise<void> {
    try {
      console.log('Building invoice...');
      const invoiceXML = this.documentBuilder.buildInvoice(senderName, recipientName, invoiceID, amount);
      console.log('Invoice XML:\n', invoiceXML);

      console.log('Signing invoice...');
      const signedDocument = this.signer.sign(invoiceXML);
      console.log('Signed Document:', signedDocument);

      console.log('Sending invoice...');
      await this.sender.send(signedDocument, this.senderID, this.recipientID);
    } catch (error) {
      console.error('Error processing invoice:', error);
    }
  }
}
