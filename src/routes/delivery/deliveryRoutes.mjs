import { Router } from 'express';
import { filterResultsBasedOnUserRoleAndUserId, setCommonHeaders, userHasDeleteRights , mapEntrySearchByValue} from '../../api/utilities/serverCommon.mjs';
import { v4 as uuidv4 } from 'uuid';
import { ResponseMessage } from '../../api/models/ResponseMessage.mjs';
import { filterResultsBasedOnUserRole } from '../../api/utilities/serverCommon.mjs';

const deliveryRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Delivery
 *   description: API endpoints for managing deliveries
 */

/**
 * @swagger
 * /api/delivery:
 *   post:
 *     summary: Create a delivery
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
 *         description: Delivery created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseMessage'
 */
deliveryRoutes.post('/', function (req, res) {   
    console.debug(`Delivery received : ${JSON.stringify(req.body)}`);
    setCommonHeaders(res);
    if (req.body === '[]') {
        res.status(400).send('No data'); 
        return;
    }

    //Check If a record already exists with name
    if(mapEntrySearchByValue(configurationDeliveryMap,'connectionName',req.body.connectionName)){
        res.status(400).send(new ResponseMessage(uuidv4,'Record already exists with the same name','Failed'));
        return;
    }   

    req.body.id === undefined ? req.body.id = uuidv4() : '';
    configurationDeliveryMap.set(req.body.id, req.body);
    res.status(201).send(JSON.stringify(new ResponseMessage(req.body.id))); 
});

/**
 * @swagger
 * /api/delivery:
 *   put:
 *     summary: Update a delivery
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
 *         description: Delivery updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseMessage'
 */
deliveryRoutes.put('/', function (req, res) {   
    console.debug(`Delivery update request received : ${JSON.stringify(req.body)}`);
    setCommonHeaders(res);
    if (req.body.id === undefined || req.body === '[]') {
        res.status(400).send('No data'); 
        return;
    }
    configurationDeliveryMap.set(req.body.id, req.body);
    res.status(201).send(JSON.stringify(new ResponseMessage(req.body.id))); 
});

/**
 * @swagger
 * /api/delivery:
 *   get:
 *     summary: Get all deliveries
 *     responses:
 *       '200':
 *         description: A list of all deliveries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Delivery'
 *       '204':
 *         description: No deliveries found
 */
deliveryRoutes.get('/', function (req, res) {   
    console.debug(`All deliveries requested`);
    getDeliveries(req, res);
});

async function getDeliveries(req,res){
    setCommonHeaders(res);
    const events = await filterResultsBasedOnUserRoleAndUserId(configurationDeliveryMap,req);
    return events.length > 0 ? res.status(200).send(events) : res.status(204).send(''); 
};

/**
 * @swagger
 * /api/delivery/{id}:
 *   get:
 *     summary: Get a delivery by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the delivery to retrieve
 *     responses:
 *       '200':
 *         description: Delivery retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Delivery'
 *       '406':
 *         description: Delivery not found
 */
deliveryRoutes.get('/:id', function (req, res) {   
    console.debug(`Delivery id requested : ${req.params.id}`);
    setCommonHeaders(res);
    configurationDeliveryMap.has(req.params.id) ? res.status(200).send(JSON.stringify(configurationDeliveryMap.get(req.params.id))) : res.status(406).send('{}'); 
});

/**
 * @swagger
 * /api/delivery/{id}:
 *   delete:
 *     summary: Delete a delivery by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the delivery to delete
 *     responses:
 *       '204':
 *         description: Delivery deleted successfully
 *       '400':
 *         description: Unable to delete delivery ID due to usage in a flow
 */
deliveryRoutes.delete('/:id', function (req, res) {   
    console.debug(`Delivery deletion id requested : ${req.params.id}`);
    setCommonHeaders(res);
    console.log(`Attempting to delete delivery with ID: ${req.params.id}`);

    let flowFound = false;
    let flowId = '';
    let flowName = '';
    configurationFlowMap.forEach(function (flow) {
        console.log('flow.deliveryId', flow.deliveryId);
        console.log('req.params.id', req.params.id);
        if (flow.deliveryId === `${req.params.id}`) {
            flowFound = true;
            flowId = flow.id;
            flowName= flow.flowName;
        }          
    });

    console.log('flowFound:', flowFound);

    if (!flowFound) {
        userHasDeleteRights(req,configurationDeliveryMap,req.params.id) ? res.status(200).send('') : res.status(400).send(new ResponseMessage(uuidv4(),'Not allowed','Failed'));
        //configurationDeliveryMap.delete(req.params.id) ? res.status(204).send('') : res.status(400).send(`{"Status":"Unable to delete ID ${req.params.id}"}`);
    } else {
        res.status(400).send(new ResponseMessage(uuidv4(),`Delivery :  ${configurationDeliveryMap.get(req.params.id).connectionName} used in flow :  ${flowName}`,'Failed')) ;
    }

    console.log(`Current deliveries after deletion: ${configurationDeliveryMap.size}`);
});

export default deliveryRoutes;
