import {v4 as uuidv4} from 'uuid';

export class Configuration{
    id;
    pickup = {};
    delivery ={};
    processing = {};

    constructor(){
      this.id = uuidv4();
    }

    getid(){
      return this.id;
    }

    setPickup(pickup:any){
      this.pickup = pickup;
    }

    getPickup(){
      return this.pickup;
    }

    setDelivery(delivery:any){
      this.delivery = delivery;
    }

    getDelivery(){
      return this.delivery;
    }
    
    setProcessing(processing:any){
      this.processing = this.processing;
    }

    getProcessing(){
      return this.processing;
    }
    

 };