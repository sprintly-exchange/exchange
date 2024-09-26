import { sftpRecordType } from './protocolTemplates.mjs'; // Adjust path as per your structure
import Client from 'ssh2-sftp-client';
import fs from 'fs';

export class SftplientProcessor {
  constructor(config) {
    const {
      connectionName,
      host,
      port,
      username,
      password,
      privateKey, // Adjust as per your template
      passphrase, // Adjust as per your template
      basePath,
    } = config;

    this.connectionName = connectionName;
    this.host = host;
    this.port = port;
    this.username = username;
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
      console.log(`Connected to SFTP server at ${this.host}`);
    } catch (error) {
      console.error('Error connecting to SFTP server:', error.message);
      throw error;
    }
  }

  async listFiles() {
    try {
      const fileList = await this.sftp.list(this.basePath);
      console.log('Files in SFTP basePath:', fileList);
      return fileList;
    } catch (error) {
      console.error('Error listing files:', error.message);
      throw error;
    }
  }

  async uploadFile(localFilePath, remoteFilePath) {
    try {
      await this.sftp.put(localFilePath, remoteFilePath);
      console.log(`Uploaded ${localFilePath} to ${remoteFilePath}`);
    } catch (error) {
      console.error('Error uploading file:', error.message);
      throw error;
    }
  }

  async downloadFile(remoteFilePath, localFilePath) {
    try {
      await this.sftp.get(remoteFilePath, localFilePath);
      console.log(`Downloaded ${remoteFilePath} to ${localFilePath}`);
    } catch (error) {
      console.error('Error downloading file:', error.message);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.sftp.end();
      console.log('SFTP connection closed');
    } catch (error) {
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
    } catch (error) {
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
