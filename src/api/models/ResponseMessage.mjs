// Classes related to message types used for API's
export class ResponseMessage {
    id;
    message;
    status;
    constructor(id,message,status){
      this.id = id;
      this.message = message;
      this.status = status;
    }
   }