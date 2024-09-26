import {v4 as uuidv4} from 'uuid';

export class Connection{
    id;
    connectionName;
    host;
    port;
    protocol;
    retryInterval;
    retryAttemps;
    authenticationType;
    constructor(connectionName,host,port,protocol,retryInterval,retryAttemps){
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
