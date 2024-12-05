
import { before } from 'lodash';
import {v4 as uuidv4} from 'uuid';
import { belongsToA } from './BelongsToA.mjs';


export class ConnectionFS extends belongsToA{
    path;
    connectionName;
    protocol;
    retryInterval;
    retryAttemps;
    id;

    constructor(connectionName:any,path:any,retryInterval:any,retryAttemps:any){
      super();
      this.id = uuidv4();
      this.connectionName = connectionName;
      this.protocol = 'FS';
      this.retryInterval=retryInterval;
      this.retryAttemps = retryAttemps;
      this.path = path;
    }
  
    getId(){
      return this.id;
    }
  };