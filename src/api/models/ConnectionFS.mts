
import {v4 as uuidv4} from 'uuid';


export class ConnectionFS{
    path;
    connectionName;
    protocol;
    retryInterval;
    retryAttemps;

    constructor(connectionName,path,retryInterval,retryAttemps){
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