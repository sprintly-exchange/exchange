import { Router } from 'express';
import { filterResultsBasedOnUserRoleAndUserId, getOrganizatonNameById, setCommonHeaders, userHasDeleteRights } from '../../api/utilities/serverCommon.mjs';
import { v4 as uuidv4 } from 'uuid';
import { ResponseMessage } from '../../api/models/ResponseMessage.mjs';
import { filterResultsBasedOnUserRole } from '../../api/utilities/serverCommon.mjs';

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
    req.body.id === undefined ? req.body.id = uuidv4() : '';
    configurationFlowMap.set(req.body.id, req.body);
    setCommonHeaders(res);
    res.status(201).send(JSON.stringify(new ResponseMessage(req.body.id)));
});

flowRoutes.put('/', function (req, res) {   
    console.debug(`Flow received : ${JSON.stringify(req.body)}`);
    configurationFlowMap.set(req.body.id, req.body);
    setCommonHeaders(res);
    res.status(201).send(JSON.stringify(new ResponseMessage(req.body.id)));
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
flowRoutes.get('/', function (req, res) { 
    console.debug(`All flows requested.`);
    getFlows(req, res);
});

async function getFlows(req,res){
    setCommonHeaders(res);
    const events = await filterResultsBasedOnUserRoleAndUserId(configurationFlowMap,req);
    events.forEach(async (item) => {
        try{
            item.pickupName = configurationPickupMap.get(item.pickupId).connectionName;
            item.deliveryName = configurationDeliveryMap.get(item.deliveryId).connectionName;
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
flowRoutes.get('/:id', function (req, res) {   
    console.debug(`Flow id requested : ${req.params.id}`);
    setCommonHeaders(res);
    configurationFlowMap.has(req.params.id) ? res.status(200).send(JSON.stringify(configurationFlowMap.get(req.params.id))) : res.status(204).send('{}'); 
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
flowRoutes.delete('/:id', function (req, res) {   
    console.debug(`Flow deletion id requested : ${req.params.id}`);
    setCommonHeaders(res);
    console.log(`Attempting to delete flow with ID: ${req.params.id}`);
    console.log(`Current flows: ${configurationFlowMap.size}`);
    
    //configurationFlowMap.delete(req.params.id) ? res.status(204).send('') : res.status(400).send('{}'); 
    userHasDeleteRights(req,configurationFlowMap,req.params.id) === true ? res.status(200).send('') : res.status(400).send(new ResponseMessage(uuidv4(),'Not allowed','Failed'));

    console.log(`Current flows after deletion: ${configurationFlowMap.size}`);
});

flowRoutes.put('/activation/:id', function (req, res) {   
    console.debug(`Flow update requested : ${req.params.id}`);
    console.debug(`status change: ${req.body.active}`);
    const flow = configurationFlowMap.get(req.params.id);
    flow.activationStatus = req.body.active;
    configurationFlowMap.set(req.params.id,flow);
    setCommonHeaders(res);
   res.status(200).send('');

});

export default flowRoutes;
