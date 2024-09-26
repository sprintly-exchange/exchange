import { Router } from 'express';
import { filterResultsBasedOnUserRoleAndUserId, setCommonHeaders, userHasDeleteRights } from '../../api/utilities/serverCommon.mjs';
import { v4 as uuidv4 } from 'uuid';
import { ResponseMessage } from '../../api/models/ResponseMessage.mjs';

const processingRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Processing
 *   description: APIs for processing operations
 */

/**
 * @swagger
 * /api/processing:
 *   post:
 *     summary: Create a new processing entry
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
 *               id: 12345
 *     responses:
 *       '201':
 *         description: Processing entry created successfully
 */

processingRoutes.post('/', function (req, res) {   
    console.debug(`Processing received : ${JSON.stringify(req.body)}`);
    setCommonHeaders(res);
    if(req.body === '[]') 
      res.status(400).send('No data');
    //console.debug(`Pickup received : ${JSON.stringify(req.body)}`);
    req.body.id === undefined ? req.body.id = uuidv4() :'';
    configurationProcessingMap.set(req.body.id,req.body);
    res.status(201).send(JSON.stringify(new ResponseMessage(req.body.id)));
});

processingRoutes.put('/', function (req, res) {  
    console.debug(`Processing update request received : ${JSON.stringify(req.body)}`);
    setCommonHeaders(res);
    if(req.body.id === undefined || req.body === '[]'){
          res.status(400).send('No data'); 
          return;
    }
          
    setCommonHeaders(res);
    configurationProcessingMap.set(req.body.id,req.body);
    res.status(201).send(JSON.stringify(new ResponseMessage(req.body.id))); 
});

/**
 * @swagger
 * /api/processing/{id}:
 *   get:
 *     summary: Get processing details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the processing entry to retrieve
 *     responses:
 *       '200':
 *         description: Successful response
 *       '204':
 *         description: Processing entry not found
 */

processingRoutes.get('/:id', function (req, res) {   
    console.debug(`Processing id requested : ${req.params.id}`);
    setCommonHeaders(res);
    configurationProcessingMap.has(req.params.id) ? res.status(200).send(JSON.stringify(configurationProcessingMap.get(req.params.id))) : res.status(204).send('{}');
});

processingRoutes.get('/', function (req, res) {   
    console.debug(`All processing requested`);
    getProcessing(req,res);
});

async function getProcessing(req,res){
    setCommonHeaders(res);
    const events = await filterResultsBasedOnUserRoleAndUserId(configurationProcessingMap,req);
    console.log(events);
    return events.length > 0 ? res.status(200).send(events) : res.status(204).send(''); 
  };

  processingRoutes.delete('/:id', function (req, res) {   
    console.debug(`Processing deletion id requested : ${req.params.id}`);
    setCommonHeaders(res);
    console.log(`Attemting to delete processing with id :  ${req.params.id}`);
    
    let flowFound=false;
    let flowId='';
    let flowName='';
    configurationFlowMap.forEach(function (flow){
          if(flow.processingId === `${req.params.id}`){
                flowFound = true;
                flowId = flow.id;
                flowName = flow.flowName;

          }          
    }    
    );
    if(!flowFound)
        userHasDeleteRights(req,configurationProcessingMap,req.params.id) === true ? res.status(200).send('') : res.status(400).send(new ResponseMessage(uuidv4(),'Not allowed','Failed'));
        //configurationProcessingMap.delete(req.params.id) ? res.status(204).send('') : res.status(400).send(new ResponseMessage(uuidv4(),`Unable to delete id ${req.params.id}`,'Failed'));
    else 
      res.status(400).send(new ResponseMessage(uuidv4(),`Processing :  ${configurationProcessingMap.get(req.params.id).processingName} used in flow :  ${flowName}`,'Failed')) ;
});

export default processingRoutes;
