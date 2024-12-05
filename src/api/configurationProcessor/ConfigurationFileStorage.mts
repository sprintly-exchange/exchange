import fs from 'fs';
import path from 'path';
import { CommonFunctions } from '../models/CommonFunctions.mjs';

export class ConfigurationFileStorage {
  _storageLocation;
  prefix;
  maxFileSize;
  currentFileNumber;

  constructor(prefix:string) { // Default max file size is 1MB
    if(process.env.CONFIG_STORAGE_DIR){
      this._storageLocation = process.env.CONFIG_STORAGE_DIR;
    } 
    else {
      this._storageLocation = "/tmp";
    }
    this.prefix = prefix;
    this.maxFileSize = 1024 * 1024 * 10
    this.currentFileNumber = 0;
  }

  async saveStaticFile(filename:string, data:any) {
    fs.writeFileSync( path.join(this._storageLocation, `${this.prefix}_${filename}`), data);
  }

  async load(filename:string) {
    try {
      return fs.readFileSync(path.join(this._storageLocation, `${this.prefix}_${filename}`), 'utf-8');
    } catch (error) {
      CommonFunctions.logWithTimestamp(error);
      CommonFunctions.logWithTimestamp("No files found to initialize : ", path.join(this._storageLocation, `${this.prefix}_${filename}`));
    }
  }

  async loadStaticFile(filename:string) {
    try {
      return fs.readFileSync(path.join(this._storageLocation, `${this.prefix}_${filename}`), 'utf-8');
    } catch (error) {
      CommonFunctions.logWithTimestamp(error);
      CommonFunctions.logWithTimestamp("No files found to initialize : ", path.join(this._storageLocation, `${this.prefix}_${filename}`));
      return "";
    
    }
  }
}

export default ConfigurationFileStorage;
