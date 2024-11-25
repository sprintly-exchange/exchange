
import dotenv from 'dotenv';
import express from 'express';
import {v4 as uuidv4} from 'uuid';
import { TransactionProcessManager } from './api/processor/transactionProcessManager.mjs';
import { decodeToken } from './api/utilities/reqestInterceptor.mjs';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.mjs';
import bodyParser from 'body-parser';
import { setCommonHeaders } from './api/utilities/serverCommon.mjs';


//import routes
import demoRoutes from './routes/demo/demoRoutes.mjs';
import pickupRoutes from './routes/pickup/pickupRoutes.mjs';
import deliveryRoutes from  './routes/delivery/deliveryRoutes.mjs';
import flowRoutes from  './routes/flow/flowRoutes.mjs';
import transactionRoutes from './routes/transaction/transactionRoutes.mjs';
import processingRoutes from './routes/processing/processingRoutes.mjs';
import messageStoreRoutes from './routes/messageStore/messageStoreRoutes.mjs';
import configurationRoutes from './routes/configuration/configurationRoutes.mjs';
import systemStatusRoutes from './routes/systemStatus/systemStatusRoutes.mjs';
import loginRoutes from './routes/login/loginRoutes.mjs';
import organizationRoutes from './routes/organization/organizationRoutes.mjs';
import userRoutes from './routes/user/userRoutes.mjs';
import appEnumerations, { initFunction} from './api/utilities/severInitFunctions.mjs';
import {CustomLogger } from './api/logging/customLogger.mjs';
import { requestId } from 'express-request-id';
import OpenApis from './routes/openapi/openApis.mjs';
import cors from 'cors';
import GlobalConfiguration from './GlobalConfiguration';


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
await initFunction();

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


let processRulesInterval:any; // Store interval ID to clear it later

export function setProcessRulesInterval() {
  // Fetch interval time dynamically from the global server configuration map
  let processRulesTimeInterval = (GlobalConfiguration.serverConfigurationMap && GlobalConfiguration.serverConfigurationMap.get(appEnumerations.PROCESS_RULES_TIME_INTERVAL)) 
    ? GlobalConfiguration.serverConfigurationMap.get(appEnumerations.PROCESS_RULES_TIME_INTERVAL) 
    : 1000; // Default to 1000 if not defined
  console.log(appEnumerations.PROCESS_RULES_TIME_INTERVAL,processRulesTimeInterval);
  // Clear the previous interval if it exists
  if (processRulesInterval) {
    clearInterval(processRulesInterval);
  }

  // Set the new interval dynamically based on the configuration
  processRulesInterval = setInterval(processRules, processRulesTimeInterval);
}

// Call to set the initial interval
setProcessRulesInterval();

// Map to track active timeouts for each configurationFlowMapItem
const timeoutMap = new Map();

function processRules() {
  const date = new Date();
  const configurationPickupMapSet = [...new Set(GlobalConfiguration.configurationPickupMap.values())];
  const configurationDeliveryMapSet = [...new Set(GlobalConfiguration.configurationDeliveryMap.values())];
  const configurationProcessingMapSet = [...new Set(GlobalConfiguration.configurationProcessingMap.values())];

  console.info(`Processing rules started ${date.toLocaleTimeString()}`);

  GlobalConfiguration.configurationFlowMap.forEach((configurationFlowMapItem) => {
    if (configurationFlowMapItem.activationStatus) {
      console.debug('Processing flow : ', configurationFlowMapItem.flowName);

      const configPickup = configurationPickupMapSet.find((object) => object.id === configurationFlowMapItem.pickupId);
      const configDelivery = configurationDeliveryMapSet.find((object) => object.id === configurationFlowMapItem.deliveryId);
      const configProcessing = configurationProcessingMapSet.find((object) => object.id === configurationFlowMapItem.processingId);

      const transactionProcessManager = new TransactionProcessManager(configPickup, configDelivery, configProcessing, configurationFlowMapItem);
      
      // Determine retryInterval from configPickup or set a default of 60 seconds
      const retryInterval = Number(configPickup.retryInterval) > 0
        ? Number(configPickup.retryInterval) * 1000
        : 60 * 1000;

      //console.debug('retryInterval - ', retryInterval);

      // Retrieve any existing timeout info
      const existingTimeout = timeoutMap.get(configurationFlowMapItem.flowName);
      //console.debug('existingTimeout - ', existingTimeout);
      // Check if a timeout needs to be set or updated
      if (!existingTimeout || Number(existingTimeout.interval) !== retryInterval) {
        // Clear previous timeout if it's set and interval has changed
        if (existingTimeout) {
          clearTimeout(existingTimeout.id);
          console.debug(`Cleared existing timeout for ${configurationFlowMapItem.flowName} due to interval change.`);
        }

        // Set a new timeout for this configurationFlowMapItem
        const timeoutId = setTimeout(() => {
          GlobalConfiguration.pickupProcessingQueue.enqueue(transactionProcessManager);
          timeoutMap.delete(configurationFlowMapItem.flowName); // Clean up after enqueuing
        }, retryInterval);

        // Store the timeout ID and interval
        timeoutMap.set(configurationFlowMapItem.flowName, { id: timeoutId, interval: retryInterval });
      } else {
        console.debug(`Timeout for ${configurationFlowMapItem.flowName} with interval ${retryInterval / 1000}s is already set. Skipping duplicate.`);
      }
    }
  });

  console.info(`Processing rules ended ${date.toLocaleTimeString()}`);
}


// Whenever the configuration changes, call setProcessRulesInterval() again
// For example, this can be triggered whenever the map is updated


let processPickupProcessingQueueInterval:any; // Store interval ID to clear it later

export function setProcessPickupProcessingQueueInterval() {

  // Fetch interval time dynamically from the global server configuration map
  let processPickupProcessingQueueTimeInterval = (GlobalConfiguration.serverConfigurationMap && GlobalConfiguration.serverConfigurationMap.get(appEnumerations.PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL)) 
    ? GlobalConfiguration.serverConfigurationMap.get(appEnumerations.PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL)
    : 1000; // Default to 1000 if not defined

  console.log(appEnumerations.PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL,processPickupProcessingQueueTimeInterval);
  // Clear the previous interval if it exists
  if (processPickupProcessingQueueInterval) {
    clearInterval(processPickupProcessingQueueInterval);
  }

  // Set the new interval dynamically based on the configuration
 
  processPickupProcessingQueueInterval = setInterval(processPickupProcessingQueue, processPickupProcessingQueueTimeInterval);
}

// Call to set the initial interval
setProcessPickupProcessingQueueInterval();

// Function to process the pickup queue
async function processPickupProcessingQueue() {
  const queueEntry = GlobalConfiguration.pickupProcessingQueue.dequeue();

  if (queueEntry === undefined || queueEntry == null) {
    console.log('Nothing to process from the pickup queue.');
    return;
  }

  console.log(`START-PROCESSING ****************`);
  await queueEntry.processPickup();
  console.log(`END-PROCESSING ****************`);
}

// Whenever the configuration changes, call setProcessPickupProcessingQueueInterval() again
// For example, this can be triggered whenever the map is updated


let processDeliveryProcessingQueueInterval:any; // Store interval ID so it can be cleared later

export function setProcessDeliveryProcessingQueueInterval() {
  // Fetch interval time dynamically from the global server configuration map
  let processDeliveryProcessingQueueTimeInterval = (GlobalConfiguration.serverConfigurationMap && GlobalConfiguration.serverConfigurationMap.get(appEnumerations.PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL))
    ? GlobalConfiguration.serverConfigurationMap.get(appEnumerations.PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL)
    : 1000; // Default to 1000 if not defined

  console.log(appEnumerations.PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL,processDeliveryProcessingQueueTimeInterval);
  // Clear the previous interval if it exists
  if (processDeliveryProcessingQueueInterval) {
    clearInterval(processDeliveryProcessingQueueInterval);
  }

  // Set the new interval dynamically based on the configuration
  processDeliveryProcessingQueueInterval = setInterval(processDeliveryProcessingQueue, processDeliveryProcessingQueueTimeInterval);
}

// Call to set the initial interval
setProcessDeliveryProcessingQueueInterval();

// Function to process the delivery queue
async function processDeliveryProcessingQueue() {
  const queueEntry = GlobalConfiguration.deliveryProcessingQueue.dequeue();

  if (queueEntry === undefined || queueEntry == null) {
    console.log('Nothing to process from delivery queue.');
    return;
  }

  console.log(`START-DELIVERY ****************`);
  await queueEntry.processDelivery();
  console.log(`END-DELIVERY ****************`);
}

// Whenever the configuration changes, call setProcessDeliveryProcessingQueueInterval() again
// For example, call this function whenever the map is updated



let processConfigurationProcessingQueueInterval:any; // Store interval ID so it can be cleared later

export function setProcessConfigurationProcessingQueueInterval() {
  // Fetch interval time dynamically from global server configuration map
  let processConfigurationProcessingQueueTimeInterval = (GlobalConfiguration.serverConfigurationMap && GlobalConfiguration.serverConfigurationMap.get(appEnumerations.PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL)) 
    ? GlobalConfiguration.serverConfigurationMap.get(appEnumerations.PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL)
    : 1000; // Default to 1000 if not defined

  console.log(appEnumerations.PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL,processConfigurationProcessingQueueTimeInterval);
  // Clear the previous interval if it exists
  if (processConfigurationProcessingQueueInterval) {
    clearInterval(processConfigurationProcessingQueueInterval);
  }

  // Set the new interval dynamically based on the configuration
  processConfigurationProcessingQueueInterval = setInterval(processConfigurationProcessingQueue, processConfigurationProcessingQueueTimeInterval);
}

// Call to set the initial interval
setProcessConfigurationProcessingQueueInterval();

// Function to process the configuration queue
async function processConfigurationProcessingQueue() {
  const queueEntry = GlobalConfiguration.configurationProcessingQueue.dequeue();

  if(queueEntry === undefined || queueEntry == null){
    console.log('Nothing to process from configuration queue.');
    return;
  }

  console.log(`START-CONFIGURATION-PROCESSOR ****************`);
  await queueEntry.configurationProcessing();
  console.log(`END-CONFIGURATION-PROCESSOR ****************`);
}

// Whenever the configuration changes, call setProcessConfigurationProcessingQueueInterval() again
// For example, you can call this whenever the map is updated


let removeOldTransactionsInterval:any; // Store interval ID so it can be cleared later

export function setRemoveOldTransactionsInterval() {
  // Fetch interval time dynamically from global server configuration map
  let removeOldTransactionsTimeInterval = (GlobalConfiguration.serverConfigurationMap && GlobalConfiguration.serverConfigurationMap.get(appEnumerations.REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL))
    ? GlobalConfiguration.serverConfigurationMap.get(appEnumerations.REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL)
    : 30000; // Default to 30 seconds if not defined

  let removeOldTransactionsArchiveDays = (GlobalConfiguration.serverConfigurationMap && GlobalConfiguration.serverConfigurationMap.get(appEnumerations.REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS))
    ? GlobalConfiguration.serverConfigurationMap.get(appEnumerations.REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS)
    : 1; // Default to 1 day if not defined

  
  // If archive days are invalid, reset them
  if (removeOldTransactionsArchiveDays <= 0) {
    removeOldTransactionsArchiveDays = 1;
  }

  // Clear the previous interval if it exists
  if (removeOldTransactionsInterval) {
    clearInterval(removeOldTransactionsInterval);
  }

  console.log(appEnumerations.REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL,removeOldTransactionsTimeInterval);
  console.log(appEnumerations.REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS,removeOldTransactionsArchiveDays);

  // Set the new interval dynamically based on the configuration
  removeOldTransactionsInterval = setInterval(() => {
    removeOldTransactions(removeOldTransactionsArchiveDays); // Pass archive days dynamically
  }, removeOldTransactionsTimeInterval);
}

// Call to set the initial interval
setRemoveOldTransactionsInterval();

// Function to remove old transactions
async function removeOldTransactions(removeOldTransactionsArchiveDays:number) {
  const thresholdDate = new Date(Date.now() - removeOldTransactionsArchiveDays * 24 * 60 * 60 * 1000); // Calculate threshold based on archive days

  console.log(`START-TRANSACTION-PURGE ****************`);
  
  // Iterate over a copy of the Map entries to avoid modification during iteration
  for (const [id, { processingTime }] of Array.from(GlobalConfiguration.transactonsStatisticsMap.entries())) {
    const processingDate = new Date(processingTime); // Convert ISO 8601 string to Date object

    if (processingDate < thresholdDate) {
      GlobalConfiguration.transactonsStatisticsMap.delete(id);
      console.log(`Old transaction removed with ID: ${id}`);
    }
  }

  console.log(`END-TRANSACTION-PURGE ****************`);
}

// Whenever the configuration changes, call setRemoveOldTransactionsInterval() again
// For example, you can call this whenever the map is updated


// Expres server
var server = app.listen(`${SERVER_PORT}`, function () {
   console.debug(`Express App running at http://127.0.0.1:${SERVER_PORT}/`);
});








