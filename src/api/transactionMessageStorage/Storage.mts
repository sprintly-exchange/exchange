import {v4 as uuidv4} from 'uuid';
import { StorageType } from './StorageType';

export class Storage{
    _storageType:StorageType;
     get storageType() {
       return this._storageType;
     }
     set storageType(value) {
       this._storageType = value;
     }
    constructor(storageType:StorageType){
      this._storageType = storageType;
    }
   }