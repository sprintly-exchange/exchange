import {v4 as uuidv4} from 'uuid';

export class Connection{
    id;
    connectionName;
    host;
    port;
    protocol;
    retryInterval;
    retryAttemps;
    authenticationType:any;
    constructor(connectionName:any,host:any,port:any,protocol:any,retryInterval:any,retryAttemps:any){
      this.id = uuidv4();
      this.connectionName = connectionName;
      this.host = host;
      this.port = port;
      this.protocol = protocol;
      this.retryInterval=retryInterval;
      this.retryAttemps = retryAttemps;
    }

    getId(){
      return this.id;
    }
 };
