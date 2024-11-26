import fs from 'fs';
import path from 'path';

export class ConfigurationFileStorage {
  _storageLocation;
  prefix;
  maxFileSize;
  currentFileNumber;

  constructor(prefix:string,storagePath:string, maxFileSize = 1024 * 1024 * 10) { // Default max file size is 1MB
    this._storageLocation = storagePath;
    this.prefix = prefix;
    this.maxFileSize = maxFileSize;
    this.currentFileNumber = 0;
  }

  async saveStaticFile(filename:string, data:any) {
    fs.writeFileSync( path.join(this._storageLocation, `${this.prefix}_${filename}`), data);
  }

  async load(filename:string) {
    try {
      return fs.readFileSync(path.join(this._storageLocation, `${this.prefix}_${filename}`), 'utf-8');
    } catch (error) {
      console.log(error);
      console.log("No files found to initialize : ", path.join(this._storageLocation, `${this.prefix}_${filename}`));
    }
  }

  async loadStaticFile(filename:string) {
    try {
      return fs.readFileSync(path.join(this._storageLocation, `${this.prefix}_${filename}`), 'utf-8');
    } catch (error) {
      console.log(error);
      console.log("No files found to initialize : ", path.join(this._storageLocation, `${this.prefix}_${filename}`));
    }
  }
}

export default ConfigurationFileStorage;
