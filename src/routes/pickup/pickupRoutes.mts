import { Router } from 'express';
import { userHasDeleteRights,filterResultsBasedOnUserRoleAndUserId, setCommonHeaders, mapEntrySearchByValue } from '../../api/utilities/serverCommon.mjs';
import {v4 as uuidv4} from 'uuid';
import { ResponseMessage } from '../../api/models/ResponseMessage.mjs';
import GlobalConfiguration from '../../GlobalConfiguration.mjs';

const pickupRoutes = Router();

/**
 * @swagger
 * /api/pickup:
 *   post:
 *     summary: Create a pickup.
 *     requestBody:
 *      content:
 *       application/json:
 *        schema:
 *           type: string
 *           format: string
 *     responses:
 *       201:
 *         description: Pickup created
 */
pickupRoutes.post('/', function (req, res) {  
    console.debug(`Pickup request received : ${JSON.stringify(req.body)}`);
    setCommonHeaders(res);
    if(req.body === '[]') 
      res.status(400).send('No data');
    
    //Check If a record already exists with name
    if(mapEntrySearchByValue(GlobalConfiguration.configurationPickupMap,'connectionName',req.body.connectionName)){
      res.status(400).send(new ResponseMessage(uuidv4(),'Record already exists with the same name','Failed'));
      return;
    }   

    req.body.id === undefined ? req.body.id = uuidv4() :'';
    GlobalConfiguration.configurationPickupMap.set(req.body.id,req.body);
    res.status(201).send(JSON.stringify(new ResponseMessage(req.body.id,'',''))); 
});

pickupRoutes.put('/', function (req, res) {  
      console.debug(`Pickup update request received : ${JSON.stringify(req.body)}`);
      setCommonHeaders(res);
      if(req.body.id === undefined || req.body === '[]'){
            res.status(400).send('No data'); 
            return;
      }
            
      setCommonHeaders(res);
      GlobalConfiguration.configurationPickupMap.set(req.body.id,req.body);
      res.status(201).send(JSON.stringify(new ResponseMessage(req.body.id,'',''))); 
  });

  pickupRoutes.get('/', function (req, res) {   
    console.debug(`All pickups requested`);
    getPickups(req, res);
  });
  
  async function getPickups(req: any, res :any) {
    setCommonHeaders(res);
  
    // Filter pickups based on user role and ID
    const events = await filterResultsBasedOnUserRoleAndUserId(GlobalConfiguration.configurationPickupMap, req);
  
    // Get all pickups used in flows
    const usedPickups: Map<string,string> = new Map();
    GlobalConfiguration.configurationFlowMap.forEach((flow: { pickupId: string; flowName: string }) => {
      if (flow.pickupId) {
          usedPickups.set(flow.pickupId, flow.flowName);
      }
    });
  
    // Add isUsed and flowName to each pickup in events
    const updatedEvents = events.map(pickup => ({
      ...pickup,
      isUsed: usedPickups.has(pickup.id),
      flowName: usedPickups.get(pickup.id) || null
    }));
  
    return updatedEvents.length > 0
      ? res.status(200).send(updatedEvents)
      : res.status(204).send('');
  }
  

/**
* @swagger
* /api/pickup/{id}:
*   get:
*     summary: Get a pickup
*     parameters:
*      - in: path
*        name: id
*        schema:
*          type: string
*        required: true
*        description: Id of the pickup
*     responses:
*       200:
*         description: Get a pikcup by providing the Id
*     responseBody:
*       content:
*       application/json:
*        schema:
*           type: string
*           format: string
*/
pickupRoutes.get('/:id', function (req, res) {   
    console.debug(`Pickup id requested : ${req.params.id}`);
    setCommonHeaders(res);
    GlobalConfiguration.configurationPickupMap.has(req.params.id) ? res.status(200).send(JSON.stringify(GlobalConfiguration.configurationPickupMap.get(req.params.id))) : res.status(204).send('{}') ;
});

/**
* @swagger
* /api/pickup/{id}:
*   delete:
*     summary: Delete a pickup
*     parameters:
*      - in: path
*        name: id
*        schema:
*          type: string
*        required: true
*        description: Id of the pickup
*     responses:
*       200:
*         description: Delete a pikcup by providing the Id
*/
pickupRoutes.delete('/:id', function (req, res) {   
  deletePickup(req,res);
});

async function deletePickup(req:any, res:any) {   
  console.debug(`Pickup deletion id requested : ${req.params.id}`);
  setCommonHeaders(res);
  console.log(`Attemting to delete pickup with id :  ${req.params.id}`);


  let flowFound=false;
  let flowId='';
  let flowName='';
  GlobalConfiguration.configurationFlowMap.forEach(function (flow){
        if(flow.pickupId === `${req.params.id}`){
              flowFound = true;
              flowId = flow.id;
              flowName = flow.flowName;

        }          
  }    
  );
  if(!flowFound)
    await userHasDeleteRights(req,GlobalConfiguration.configurationPickupMap,req.params.id) ? res.status(200).send('') : res.status(400).send(new ResponseMessage(uuidv4(),'Not allowed','Failed'));
    //configurationPickupMap.delete(req.params.id) ? res.status(204).send('') : res.status(400).send(new ResponseMessage(uuidv4(),`Unable to delete id ${req.params.id}`,'Failed'));
  else 
    res.status(400).send(new ResponseMessage(uuidv4(),`Pickup :  ${GlobalConfiguration.configurationPickupMap.get(req.params.id).connectionName} used in flow :  ${flowName}`,'Failed')) ;
};


export default pickupRoutes;
