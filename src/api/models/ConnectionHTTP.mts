
import { Connection } from "./Connection.mjs";

export class ConnectionHTTP extends Connection{
  basePath;
  headers: any;
  method;
  constructor(connectionName:string,host:string,port:number,retryInterval:number,retryAttemps:number,method:string,basePath:string){
    super(connectionName,host,port,'HTTP',retryInterval,retryAttemps);
    this.basePath = basePath;
    this.method = method;
    this.headers={};
  }

  getId(){
    return this.id;
  }
};