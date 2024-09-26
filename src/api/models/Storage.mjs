import {v4 as uuidv4} from 'uuid';

export class Storage{
    _storageType;
     get storageType() {
       return this._storageType;
     }
     set storageType(value) {
       this._storageType = value;
     }
    constructor(storageType){
      this.storageType = storageType;
    }
   }