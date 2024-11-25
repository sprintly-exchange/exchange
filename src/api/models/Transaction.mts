import {v4 as uuidv4} from 'uuid';

// Classes related to store the tranaction configruation
export class Transaction{
    id;
    flowName='';
    parentId='';
    childId='';
    pickupId='';
    pickupProtocol='';
    pickupHost='';
    pickupPort='';
    pickupPath='';
    pickupMessageName='';
    pickupMessageSize=0;
    pickupInboundMessageName='';
    pickupInboundMessagePath='';
    pickupInboundMessageSize=0;
    pickupOutboundMessageName='';
    pickupOutboundMessagePath='';
    pickupOutboundMessageSize=0;
    pickupName='';
    pickupTime='';
    pickupStatus='';
    pickupStatusCode='';
    deliveryId='';
    deliveryProtocol='';
    deliveryHost='';
    deliveryPort='';
    deliveryPath='';
    deliveryMessageName='';
    deliverMessageSize=0;
    deliveryInboundMessageName='';
    deliveryInboundMessageSize=0;
    deliveryOutboundMessageName='';
    deliveryOutboundMessagePath='';
    deliveryOutboundMessageSize=0;
    deliveryName='';
    deliveryTime='';
    deliveryStatus='';
    deliveryStatusCode='';
    messageName='';
    organizationId='';
    status='';
    processingId='';
    processingTime:any;
    configurationProcessingError:any;
    currentMessage:string= '';
    pickupError:any;
    deliveryInboundMessagePath:string='';
    deliveryError:any;

    deliveryProcessingError='';
    pickupProcessingError='';
    

    constructor(processingTime:any,status:any,pickupId:any,pickupProtocol:any,pickupHost:any,pickupPort:any,pickupName:any,deliveryId:any,deliveryProtocol:any,deliveryHost:any,deliveryPort:any,deliveryName:any,processingId:any,parentId:any,childId:any,flowName:any,organizationId:any){
      this.id = uuidv4();
      this.deliveryStatus = status;
      this.processingTime = processingTime;
      this.pickupId = pickupId;
      this.pickupProtocol = pickupProtocol;
      this.pickupHost = pickupHost;
      this.pickupPort = pickupPort;
      this.pickupName = pickupName;
      this.deliveryId = deliveryId;
      this.deliveryProtocol = deliveryProtocol;
      this.deliveryHost = deliveryHost;
      this.deliveryPort = deliveryPort;
      this.deliveryName = deliveryName;
      this.processingId = processingId;
      this.parentId = parentId;
      this.childId = childId;
      this.flowName = flowName;
      this.organizationId = organizationId;
      this.status = status;

    }

    getId(){
      return this.id;
    }
 }

export default Transaction;