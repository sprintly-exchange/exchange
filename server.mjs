
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
import appEnumerations, { initFunction} from './src/api/utilities/severInitFunctions.mjs';
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


let processRulesInterval; // Store interval ID to clear it later

export function setProcessRulesInterval() {
  // Fetch interval time dynamically from the global server configuration map
  let processRulesTimeInterval = (global.serverConfigurationMap && global.serverConfigurationMap.get(appEnumerations.PROCESS_RULES_TIME_INTERVAL)) 
    ? global.serverConfigurationMap.get(appEnumerations.PROCESS_RULES_TIME_INTERVAL) 
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
  const configurationPickupMapSet = [...new Set(configurationPickupMap.values())];
  const configurationDeliveryMapSet = [...new Set(configurationDeliveryMap.values())];
  const configurationProcessingMapSet = [...new Set(configurationProcessingMap.values())];

  console.info(`Processing rules started ${date.toLocaleTimeString()}`);

  configurationFlowMap.forEach((configurationFlowMapItem) => {
    if (configurationFlowMapItem.activationStatus) {
      console.debug('Processing flow : ', configurationFlowMapItem.flowName);

      const configPickup = configurationPickupMapSet.find((object) => object.id === configurationFlowMapItem.pickupId);
      const configDelivery = configurationDeliveryMapSet.find((object) => object.id === configurationFlowMapItem.deliveryId);
      const configProcessing = configurationProcessingMapSet.find((object) => object.id === configurationFlowMapItem.processingId);

      const transactionProcessManager = new TransactionProcessManager(configPickup, configDelivery, configProcessing, configurationFlowMapItem);
      
      // Determine retryInterval from configPickup or set a default of 60 seconds
      const retryInterval = configPickup.retryInterval != null
        ? configPickup.retryInterval * 1000
        : 60 * 1000;

      //console.debug('retryInterval - ', retryInterval);

      // Retrieve any existing timeout info
      const existingTimeout = timeoutMap.get(configurationFlowMapItem.flowName);

      // Check if a timeout needs to be set or updated
      if (!existingTimeout || existingTimeout.interval !== retryInterval) {
        // Clear previous timeout if it's set and interval has changed
        if (existingTimeout) {
          clearTimeout(existingTimeout.id);
          console.debug(`Cleared existing timeout for ${configurationFlowMapItem.flowName} due to interval change.`);
        }

        // Set a new timeout for this configurationFlowMapItem
        const timeoutId = setTimeout(() => {
          pickupProcessingQueue.enqueue(transactionProcessManager);
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


let processPickupProcessingQueueInterval; // Store interval ID to clear it later

export function setProcessPickupProcessingQueueInterval() {

  // Fetch interval time dynamically from the global server configuration map
  let processPickupProcessingQueueTimeInterval = (global.serverConfigurationMap && global.serverConfigurationMap.get(appEnumerations.PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL)) 
    ? global.serverConfigurationMap.get(appEnumerations.PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL)
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
  const queueEntry = pickupProcessingQueue.dequeue();

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


let processDeliveryProcessingQueueInterval; // Store interval ID so it can be cleared later

export function setProcessDeliveryProcessingQueueInterval() {
  // Fetch interval time dynamically from the global server configuration map
  let processDeliveryProcessingQueueTimeInterval = (global.serverConfigurationMap && global.serverConfigurationMap.get(appEnumerations.PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL))
    ? global.serverConfigurationMap.get(appEnumerations.PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL)
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
  const queueEntry = deliveryProcessingQueue.dequeue();

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



let processConfigurationProcessingQueueInterval; // Store interval ID so it can be cleared later

export function setProcessConfigurationProcessingQueueInterval() {
  // Fetch interval time dynamically from global server configuration map
  let processConfigurationProcessingQueueTimeInterval = (global.serverConfigurationMap && global.serverConfigurationMap.get(appEnumerations.PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL)) 
    ? global.serverConfigurationMap.get(appEnumerations.PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL)
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
  const queueEntry = configurationProcessingQueue.dequeue();

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


let removeOldTransactionsInterval; // Store interval ID so it can be cleared later

export function setRemoveOldTransactionsInterval() {
  // Fetch interval time dynamically from global server configuration map
  let removeOldTransactionsTimeInterval = (global.serverConfigurationMap && global.serverConfigurationMap.get(appEnumerations.REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL))
    ? global.serverConfigurationMap.get(appEnumerations.REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL)
    : 30000; // Default to 30 seconds if not defined

  let removeOldTransactionsArchiveDays = (global.serverConfigurationMap && global.serverConfigurationMap.get(appEnumerations.REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS))
    ? global.serverConfigurationMap.get(appEnumerations.REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS)
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
async function removeOldTransactions(removeOldTransactionsArchiveDays) {
  const thresholdDate = new Date(Date.now() - removeOldTransactionsArchiveDays * 24 * 60 * 60 * 1000); // Calculate threshold based on archive days

  console.log(`START-TRANSACTION-PURGE ****************`);
  
  // Iterate over a copy of the Map entries to avoid modification during iteration
  for (const [id, { processingTime }] of Array.from(transactonsStatisticsMap.entries())) {
    const processingDate = new Date(processingTime); // Convert ISO 8601 string to Date object

    if (processingDate < thresholdDate) {
      transactonsStatisticsMap.delete(id);
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








