import { Router } from 'express';
import { getItemByUserId, setCommonHeaders } from '../../api/utilities/serverCommon.mjs';
import {v4 as uuidv4} from 'uuid';
import { ResponseMessage } from '../../api/models/ResponseMessage.mjs';
import { getAuthDetails } from '../../api/utilities/getOrganization&User.mjs';

const configurationRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Configuration
 *   description: API endpoints for managing configurations
 */

/**
 * @swagger
 * /api/configuration:
 *   post:
 *     summary: Create a configuration
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
 *         description: Configuration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseMessage'
 */
configurationRoutes.post('app/', function (req, res) {   
    console.debug(`Configuration received : ${JSON.stringify(req.body)}`);
    req.body.id === undefined ? req.body.id = uuidv4() :'';
    forntEndConfigurationMap.set(req.body.id, req.body);
    setCommonHeaders(res);
    res.status(201).send(JSON.stringify(new ResponseMessage(req.body.id)));
});

configurationRoutes.post('/user', function (req, res) {   
    console.debug(`User configuration received : ${JSON.stringify(req.body)}`);
    saveUserConfig(req,res);
});

async function saveUserConfig(req,res)
{
    const { userId, organizationId } = await getAuthDetails( req.headers['authorization']);
    forntEndConfigurationMap.set(userId, req.body);
    setCommonHeaders(res);
    res.status(201).send(JSON.stringify(new ResponseMessage(userId)));
};

/**
 * @swagger
 * /api/configuration/{id}:
 *   get:
 *     summary: Get a configuration by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the configuration to retrieve
 *     responses:
 *       '200':
 *         description: Configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 id: d290f1ee-6c54-4b01-90e6-d701748f0851
 *       '204':
 *         description: No content
 */
configurationRoutes.get('app/:id', function (req, res) {   
    console.debug(`Configuration id requested : ${req.params.id}`);
    setCommonHeaders(res);
    forntEndConfigurationMap.has(req.params.id) ? res.status(200).send(JSON.stringify(forntEndConfigurationMap.get(req.params.id))) : res.status(204).send('{}');
});


configurationRoutes.get('/user', function (req, res) {   
    console.debug(`User configuration requested`);
    getUserConfig(req,res);
   });

async function getUserConfig(req,res) {
    setCommonHeaders(res);

    const events = await getItemByUserId(forntEndConfigurationMap,req);
    if (events !== undefined ) {
        res.status(200).send(events);
    } else {
        // Handle case where events is not an array
        return res.status(204).send('');
    }
}

export default configurationRoutes;
