import { InvoiceClient } from './InvoiceClient.mjs';

// Mock configuration (replace with real values)
const config = {
  senderID: '9915:sender-123',
  recipientID: '9915:recipient-456',
  accessPointURL: 'https://recipient-access-point.example.com/as4',
  privateKeyPath: 'path/to/private-key.pem',
};

const client = new InvoiceClient(config);

(async () => {
  await client.processAndSendInvoice('Sender Company', 'Recipient Company', 'INV-001', 100.0);
})();
