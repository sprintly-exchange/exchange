import fs from 'fs';
import path from 'path';

export class ConfigurationFileStorage {
  constructor(prefix,storagePath, maxFileSize = 1024 * 1024 * 10) { // Default max file size is 1MB
    this._storageLocation = storagePath;
    this.prefix = prefix;
    this.maxFileSize = maxFileSize;
    this.currentFileNumber = 0;
  }

  async saveStaticFile(filename, data) {
    fs.writeFileSync( path.join(this._storageLocation, `${this.prefix}_${filename}`), data);
  }

  async load(filename) {
    try {
      return fs.readFileSync(path.join(this._storageLocation, `${this.prefix}_${filename}`), 'utf-8');
    } catch (error) {
      console.log(error);
      console.log("No files found to initialize : ", path.join(this._storageLocation, `${this.prefix}_${filename}`));
    }
  }

  async loadStaticFile(filename) {
    try {
      return fs.readFileSync(path.join(this._storageLocation, `${this.prefix}_${filename}`), 'utf-8');
    } catch (error) {
      console.log(error);
      console.log("No files found to initialize : ", path.join(this._storageLocation, `${this.prefix}_${filename}`));
    }
  }
}

export default ConfigurationFileStorage;
