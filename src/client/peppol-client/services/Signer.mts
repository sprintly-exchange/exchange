import { ISigner } from '../interfaces/ISigner.mjs';
import * as crypto from 'crypto';
import * as fs from 'fs';

export class Signer implements ISigner {
  private privateKey: string;

  constructor(privateKeyPath: string) {
    this.privateKey = fs.readFileSync(privateKeyPath, 'utf-8');
  }

  sign(document: string): string {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(document);
    return sign.sign(this.privateKey, 'base64');
  }
}
