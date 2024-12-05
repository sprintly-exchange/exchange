import { Router } from 'express';
import { filterResultsBasedOnUserRoleAndUserId, getOrganizatonNameById, setCommonHeaders, userHasDeleteRights, mapEntrySearchByValue } from '../../api/utilities/serverCommon.mjs';
import { v4 as uuidv4 } from 'uuid';
import { ResponseMessage } from '../../api/models/ResponseMessage.mjs';
import GlobalConfiguration from '../../GlobalConfiguration.mjs';
import { CommonFunctions } from '../../api/models/CommonFunctions.mjs';

const flowRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Flow
 *   description: API endpoints for managing flows
 */

/**
 * @swagger
 * /api/flow:
 *   post:
 *     summary: Create a flow
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *             example:
 *               id: d290f1ee-6c54-4b01-90e6-d701748f0851
 *     responses:
 *       201:
 *         description: Flow created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseMessage'
 */
flowRoutes.post('/', function (req, res) {   
    console.debug(`Flow received : ${JSON.stringify(req.body)}`);
        
    //Check If a record already exists with name
    if(mapEntrySearchByValue(GlobalConfiguration.configurationFlowMap,'flowName',req.body.flowName)){
        res.status(400).send(new ResponseMessage(uuidv4(),'Record already exists with the same name','Failed'));
        return;
    }   

      
    req.body.id === undefined ? req.body.id = uuidv4() : '';
    GlobalConfiguration.configurationFlowMap.set(req.body.id, req.body);
    setCommonHeaders(res);
    res.status(201).send(JSON.stringify(new ResponseMessage(req.body.id,'','')));
});

flowRoutes.put('/', function (req, res) {   
    console.debug(`Flow received : ${JSON.stringify(req.body)}`);
    GlobalConfiguration.configurationFlowMap.set(req.body.id, req.body);
    setCommonHeaders(res);
    res.status(201).send(JSON.stringify(new ResponseMessage(req.body.id,'','')));
});

/**
 * @swagger
 * /api/flow:
 *   get:
 *     summary: Get all flows
 *     responses:
 *       '200':
 *         description: A list of all flows
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Flow'
 *       '204':
 *         description: No flows found
 */
flowRoutes.get('/', function (req:any, res:any) { 
    console.debug(`All flows requested.`);
    getFlows(req, res);
});

async function getFlows(req:any,res:any){
    setCommonHeaders(res);
    const events = await filterResultsBasedOnUserRoleAndUserId(GlobalConfiguration.configurationFlowMap,req);
    events.forEach(async (item) => {
        try{
            item.pickupName = GlobalConfiguration.configurationPickupMap.get(item.pickupId).connectionName;
            item.deliveryName = GlobalConfiguration.configurationDeliveryMap.get(item.deliveryId).connectionName;
            item.processingName = GlobalConfiguration.configurationProcessingMap.has(item.processingId) 
            ? GlobalConfiguration.configurationProcessingMap.get(item.processingId).processingName 
            : item.processingName;
            item.organizationName = await getOrganizatonNameById(item.organizationId);           
        }catch(error){
            //
        }
    })
    return events.length > 0 ? res.status(200).send(events) : res.status(204).send(''); 
};

/**
 * @swagger
 * /api/flow/{id}:
 *   get:
 *     summary: Get a flow by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the flow to retrieve
 *     responses:
 *       '200':
 *         description: Flow retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Flow'
 *       '204':
 *         description: Flow not found
 */
flowRoutes.get('/:id', function (req:any, res:any) {   
    console.debug(`Flow id requested : ${req.params.id}`);
    setCommonHeaders(res);
    GlobalConfiguration.configurationFlowMap.has(req.params.id) ? res.status(200).send(JSON.stringify(GlobalConfiguration.configurationFlowMap.get(req.params.id))) : res.status(204).send('{}'); 
});

/**
 * @swagger
 * /api/flow/{id}:
 *   delete:
 *     summary: Delete a flow by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the flow to delete
 *     responses:
 *       '204':
 *         description: Flow deleted successfully
 *       '400':
 *         description: Unable to delete flow due to an error
 */
flowRoutes.delete('/:id', function (req:any, res:any) {   
 deleteFlow(req,res);
});

async function deleteFlow(req:any,res:any){
    console.debug(`Flow deletion id requested : ${req.params.id}`);
    setCommonHeaders(res);
    CommonFunctions.logWithTimestamp(`Attempting to delete flow with ID: ${req.params.id}`);
    CommonFunctions.logWithTimestamp(`Current flows: ${GlobalConfiguration.configurationFlowMap.size}`);
    await userHasDeleteRights(req,GlobalConfiguration.configurationFlowMap,req.params.id) ? res.status(200).send('') : res.status(400).send(new ResponseMessage(uuidv4(),'Not allowed','Failed'));
    CommonFunctions.logWithTimestamp(`Current flows after deletion: ${GlobalConfiguration.configurationFlowMap.size}`);
};

flowRoutes.put('/activation/:id', function (req:any, res:any) {   
    console.debug(`Flow update requested : ${req.params.id}`);
    console.debug(`status change: ${req.body.active}`);
    const flow = GlobalConfiguration.configurationFlowMap.get(req.params.id);
    flow.activationStatus = req.body.active;
    GlobalConfiguration.configurationFlowMap.set(req.params.id,flow);
    setCommonHeaders(res);
   res.status(200).send('');

});

export default flowRoutes;
