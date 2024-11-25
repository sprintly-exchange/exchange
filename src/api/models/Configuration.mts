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

    setPickup(pickup){
      this.pickup = pickup;
    }

    getPickup(){
      return this.pickup;
    }

    setDelivery(delivery){
      this.delivery = delivery;
    }

    getDelivery(){
      return this.delivery;
    }
    
    setProcessing(processing){
      this.processing = this.processing;
    }

    getProcessing(){
      return this.processing;
    }
    

 };