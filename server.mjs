
import dotenv from 'dotenv';
import express from 'express';
import {v4 as uuidv4} from 'uuid';
import { TransactionProcessManager } from './src/api/processor/transactionProcessManager.mjs';
import { decodeToken } from './src/api/utilities/reqestInterceptor.mjs';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.mjs';
import bodyParser from 'body-parser';
import { setCommonHeaders } from './src/api/utilities/serverCommon.mjs';


//import routes
import demoRoutes from './src/routes/demo/demoRoutes.mjs';
import pickupRoutes from './src/routes/pickup/pickupRoutes.mjs';
import deliveryRoutes from  './src/routes/delivery/deliveryRoutes.mjs';
import flowRoutes from  './src/routes/flow/flowRoutes.mjs';
import transactionRoutes from './src/routes/transaction/transactionRoutes.mjs';
import processingRoutes from './src/routes/processing/processingRoutes.mjs';
import messageStoreRoutes from './src/routes/messageStore/messageStoreRoutes.mjs';
import configurationRoutes from './src/routes/configuration/configurationRoutes.mjs';
import systemStatusRoutes from './src/routes/systemStatus/systemStatusRoutes.mjs';
import loginRoutes from './src/routes/login/loginRoutes.mjs';
import organizationRoutes from './src/routes/organization/organizationRoutes.mjs';
import userRoutes from './src/routes/user/userRoutes.mjs';
import { initFunction} from './src/api/utilities/severInitFunctions.mjs';
import {CustomLogger } from './src/api/logging/customLogger.mjs';
import requestId from 'express-request-id';
import OpenApis from './src/routes/openapi/openApis.mjs';
import cors from 'cors';


const SERVER_PORT = process.env.SERVER_PORT || 4000;

var app = express();
dotenv.config();

//JSON body parser
app.use(bodyParser.json() );      
app.use(bodyParser.urlencoded({  extended: true }));

//Logging
//app.use(logRequest);
//app.use(logError);

// Middleware to create and attach a custom logger to each request
// Add request ID middleware
app.use(requestId());

// Add request ID middleware
app.use(requestId());

// Or configure specific options
// app.use(cors({ origin: 'http://example.com' }));
app.use(cors()); // Enable CORS for all routes


//customer loger
//const logger = new CustomLogger();

// Middleware to create and attach a custom logger to each request
/*
app.use((req, res, next) => {
  const logFileName = `${req.id}.log`;
  req.log = logger.createLogger(logFileName);
  req.log.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});
*/

// Middleware to log the response
/*
app.use((req, res, next) => {
  const oldSend = res.send;
  res.send = function (data) {
    req.log.info(`Outgoing response: ${res.statusCode} ${data}`);
    oldSend.apply(res, arguments);
  };
  next();
});
*/

// Use the decodeToken middleware
app.use(decodeToken);
initFunction();

//swagger UI
// Serve Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.options('*', function (req, res) {   
      console.debug(`Options request..`);
      setCommonHeaders(res);
      res.status(200).send('');
});

app.use(cors({
      origin: '*', // Replace with your frontend's URL
}));

// Use the imported routes
app.use('/api/demo', demoRoutes);
app.use('/api/pickup/',pickupRoutes);
app.use('/api/delivery/',deliveryRoutes);
app.use('/api/flow/',flowRoutes);
app.use('/api/transactions/',transactionRoutes);
app.use('/api/processing/',processingRoutes);
app.use('/api/messagestore/',messageStoreRoutes);
app.use('/api/configuration/',configurationRoutes);
app.use('/api/system/',systemStatusRoutes);
app.use('/api/iam',loginRoutes);
app.use('/api/organizations',organizationRoutes);
app.use('/api/users',userRoutes);
app.use('/api/openapis',OpenApis);

app.get('/api/dummy', function (req, res) {   
      console.debug(`Dummy API request for debugging requested.`);
      console.log('Request headers' ,req.headers);
      setCommonHeaders(res);
      res.status(200).send('');    
});


// Continous function to process rules
setInterval(processRules, 10000);
function processRules() {
    const date = new Date();
    const configurationPickupMapSet = [...new Set(configurationPickupMap.values())];
    const configurationDeliveryMapSet = [...new Set(configurationDeliveryMap.values())];
    const configurationProcessingMapSet = [...new Set(configurationProcessingMap.values())];
    //console.log('configurationProcessingMapSet',configurationProcessingMapSet);
    console.debug(`processing started ${date.toLocaleTimeString()} `);
    configurationFlowMap.forEach((configurationFlowMapItem,key) => {
      if(configurationFlowMapItem.activationStatus){
            console.debug('Processing flow : ',configurationFlowMapItem.flowName);
            const configPickup = configurationPickupMapSet.filter((object)=> object.id === configurationFlowMapItem.pickupId)[0];//extract current pickup method
            const configDelivery = configurationDeliveryMapSet.filter((object)=> object.id === configurationFlowMapItem.deliveryId)[0];//extract current delivery method
            const configProcessing = configurationProcessingMapSet.filter((object)=> object.id === configurationFlowMapItem.processingId)[0];
            const transactionProcessManager = new TransactionProcessManager(configPickup,configDelivery,configProcessing,configurationFlowMapItem);
            //Using queues ideal for B2B integrations
            pickupProcessingQueue.enqueue(transactionProcessManager);
      }
    }) ;
}

//continous function to process pickup queue
setInterval(processPickupProcessingQueue, 1000);
async function processPickupProcessingQueue() {
      const queueEntry = pickupProcessingQueue.dequeue();
      if(queueEntry === undefined || queueEntry == null){
            console.log('Nothing to process from processing queue.')
            return;
      }
      console.log(`START-PROCESSING ****************`);
      await queueEntry.processPickup();
      console.log(`END-PROCESSING ****************`);
}


setInterval(processDeliveryProcessingQueue, 1000);
async function processDeliveryProcessingQueue() {
      const queueEntry = deliveryProcessingQueue.dequeue();
      if(queueEntry === undefined || queueEntry == null){
            console.log('Nothing to process from delivery queue.')
            return;
      }
      console.log(`START-DELIVERY ****************`);
      await queueEntry.processDelivery();
      console.log(`END-DELIVERY ****************`);
}



setInterval(processConfigurationProcessingQueue, 1000);
async function processConfigurationProcessingQueue() {
      const queueEntry = configurationProcessingQueue.dequeue();
      if(queueEntry === undefined || queueEntry == null){
            console.log('Nothing to process from configuration queue.')
            return;
      }
      console.log(`START-CONFIGURATION-PROCESSOR ****************`);
      await queueEntry.configurationProcessing();
      console.log(`END-CONFIGURATION-PROCESSOR ****************`);
}

   // Cleanup function to remove old transactions
  setInterval(removeOldTransactions, 5000);
  async function removeOldTransactions() {
      const thresholdDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

      // Iterate over a copy of the Map entries to avoid modification during iteration
      console.log(`START-TRANSACTION-PURGE ****************`);
      for (const [id, { processingTime }] of Array.from(transactonsStatisticsMap.entries())) {
          const processingDate = new Date(processingTime); // Convert ISO 8601 string to Date object
          if (processingDate < thresholdDate) {
             transactonsStatisticsMap.delete(id);
              console.log(`Old transaction removed with ID: ${id}`);
          }
      }
      console.log(`END-TRANSACTION-PURGE ****************`);
  }

// Expres server
var server = app.listen(`${SERVER_PORT}`, function () {
   console.debug(`Express App running at http://127.0.0.1:${SERVER_PORT}/`);
});








