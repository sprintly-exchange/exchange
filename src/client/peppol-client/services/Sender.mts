import { ISender } from '../interfaces/ISender.mjs';
import axios from 'axios';

export class Sender implements ISender {
  private accessPointURL: string;

  constructor(accessPointURL: string) {
    this.accessPointURL = accessPointURL;
  }

  async send(document: string, senderID: string, recipientID: string): Promise<void> {
    try {
      const response = await axios.post(this.accessPointURL, {
        senderID,
        recipientID,
        document,
      });

      console.log('Document sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending document:', error);
    }
  }
}
