import Client from 'ssh2-sftp-client';
import fs from 'fs';
import { sftpTemplate } from './protocolTemplates.mjs';
import { CommonFunctions } from '../api/models/CommonFunctions.mjs';

export class SftplientProcessor {
  connectionName;
  host;
  port;
  username;
  password;
  privateKey;
  passphrase;
  sftp;
  basePath;

  constructor(config:typeof sftpTemplate) {
    const {
      connectionName,
      host,
      port,
      userName,
      password,
      privateKey, 
      passphrase,
      basePath,
    } = config;

    this.connectionName = connectionName;
    this.host = host;
    this.port = port;
    this.username = userName;
    this.password = password;
    this.privateKey = privateKey ? fs.readFileSync(privateKey) : undefined;
    this.passphrase = passphrase;
    this.basePath = basePath;

    this.sftp = new Client();
  }

  async connect() {
    const sftpConfig = {
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password,
      privateKey: this.privateKey,
      passphrase: this.passphrase,
    };

    try {
      await this.sftp.connect(sftpConfig);
      CommonFunctions.logWithTimestamp(`Connected to SFTP server at ${this.host}`);
    } catch (error:any) {
      console.error('Error connecting to SFTP server:', error.message);
      throw error;
    }
  }

  async listFiles() {
    try {
      const fileList = await this.sftp.list(this.basePath);
      CommonFunctions.logWithTimestamp('Files in SFTP basePath:', fileList);
      return fileList;
    } catch (error:any) {
      console.error('Error listing files:', error.message);
      throw error;
    }
  }

  async uploadFile(localFilePath:string, remoteFilePath:string) {
    try {
      await this.sftp.put(localFilePath, remoteFilePath);
      CommonFunctions.logWithTimestamp(`Uploaded ${localFilePath} to ${remoteFilePath}`);
    } catch (error:any) {
      console.error('Error uploading file:', error.message);
      throw error;
    }
  }

  async downloadFile(remoteFilePath:string, localFilePath:string) {
    try {
      await this.sftp.get(remoteFilePath, localFilePath);
      CommonFunctions.logWithTimestamp(`Downloaded ${remoteFilePath} to ${localFilePath}`);
    } catch (error:any) {
      console.error('Error downloading file:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.sftp.end();
      CommonFunctions.logWithTimestamp('SFTP connection closed');
    } catch (error:any) {
      console.error('Error closing SFTP connection:', error.message);
      throw error;
    }
  }

  async execute() {
    try {
      await this.connect();
      await this.listFiles();
      const localFilePath = '/path/to/local/file.txt';
      const remoteFilePath = `${this.basePath}/file.txt`;
      await this.uploadFile(localFilePath, remoteFilePath);
      const downloadedFilePath = '/path/to/downloaded/file.txt';
      await this.downloadFile(remoteFilePath, downloadedFilePath);
    } catch (error:any) {
      console.error('Error in execute:', error.message);
    } finally {
      await this.disconnect();
    }
  }
}

/*
// Example usage
const sftpClient = new SFTPClient(sftpRecordType);
sftpClient.execute();
*/
