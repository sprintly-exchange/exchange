// Classes related to message types used for API's
export class ResponseMessage {
    id;
    message;
    status;
    constructor(id: string,message: string,status:string){
      this.id = id;
      this.message = message;
      this.status = status;
    }
   }