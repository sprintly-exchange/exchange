export interface IDocumentBuilder {
  buildInvoice(
    senderName: string,
    recipientName: string,
    invoiceID: string,
    amount: number
  ): string;
}
