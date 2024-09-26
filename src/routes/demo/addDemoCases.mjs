import { ConnectionFS } from "../../api/models/ConnectionFS.mjs";
import { ConnectionHTTP } from "../../api/models/ConnectionHTTP.mjs";
import { Flow } from "../../api/models/Flow.mjs";
import {v4 as uuidv4} from 'uuid';

//variables used to run the demo mode
let Pickup_Weather_Data=undefined;
let Pickup_Orders=undefined;
let Pickup_OrderResponses=undefined;
let Pickup_Invoices=undefined;

let Pickup_PetstoreInvetory=undefined;
let Delivery_RecycleBin=undefined;
let Delivery_PetstoreInventory=undefined;
let Deliver_OrderResponses=undefined;
let Deliver_Invoices=undefined;
let Deliver_Orders=undefined;

let flow_pet_store_inventory=undefined;
let flow_weather_data=undefined;
let flow_process_order_respones=undefined;
let flow_process_orders=undefined;
let flow_process_invoices=undefined;

let demoPickups = undefined;
let demoDeliveries = undefined;
let demoFlows = undefined;

let Default_Code = undefined;

export function addDemoCases(organizationId){

  Default_Code = {
    "id": uuidv4(),
    "code":"ewogIG1ldGhvZDogZnVuY3Rpb24gKHRyYW5zYWN0aW9uUHJvY2Vzc01hbmFnZXIpIHsKICAgIGNvbnNvbGUubG9nKCJIYW5kbGUgdGhlIEVESUZBQ1Qgb3IgSlNPTiBtZXNzYWdlIGNvbnRlbnQuLi4hIik7CiAgICBsZXQgdHJhbnNhY3Rpb25EYXRhOwogICAgY29uc3QgY3VycmVudE1lc3NhZ2UgPSB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLmN1cnJlbnRNZXNzYWdlOwoKICAgIC8vIENoZWNrIGlmIHRoZSBtZXNzYWdlIGNvbnRhaW5zICdVTkgnIHRvIGRldGVybWluZSBpZiBpdCdzIEVESUZBQ1QKICAgIGlmIChjdXJyZW50TWVzc2FnZS5pbmNsdWRlcygiVU5IIikpIHsKICAgICAgY29uc29sZS5sb2coIkRldGVjdGVkIEVESUZBQ1QgZm9ybWF0Iik7CgogICAgICB0cnkgewogICAgICAgIC8vIE5vcm1hbGl6ZSBtZXNzYWdlIGJ5IHJlbW92aW5nIG5ld2xpbmUgY2hhcmFjdGVycyBhbmQgc3BsaXR0aW5nIGJ5IHNlZ21lbnQgdGVybWluYXRvciAiJyIKICAgICAgICBjb25zdCBjbGVhbmVkTWVzc2FnZSA9IGN1cnJlbnRNZXNzYWdlLnJlcGxhY2UoL1xuL2csICIiKTsKICAgICAgICBjb25zdCBzZWdtZW50cyA9IGNsZWFuZWRNZXNzYWdlLnNwbGl0KCInIik7CgogICAgICAgIC8vIEluaXRpYWxpemUgdmFyaWFibGVzIGZvciBtZXNzYWdlSWQsIHNlbmRlcklkLCBhbmQgcmVjZWl2ZXJJZAogICAgICAgIGxldCBtZXNzYWdlSWQsIHNlbmRlcklkLCByZWNlaXZlcklkOwoKICAgICAgICAvLyBMb29wIHRocm91Z2ggZWFjaCBzZWdtZW50IGFuZCBmaW5kIHJlbGV2YW50IGRhdGEKICAgICAgICBzZWdtZW50cy5mb3JFYWNoKHNlZ21lbnQgPT4gewogICAgICAgICAgY29uc3QgcGFydHMgPSBzZWdtZW50LnNwbGl0KCIrIik7CgogICAgICAgICAgLy8gRXh0cmFjdCBtZXNzYWdlSWQgZnJvbSBVTkggc2VnbWVudAogICAgICAgICAgaWYgKHBhcnRzWzBdID09PSAiVU5IIikgewogICAgICAgICAgICBtZXNzYWdlSWQgPSBwYXJ0c1sxXTsgIC8vIG1lc3NhZ2VJZCBpcyB0aGUgc2Vjb25kIGVsZW1lbnQgaW4gVU5ICiAgICAgICAgICB9CgogICAgICAgICAgLy8gRXh0cmFjdCBzZW5kZXJJZCBmcm9tIE5BRCtCWSBzZWdtZW50IChCdXllcikKICAgICAgICAgIGlmIChwYXJ0c1swXSA9PT0gIk5BRCIgJiYgcGFydHNbMV0gPT09ICJCWSIpIHsKICAgICAgICAgICAgc2VuZGVySWQgPSBwYXJ0c1syXS5zcGxpdCgiOiIpWzBdOyAvLyBFeHRyYWN0IG9ubHkgdGhlIHBhcnQgYmVmb3JlICI6IgogICAgICAgICAgfQoKICAgICAgICAgIC8vIEV4dHJhY3QgcmVjZWl2ZXJJZCBmcm9tIE5BRCtTRSBzZWdtZW50IChTZWxsZXIpCiAgICAgICAgICBpZiAocGFydHNbMF0gPT09ICJOQUQiICYmIHBhcnRzWzFdID09PSAiU0UiKSB7CiAgICAgICAgICAgIHJlY2VpdmVySWQgPSBwYXJ0c1syXS5zcGxpdCgiOiIpWzBdOyAvLyBFeHRyYWN0IG9ubHkgdGhlIHBhcnQgYmVmb3JlICI6IgogICAgICAgICAgfQogICAgICAgIH0pOwoKICAgICAgICAvLyBWYWxpZGF0ZSBleHRyYWN0ZWQgZGF0YQogICAgICAgIGlmIChtZXNzYWdlSWQgJiYgc2VuZGVySWQgJiYgcmVjZWl2ZXJJZCkgewogICAgICAgICAgdHJhbnNhY3Rpb25Qcm9jZXNzTWFuYWdlci50cmFuc2FjdGlvbi5tZXNzYWdlSWQgPSBtZXNzYWdlSWQ7CiAgICAgICAgICB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLnNlbmRlcklkID0gc2VuZGVySWQ7CiAgICAgICAgICB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLnJlY2VpdmVySWQgPSByZWNlaXZlcklkOwogICAgICAgICAgdHJhbnNhY3Rpb25Qcm9jZXNzTWFuYWdlci50cmFuc2FjdGlvbi5tZXNzYWdlVHlwZSA9ICdFRElGQUNUJzsKICAgICAgICAgIGNvbnNvbGUubG9nKCJFeHRyYWN0ZWQgSURzOiAiLCB7IG1lc3NhZ2VJZCwgc2VuZGVySWQsIHJlY2VpdmVySWQgfSk7CiAgICAgICAgICByZXR1cm4gdHJ1ZTsKICAgICAgICB9IGVsc2UgewogICAgICAgICAgY29uc29sZS5lcnJvcigiUmVxdWlyZWQgSURzIG5vdCBmb3VuZCBpbiBFRElGQUNUIG1lc3NhZ2UiKTsKICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gUmV0dXJuIGZhbHNlIGlmIElEcyBhcmUgbm90IHByZXNlbnQKICAgICAgICB9CiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7CiAgICAgICAgY29uc29sZS5lcnJvcigiRmFpbGVkIHRvIHByb2Nlc3MgRURJRkFDVCBtZXNzYWdlOiIsIGVycm9yKTsKICAgICAgICByZXR1cm4gZmFsc2U7IC8vIFJldHVybiBmYWxzZSBpZiBwYXJzaW5nIGZhaWxzCiAgICAgIH0KCiAgICB9IGVsc2UgewogICAgICBjb25zb2xlLmxvZygiRGV0ZWN0ZWQgSlNPTiBmb3JtYXQiKTsKCiAgICAgIC8vIEFzc3VtZSBjdXJyZW50TWVzc2FnZSBpcyBhIEpTT04gc3RyaW5nOyBwYXJzZSBpdCB0byBhIEphdmFTY3JpcHQgb2JqZWN0CiAgICAgIHRyeSB7CiAgICAgICAgdHJhbnNhY3Rpb25EYXRhID0gSlNPTi5wYXJzZShjdXJyZW50TWVzc2FnZSk7CiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7CiAgICAgICAgY29uc29sZS5lcnJvcigiRmFpbGVkIHRvIHBhcnNlIGN1cnJlbnRNZXNzYWdlIHRvIEpTT046IiwgZXJyb3IpOwogICAgICAgIHJldHVybiBmYWxzZTsgLy8gUmV0dXJuIGZhbHNlIGlmIHBhcnNpbmcgZmFpbHMKICAgICAgfQoKICAgICAgLy8gQ2hlY2sgaWYgdGhlIEpTT04gb2JqZWN0IGhhcyB0aGUgcmVxdWlyZWQgcHJvcGVydGllcwogICAgICBpZiAodHJhbnNhY3Rpb25EYXRhLm1lc3NhZ2VJZCAmJiB0cmFuc2FjdGlvbkRhdGEuc2VuZGVySWQgJiYgdHJhbnNhY3Rpb25EYXRhLnJlY2VpdmVySWQpIHsKICAgICAgICB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLm1lc3NhZ2VJZCA9IHRyYW5zYWN0aW9uRGF0YS5tZXNzYWdlSWQ7CiAgICAgICAgdHJhbnNhY3Rpb25Qcm9jZXNzTWFuYWdlci50cmFuc2FjdGlvbi5zZW5kZXJJZCA9IHRyYW5zYWN0aW9uRGF0YS5zZW5kZXJJZDsKICAgICAgICB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLnJlY2VpdmVySWQgPSB0cmFuc2FjdGlvbkRhdGEucmVjZWl2ZXJJZDsKICAgICAgICB0cmFuc2FjdGlvblByb2Nlc3NNYW5hZ2VyLnRyYW5zYWN0aW9uLm1lc3NhZ2VUeXBlID0gJ0pTT04nOwogICAgICAgIHJldHVybiB0cnVlOwogICAgICB9IGVsc2UgewogICAgICAgIGNvbnNvbGUuZXJyb3IoIlJlcXVpcmVkIElEcyBub3QgZm91bmQgaW4gdGhlIEpTT04gb2JqZWN0Iik7CiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBSZXR1cm4gZmFsc2UgaWYgSURzIGFyZSBub3QgcHJlc2VudCBpbiB0aGUgSlNPTgogICAgICB9CiAgICB9CiAgfQp9Cg==",
    "processingName":"Default",
    "organizationId":organizationId,
  }

  //pickups - pickup_downloadOrders
          Pickup_Orders =  {
            "id":uuidv4(),
            "connectionName":"Download orders from buyer",
            "host":"app.sprintly-exchange.com",
            "port":21,
            "protocol":"FTP",
            "retryInterval":0,
            "retryAttempts":0,
            "authenticationType":"basicAuth",
            "userName":"ftpuser",
            "password":"ftpuser",
            "remotePath":"/home/ftpuser/buyer/orders/download",
            "secure":false,
            "passive":true,
            "timeout":30000,
            "organizationId":organizationId
          };

          Deliver_Orders =  {
            "id":uuidv4(),
            "connectionName":"Deliver orders to supplier",
            "host":"app.sprintly-exchange.com",
            "port":21,
            "protocol":"FTP",
            "retryInterval":0,
            "retryAttempts":0,
            "authenticationType":"basicAuth",
            "userName":"ftpuser",
            "password":"ftpuser",
            "remotePath":"/home/ftpuser/supplier/orders/upload",
            "secure":false,
            "passive":true,
            "timeout":30000,
            "organizationId":organizationId
          };

    //pickups - pickup_downloadOrderResponse
    Pickup_OrderResponses =  {
      "id":uuidv4(),
      "connectionName":"Download order reponses from supplier",
      "host":"app.sprintly-exchange.com",
      "port":21,
      "protocol":"FTP",
      "retryInterval":0,
      "retryAttempts":0,
      "authenticationType":"basicAuth",
      "userName":"ftpuser",
      "password":"ftpuser",
      "remotePath":"/home/ftpuser/supplier/orderresponse/download",
      "secure":false,
      "passive":true,
      "timeout":30000,
      "organizationId":organizationId
    };

    Deliver_OrderResponses =  {
      "id":uuidv4(),
      "connectionName":"Deliver order reponses to buyer",
      "host":"app.sprintly-exchange.com",
      "port":21,
      "protocol":"FTP",
      "retryInterval":0,
      "retryAttempts":0,
      "authenticationType":"basicAuth",
      "userName":"ftpuser",
      "password":"ftpuser",
      "remotePath":"/home/ftpuser/buyer/orderresponse/upload",
      "secure":false,
      "passive":true,
      "timeout":30000,
      "organizationId":organizationId
    };

 //pickups - pickup_downloadOrderResponse
 Pickup_Invoices =  {
      "id":uuidv4(),
      "connectionName":"Download invoices from supplier",
      "host":"app.sprintly-exchange.com",
      "port":21,
      "protocol":"FTP",
      "retryInterval":0,
      "retryAttempts":0,
      "authenticationType":"basicAuth",
      "userName":"ftpuser",
      "password":"ftpuser",
      "remotePath":"/home/ftpuser/supplier/invoice/download",
      "secure":false,
      "passive":true,
      "timeout":30000,
      "organizationId":organizationId
    };

    Deliver_Invoices =  {
      "id":uuidv4(),
      "connectionName":"Deliver invoices to buyer",
      "host":"app.sprintly-exchange.com",
      "port":21,
      "protocol":"FTP",
      "retryInterval":0,
      "retryAttempts":0,
      "authenticationType":"basicAuth",
      "userName":"ftpuser",
      "password":"ftpuser",
      "remotePath":"/home/ftpuser/buyer/invoice/upload",
      "secure":false,
      "passive":true,
      "timeout":30000,
      "organizationId":organizationId
    };

  //pickups - Pickup_PetstoreInvetory
            Pickup_PetstoreInvetory = new ConnectionHTTP(
            'Pickup - Pet Store - Inventory',
            'https://petstore.swagger.io',
            443,
            0,
            0,
            'GET',
            '/v2/store/inventory');
            Pickup_PetstoreInvetory.authenticationType='noAuth';
            Pickup_PetstoreInvetory.headers['Content-Type']="application/json";
            Pickup_PetstoreInvetory.headers['Accept']="application/json";
            Pickup_PetstoreInvetory.organizationId = organizationId;

  //pickups - Pickup_Weather_Data
            Pickup_Weather_Data = new ConnectionHTTP(
                  'Open Weather - Hourly Forecast',
                  'https://pro.openweathermap.org',
                  443,
                  0,
                  0,
                  'GET',
                  '/data/2.5/forecast/hourly?lat=0&lon=0&appid=40c71799f4ef5f1d3e7bc68c1a23ec42');
            Pickup_Weather_Data.authenticationType='noAuth';
            Pickup_Weather_Data.headers['Content-Type']="application/json";
            Pickup_Weather_Data.headers['Accept']="application/json";
            Pickup_Weather_Data.organizationId = organizationId;

//Deliveries Delivery_RecycleBin
            Delivery_RecycleBin = new ConnectionFS('Send to Recycle Bin','/tmp',0,0);

//Deliveries Delivery_PetstoreInventory
            Delivery_PetstoreInventory = new ConnectionHTTP(
                  'Send Pet Store - Inventory',
                  'https://petstore.swagger.io',
                  443,
                  0,
                  0,
                  'POST',
                  '/v2/store/inventory');
            Delivery_PetstoreInventory.authenticationType='noAuth';
            Delivery_PetstoreInventory.headers['Content-Type']="application/json";
            Delivery_PetstoreInventory.headers['Accept']="application/json";
            Delivery_PetstoreInventory.organizationId = organizationId;
  
  //Set processing
            configurationProcessingMap.set(Default_Code.id,Default_Code);
  //Set pickups
            configurationPickupMap.set(Pickup_PetstoreInvetory.getId(),Pickup_PetstoreInvetory);
            configurationPickupMap.set(Pickup_Weather_Data.getId(),Pickup_Weather_Data);
            configurationPickupMap.set(Pickup_Orders.id,Pickup_Orders);
            configurationPickupMap.set(Pickup_OrderResponses.id,Pickup_OrderResponses);
            configurationPickupMap.set(Pickup_Invoices.id,Pickup_Invoices);

   //Set deliveries
            configurationDeliveryMap.set(Delivery_RecycleBin.getId(),Delivery_RecycleBin);
            configurationDeliveryMap.set(Delivery_PetstoreInventory.getId(),Delivery_PetstoreInventory);
            configurationDeliveryMap.set(Deliver_Orders.id,Deliver_Orders);
            configurationDeliveryMap.set(Deliver_OrderResponses.id,Deliver_OrderResponses);
            configurationDeliveryMap.set(Deliver_Invoices.id,Deliver_Invoices);
   //Set flows
      //Set flows flow_pet_store_inventory
            flow_pet_store_inventory= new Flow("Get petstore inventory",Pickup_PetstoreInvetory.getId(),Delivery_RecycleBin.getId());
            flow_pet_store_inventory.organizationId = organizationId;
            flow_pet_store_inventory.activationStatus = false;
      //Set flows flow_weather_data
            flow_weather_data = new Flow("Download weather info",Pickup_Weather_Data.getId(),Delivery_RecycleBin.getId());
            flow_weather_data.organizationId = organizationId;
            flow_weather_data.activationStatus = false;
      //Set flows flow_download_orders
            flow_process_orders = new Flow("Process orders",Pickup_Orders.id,Deliver_Orders.id,Default_Code.id);
            flow_process_orders.organizationId = organizationId;
            flow_process_orders.activationStatus = false;      
      //Set flows flow_order_respones
            flow_process_order_respones = new Flow("Process order responses",Pickup_OrderResponses.id,Deliver_OrderResponses.id,Default_Code.id);
            flow_process_order_respones.organizationId = organizationId;
            flow_process_order_respones.activationStatus = false; 
      //Set flows flow_process_invoices
            flow_process_invoices = new Flow("Process invoices",Pickup_Invoices.id,Deliver_Invoices.id,Default_Code.id);
            flow_process_invoices.organizationId = organizationId;
            flow_process_invoices.activationStatus = false;  
  
  //set final configuration flows
            configurationFlowMap.set(flow_pet_store_inventory.getId(),flow_pet_store_inventory,0); 
            configurationFlowMap.set(flow_weather_data.getId(),flow_weather_data,0); 
            configurationFlowMap.set(flow_process_orders.id,flow_process_orders,0); 
            configurationFlowMap.set(flow_process_order_respones.id,flow_process_order_respones,0); 
            configurationFlowMap.set(flow_process_invoices.id,flow_process_invoices,0); 

            demoPickups = [Pickup_PetstoreInvetory.connectionName,Pickup_Weather_Data.connectionName,Pickup_Orders.connectionName,Pickup_OrderResponses.connectionName,Pickup_Invoices.connectionName];
            demoDeliveries = [Delivery_RecycleBin.connectionName,Delivery_PetstoreInventory.connectionName,Deliver_OrderResponses.connectionName,Deliver_Invoices.connectionName];
            demoFlows = [flow_pet_store_inventory.flowName,flow_weather_data.flowName,flow_process_orders.flowName,flow_process_orders.flowName,flow_process_invoices];
            return true;
}

export function removeDemoCases(organizationId){
    console.log("Removing all flows for org id : ",organizationId);
    try{
      const flowsToDelete = [...configurationFlowMap.values()].filter((record) => record.organizationId === organizationId);
      // Step 2: Delete the filtered records using their id
      flowsToDelete.forEach((record) => {
          // Assuming configurationFlowMap is a Map where the key is the id of the flow
          if(demoFlows.includes(record.flowName)){
            configurationFlowMap.delete(record.id);
          }
            
      });

      const pickupsToDelete = [...configurationPickupMap.values()].filter((record) => record.organizationId === organizationId);
      // Step 2: Delete the filtered records using their id
      pickupsToDelete.forEach((record) => {
          // Assuming configurationFlowMap is a Map where the key is the id of the flow
          if(demoPickups.includes(record.connectionName)){
            configurationPickupMap.delete(record.id);
          }
      });

      const deliveriesToDelete = [...configurationDeliveryMap.values()].filter((record) => record.organizationId === organizationId);
      // Step 2: Delete the filtered records using their id
      deliveriesToDelete.forEach((flow) => {
          // Assuming configurationFlowMap is a Map where the key is the id of the flow
          if(demoDeliveries.includes(record.connectionName)){
            configurationDeliveryMap.delete(record.id);
          }
      });
          
      return true;
    }catch(error){
          //Do nothing
      return false;
    }
}