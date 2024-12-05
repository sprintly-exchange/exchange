import { Router } from 'express';
import { setCommonHeaders } from '../../api/utilities/serverCommon.mjs';
import { countFlowNamePerMinute, countFlows, countFlowsPerMinute, searchTranscationsBetweenDatesByEpochTime, searcTransationSearchByIds, transactionSummary, transactionSummaryWithTimeInMinutes } from './transactionUtils.mjs';
import { v4 as uuidv4 } from 'uuid';
import { ResponseMessage } from '../../api/models/ResponseMessage.mjs';
import { userHasDeleteRights, filterResultsBasedOnUserRole } from '../../api/utilities/serverCommon.mjs';
import GlobalConfiguration from '../../GlobalConfiguration.mjs';
import { CommonFunctions } from '../../api/models/CommonFunctions.mjs';

const transactionRoutes = Router();
/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: APIs related to transactions
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

transactionRoutes.get('/', function (req, res) {   
    CommonFunctions.logWithTimestamp(`All transactions requested`);
    getTransactions(req,res);   
});

async function getTransactions(req:any,res:any){
    setCommonHeaders(res);
    const events = await filterResultsBasedOnUserRole(GlobalConfiguration.transactionsStatisticsMap,req);
    return events.length > 0 ? res.status(200).send(events) : res.status(204).send('');     
};

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the transaction to delete
 *     responses:
 *       '204':
 *         description: Transaction deleted successfully
 *       '400':
 *         description: Invalid request or transaction not found
 */

transactionRoutes.delete('/:id', function (req, res) {   
    deleteTransaction(req,res);
});


async function deleteTransaction(req:any, res:any) {   
    CommonFunctions.logWithTimestamp(`Transaction deletion id requested : ${req.params.id}`);
    setCommonHeaders(res);
    CommonFunctions.logWithTimestamp(`Attempting to delete transaction with id :  ${req.params.id}`);
    CommonFunctions.logWithTimestamp(`Current transactions : ${GlobalConfiguration.transactionsStatisticsMap.size}`);
    await userHasDeleteRights(req,GlobalConfiguration.transactionsStatisticsMap,req.params.id) ? res.status(200).send('') : res.status(400).send(new ResponseMessage(uuidv4(),'Not allowed','Failed'));
    CommonFunctions.logWithTimestamp(`Current transactions after deletion: ${GlobalConfiguration.transactionsStatisticsMap.size}`);
};

/**
 * @swagger
 * /api/transactions/statistics/minute:
 *   get:
 *     summary: Get count of flow names per minute
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */

transactionRoutes.get('/statistics/minute', function (req, res) {   
    CommonFunctions.logWithTimestamp(`Statistics transactions /statistics/minute requested.`);
    statisticsPerMinute(req,res);
});

async function statisticsPerMinute(req:any,res:any){
    setCommonHeaders(res);
    const events = await filterResultsBasedOnUserRole(GlobalConfiguration.transactionsStatisticsMap,req);
    return events.length > 0 ? res.status(200).send(countFlowNamePerMinute(events)) : res.status(204).send('');
}

/**
 * @swagger
 * /api/transactions/statistics/summary:
 *   get:
 *     summary: Get transaction summary
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */

transactionRoutes.get('/statistics/summary', function (req, res) {   
    CommonFunctions.logWithTimestamp(`Statistics transactions /statistics/summary requested.`);
    getSummary(req,res);
});

async function getSummary(req:any,res:any){
    setCommonHeaders(res);
    const events:any = await filterResultsBasedOnUserRole(GlobalConfiguration.transactionsStatisticsMap,req);
    return events.length > 0 ? res.status(200).send(transactionSummary(events)) : res.status(204).send('');
   
};


/**
 * @swagger
 * /api/transactions/statistics/summary/statuses:
 *   get:
 *     summary: Get transaction summary with time in minutes
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */

transactionRoutes.get('/statistics/summary/statuses', function (req, res) {   
    CommonFunctions.logWithTimestamp(`Statistics transactions /statistics/summary/statuses requested.`);
    getSummaryStatuses(req,res);
});

async function getSummaryStatuses(req:any,res:any){
    const events = await filterResultsBasedOnUserRole(GlobalConfiguration.transactionsStatisticsMap,req);
    setCommonHeaders(res);
    return events.length > 0 ? res.status(200).send(transactionSummaryWithTimeInMinutes(events)) : res.status(204).send(''); 
};

/**
 * @swagger
 * /api/transactions/statistics/flows/minute:
 *   get:
 *     summary: Get count of flows per minute
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */

transactionRoutes.get('/statistics/flows/minute', function (req, res) {   
    CommonFunctions.logWithTimestamp(`Statistics flows /statistics/flows/minute requested.`);
    getFlowsPerMinute(req,res);
});

async function getFlowsPerMinute(req:any,res:any){
    const events = await filterResultsBasedOnUserRole(GlobalConfiguration.transactionsStatisticsMap,req);
    setCommonHeaders(res);
    return events.length > 0 ? res.status(200).send(countFlowsPerMinute(events)) : res.status(204).send(''); 
};

/**
 * @swagger
 * /api/transactions/statistics/flows/count:
 *   get:
 *     summary: Get count of flows
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */

transactionRoutes.get('/statistics/flows/count', function (req, res) {   
    CommonFunctions.logWithTimestamp(`Statistics count /statistics/flows/count requested.`);
    getFlowCounts(req,res);
    
});



async function getFlowCounts(req:any,res:any){
    const events = await filterResultsBasedOnUserRole(GlobalConfiguration.transactionsStatisticsMap,req);
    setCommonHeaders(res);
    return events.length > 0 ? res.status(200).send(countFlows(events)) : res.status(204).send(''); 
}

/**
 * @swagger
 * /api/transactions/search:
 *   get:
 *     summary: Search transactions between dates
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *         required: true
 *         description: Start epoch time
 *       - in: query
 *         name: end
 *         schema:
 *           type: integer
 *         required: true
 *         description: End epoch time
 *     responses:
 *       '200':
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

transactionRoutes.get('/search', function (req, res) {   
    CommonFunctions.logWithTimestamp(`Transaction search request requested between start : ${req.query.start} and end : ${req.query.end}`);
    transationSearch(req,res);
});

async function transationSearch(req:any,res:any){
    const start = Number(req.query.start);
    const end = Number(req.query.end);
    //CommonFunctions.logWithTimestamp('transactonsStatisticsMap length', transactonsStatisticsMap.size);
    const events = await filterResultsBasedOnUserRole(GlobalConfiguration.transactionsStatisticsMap,req);
    CommonFunctions.logWithTimestamp(`Transaction search request between start : ${new Date(start).toISOString()} and end : ${new Date(end).toISOString()}`);
    setCommonHeaders(res);
    const eventsByDate = searchTranscationsBetweenDatesByEpochTime(start, end,events);
    return eventsByDate.length > 0 ? res.status(200).send(eventsByDate) : res.status(204).send(new ResponseMessage(uuidv4(),`Transactions not found.`,'Failed')); 
}

transactionRoutes.get('/searchByIds', function (req, res) {   
    CommonFunctions.logWithTimestamp(`Transaction search request requested between messageId : ${req.query.messageId}, senderId : ${req.query.senderId} , receiverId : ${req.query.receiverId}`);
    transationSearchByIds(req,res);
});

async function transationSearchByIds(req:any,res:any){
    const events = await filterResultsBasedOnUserRole(GlobalConfiguration.transactionsStatisticsMap,req);
    setCommonHeaders(res);
    const eventsByIds = searcTransationSearchByIds(req.query.messageId,req.query.senderId,req.query.receiverId,events)
    return eventsByIds.length > 0 ? res.status(200).send(eventsByIds) : res.status(204).send(new ResponseMessage(uuidv4(),`Transactions not found.`,'Failed')); 
    
    CommonFunctions.logWithTimestamp('events',events.length);return eventsByIds.length > 0 ? res.status(200).send(eventsByIds) : res.status(204).send(new ResponseMessage(uuidv4(),`Transactions not found.`,'Failed')); 
}

export default transactionRoutes;
