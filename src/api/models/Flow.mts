import {v4 as uuidv4} from 'uuid';
import { belongsToA } from './BelongsToA.mjs';

 // Classes related to flow definition
 export class Flow extends belongsToA{
    id;
    pickupId;
    deliveryId;
    processingId;
    flowName;
    constructor(flowName:string,pickupId:string,deliveryId:string,processingId:string){
      super();
      this.id = uuidv4();
      this.flowName = flowName;
      this.pickupId = pickupId;
      this.deliveryId = deliveryId;
      this.processingId = processingId;
    }


  getPickupId(){
    return this.pickupId;
  }

  getDeliveryId(){
    return this.deliveryId;
  }

  getId(){
    return this.id;
  }
 }