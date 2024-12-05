import { Router } from 'express';
import { setCommonHeaders } from '../../api/utilities/serverCommon.mjs';
import GlobalConfiguration from '../../GlobalConfiguration.mjs';
import { CommonFunctions } from '../../api/models/CommonFunctions.mjs';

const messageStoreRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Message Store
 *   description: APIs for message store operations
 */

/**
 * @swagger
 * /api/messagestore/download:
 *   get:
 *     summary: Download a message
 *     parameters:
 *       - in: query
 *         name: messagePath
 *         schema:
 *           type: string
 *         required: true
 *         description: Download messages given the message path
 *     responses:
 *       '200':
 *         description: Successful response
 *       '404':
 *         description: Not found
 */
messageStoreRoutes.get('/download', async function (req:any, res:any) {  
    const messagePath = req.query.messagePath;
    CommonFunctions.logWithTimestamp(`Message received to be retrieved from message store : ${messagePath}`);
    setCommonHeaders(res);
    // Assuming storage is defined somewhere in your application
    res.status(200).send(await GlobalConfiguration.storage.getMessage(messagePath));
});

export default messageStoreRoutes;
