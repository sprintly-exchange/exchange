import { Router } from 'express';
import { setCommonHeaders } from '../../api/utilities/serverCommon.mjs';
import { v4 as uuidv4 } from 'uuid';
import GlobalConfiguration from '../../GlobalConfiguration';

const systemStatusRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: System Status
 *   description: APIs for system status and queue statistics
 */

/**
 * @swagger
 * /api/system-status/queue/statistics:
 *   get:
 *     summary: Get queue statistics
 *     description: Retrieves the statistics of various processing queues
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Pickup Processing Queue:
 *                   type: integer
 *                 Configuration Processing Queue:
 *                   type: integer
 *                 Delivery Processing Queue:
 *                   type: integer
 */

systemStatusRoutes.get('/queue/statistics', function (req, res) {   
    console.debug(`Queue statistics requested`);
    setCommonHeaders(res);

    const queueStat = {
        'Pickup Processing Queue': GlobalConfiguration.pickupProcessingQueue.size(),
        'Configuration Processing Queue': GlobalConfiguration.configurationProcessingQueue.size(),
        'Delivery Processing Queue': GlobalConfiguration.deliveryProcessingQueue.size(),
    };
    res.status(200).send(queueStat);
});

export default systemStatusRoutes;
