import { IDocumentBuilder } from '../interfaces/IDocumentBuilder.mjs';
import { create } from 'xmlbuilder2';

export class DocumentBuilder implements IDocumentBuilder {
  buildInvoice(
    senderName: string,
    recipientName: string,
    invoiceID: string,
    amount: number
  ): string {
    const invoice = {
      Invoice: {
        '@xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
        ID: invoiceID,
        IssueDate: new Date().toISOString().split('T')[0],
        AccountingSupplierParty: {
          Party: {
            PartyName: { Name: senderName },
          },
        },
        AccountingCustomerParty: {
          Party: {
            PartyName: { Name: recipientName },
          },
        },
        InvoiceLines: {
          InvoiceLine: {
            ID: '1',
            InvoicedQuantity: { '#text': '2', '@unitCode': 'EA' },
            LineExtensionAmount: { '#text': amount.toString(), '@currencyID': 'EUR' },
            Item: { Name: 'Product A' },
            Price: { PriceAmount: { '#text': (amount / 2).toString(), '@currencyID': 'EUR' } },
          },
        },
      },
    };

    return create(invoice).end({ prettyPrint: true });
  }
}
