import * as ftp from 'basic-ftp';
import { promises as fs } from 'fs'; // Import fs.promises

export class FtpClientProcessor {
  host;
  port;
  user;
  password;
  secure;
  remotePath;
  localPath;
  passive;
  timeout;
  ftp;

  constructor(template: any) {
    this.host = template.host;
    this.port = template.port;
    this.user = template.userName;
    this.password = template.password;
    this.secure = template.secure;
    this.remotePath = template.remotePath;
    this.localPath = template.localPath;
    this.passive = template.passive;
    this.timeout = template.timeout;
    this.ftp = new ftp.Client();
  }

  async  getFtpUrl() {
      let url = `ftp://`;
      if (this.user) {
        url += encodeURIComponent(this.user);
        if (this.password) {
          url += `:${encodeURIComponent(this.password)}`;
        }
        url += `@`;
      }
      url += this.host;
      if (this.port && this.port !== 21) {
        url += `:${this.port}`;
      }
      if (this.remotePath) {
        url += `/${this.remotePath.replace(/^\//, '')}`;
      }
      return url;
  }

  async  getFtpUrlWithoutPassword() {
    let url = `ftp://`;
    if (this.user) {
      url += encodeURIComponent(this.user);
      url += `@`;
    }
    url += this.host;
    if (this.port && this.port !== 21) {
      url += `:${this.port}`;
    }
    if (this.remotePath) {
      url += `/${this.remotePath.replace(/^\//, '')}`;
    }
    return url;
}
  

  async connect() {
    try {
      await this.ftp.access({
        host: this.host,
        port: this.port,
        user: this.user,
        password: this.password,
        secure: this.secure,
        passive: this.passive,
        timeout: this.timeout,
      });
      console.log('Connected to FTP server');
      return true;
    } catch (err) {
      console.error('Error connecting to FTP server:', err);
      return false
    }
  }

  async uploadFile(localFileName:string) {
    try {
      const localFilePath = `${this.localPath}/${localFileName}`;
      const remoteFilePath = `${this.remotePath}/${localFileName}`;
      await this.ftp.uploadFrom(localFilePath, remoteFilePath);
      console.log(`Uploaded file: ${localFilePath} to ${remoteFilePath}`);
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  }

  async uploadFileCustom(localFileName:string,remoteFileName:string) {
    try {
      const localFilePath = `${localFileName}`;
      const remoteFilePath = `${this.remotePath}/${remoteFileName}`;
      await this.ftp.uploadFrom(localFilePath, remoteFilePath);
      console.log(`Uploaded file: ${localFilePath} to ${remoteFilePath}`);
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  }

  async downloadFile(remoteFileName:string) {
    try {
      const localFilePath = `${this.localPath}/${remoteFileName}`;
      const remoteFilePath = `${this.remotePath}/${remoteFileName}`;
      
      await this.ftp.downloadTo(localFilePath, remoteFilePath);
      
      // Read the downloaded file content as a string
      const fileContent = await fs.readFile(localFilePath, 'utf8');
      console.log("Downloaded file from ftp server : ",fileContent);
      return fileContent;
    } catch (err) {
      console.error('Error downloading file:', err);
      throw err;
    }
  }

  async listFiles() {
    try {
      const fileList = await this.ftp.list(this.remotePath);
      //console.log('Files in remote directory:', fileList);
      return fileList;
    } catch (err) {
      console.error('Error listing files:', err);
      throw err;
    }
  }

  async downloadAllFiles() {
    try {
      const fileList = await this.listFiles();
      for (const file of fileList) {
        if (file.isFile) {
          await this.downloadFile(file.name);
        }
      }
      console.log('Downloaded all files.');
    } catch (err) {
      console.error('Error downloading all files:', err);
      throw err;
    }
  }

  async readFileToString(localFileName:string) {
    try {
      const localFilePath = `${this.localPath}/${localFileName}`;
      const fileContent = await fs.readFile(localFilePath, 'utf8');
      console.log(`Read file content: ${localFilePath}`);
      return fileContent;
    } catch (err) {
      console.error('Error reading file:', err);
      throw err;
    }
  }

  async deleteFile(remoteFileName:string) {
    try {
      const remoteFilePath = `${this.remotePath}/${remoteFileName}`;
      await this.ftp.remove(remoteFilePath);
      console.log(`Deleted file: ${remoteFilePath}`);
    } catch (err) {
      console.error('Error deleting file:', err);
      throw err;
    }
  }

  async disconnect() {
    try {
      await this.ftp.close();
      console.log('Disconnected from FTP server');
    } catch (err) {
      console.error('Error disconnecting from FTP server:', err);
      throw err;
    }
  }
}

