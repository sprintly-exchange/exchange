import {v4 as uuidv4} from 'uuid';

 // Classes related to flow definition
 export class Flow {
    id;
    pickupId;
    deliveryId;
    processingId;
    flowName;
    constructor(flowName,pickupId,deliveryId,processingId){
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