import { Router } from 'express';
import { getItemByUserId, setCommonHeaders } from '../../api/utilities/serverCommon.mjs';
import {v4 as uuidv4} from 'uuid';
import { ResponseMessage } from '../../api/models/ResponseMessage.mjs';
import { getAuthDetails } from '../../api/utilities/getOrganization&User.mjs';
import { setProcessConfigurationProcessingQueueInterval, setProcessDeliveryProcessingQueueInterval, setProcessPickupProcessingQueueInterval, setProcessRulesInterval, setRemoveOldTransactionsInterval } from '../../../server.mjs';
import appEnumerations from '../../api/utilities/severInitFunctions.mjs';

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

configurationRoutes.get('/system/settings', function (req, res) {   
    console.debug(`System settings configuration requested`);
    getSystemSettings(req,res);
});

async function getSystemSettings(req,res) {
    const { userId, organizationId } = await getAuthDetails( req.headers['authorization']);
    setCommonHeaders(res); 
    // Assuming global.serverConfigurationMap is a Map
    const events = Object.fromEntries(global.serverConfigurationMap);
    // Convert to JSON string
    const eventsJson = JSON.stringify(events);
    return res.status(200).send(eventsJson);
    
}

configurationRoutes.put('/system/settings', function (req, res) {   
    console.debug(`System settings configuration requested`);
    updateSystemSettings(req,res);
});

async function updateSystemSettings(req, res) {
    try {
        // Assuming req.body contains the new settings
        const newSettings = req.body;

        // Loop through each key in newSettings and update the global map
        for (const [key, value] of Object.entries(newSettings)) {
            if (global.serverConfigurationMap.has(key)) {
                global.serverConfigurationMap.set(key, Number(value));
                key === appEnumerations.PROCESS_RULES_TIME_INTERVAL ? setProcessRulesInterval() : '';
                key === appEnumerations.PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL ? setProcessPickupProcessingQueueInterval(): '';
                key === appEnumerations.PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL ? setProcessConfigurationProcessingQueueInterval(): '';
                key === appEnumerations.PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL ? setProcessDeliveryProcessingQueueInterval(): '';
                key === appEnumerations.REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL || key === appEnumerations.REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS ? setRemoveOldTransactionsInterval(): '';
            } else {
                console.log(`Key ${key} not found in global serverConfigurationMap.`);
            }
        }

        res.status(200).json({ message: 'System settings updated successfully' });
    } catch (error) {
        console.error('Error updating system settings:', error);
        res.status(500).json(new ResponseMessage(uuidv4,'Internal server error','Failed'));
    }
}


export default configurationRoutes;
