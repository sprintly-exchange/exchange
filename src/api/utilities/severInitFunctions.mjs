
import {v4 as uuidv4} from 'uuid';
import { FileStorage } from '../models/FileStorage.mjs';
import { ConfigurationProcessor } from '../configurationProcessor/configurationProcessor.mjs';
import Queue from '../system/Queue.mjs';
import {ConfigurationFileStorage } from '../configurationProcessor/ConfigurationFileStorage.mjs';

import bcrypt from 'bcryptjs';

//Global enums
const appEnumerations = Object.freeze({
  APP_DEFAULT_ORGANIZATION_NAME: 'Default Organization',
  APP_DEFAULT_ROLE_ADMIN: 'Admin',
  APP_DEFAULT_ROLE_ORGANIZATION_USER: 'Organization User',
  APP_DEFAULT_ROLE_ORGANIZATION_ADMIN: 'Organization Admin',
  APP_DEFAULT_ADMIN_NAME: 'Admin',  
  TRANSACTION_STATUS_COMPLETED: 'COMPLETED',
  TRANSACTION_STATUS_FAILED: 'FAILED',
  TRANSACTION_STATUS_INPROCESSING: 'INPROCESSING',
  TRANSACTION_STATUS_PROCESSING_DELIVERY: 'PROCESSING_DELIVERY',
  TRANSACTION_STATUS_PROCESSING_PICKUP: 'PROCESSING_PICKUP',
  TRANSACTION_STATUS_PROCESSING_CONFIGURATIONS: 'PROCESSING_CONFIGURATIONS',
  TRANSACTION_STATUS_SUCCESS: 'SUCCESS',
  PROCESS_RULES_TIME_INTERVAL : 'PROCESS_RULES_TIME_INTERVAL',
  PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL: 'PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL',
  PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL: 'PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL',
  PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL: 'PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL',
  REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL: 'REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL',
  REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS: 'REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS',
  FTP_PICKUP_MAX_FILE_DOWNLOAD_LIST_LIMIT_PER_SESSION: 'FTP_PICKUP_MAX_FILE_DOWNLOAD_LIST_LIMIT_PER_SESSION',
});


const defaultRoleAdmin = {
  id: `${uuidv4()}`,
  role : appEnumerations.APP_DEFAULT_ROLE_ADMIN,
};

const defaultRoleOrganizationUser = {
  id: `${uuidv4()}`,
  role : appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_USER,
};

const defaultRoleOrganizationAdmin = {
  id: `${uuidv4()}`,
  role : appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN
};

//add default organizaton
const defaultOrg = {
    id : `${uuidv4()}`,
    name : appEnumerations.APP_DEFAULT_ORGANIZATION_NAME,
    address: 'Default Address',
    email: 'mycompany@no-reply.com',
    phone:'+99 999999999', 
    isDefaultUiDisplayFalse : true,
    isDefault:true,
    registrationDate: new Date().toISOString(),
};

const defaultUser = {
    id: `${uuidv4()}`,
    username : appEnumerations.APP_DEFAULT_ADMIN_NAME,
    password :  `${await bcrypt.hash('changeme', 10)}`,
    organizationId: `${defaultOrg.id}`,
    roleId : `${defaultRoleAdmin.id}`,
    registrationDate: new Date().toISOString(),
};


 const ensureDefaultOrganization = async () => {
    // Check if the default organization exists
    let organizationExists = false;
    organizationExists = Array.from(organizationsMap.values()).some(org => org.name === appEnumerations.APP_DEFAULT_ORGANIZATION_NAME);
    if(organizationExists){
      console.log('Default organitaion exists')
    }else{
        console.log('Adding default organization')
        organizationsMap.set(defaultOrg.id, defaultOrg) ;
    }
      
    //console.log('Default user ', defaultUser);
    // Check if the default user exists
    let userExists = false;
    userExists = Array.from(organizationsUsersMap.values()).some(user =>  user.username === appEnumerations.APP_DEFAULT_ADMIN_NAME);
    if(userExists){
      console.log('Default admin user exists') 
    }else{
      console.log('Adding default admin user.')
      organizationsUsersMap.set(defaultUser.id,defaultUser);
    }
    return true;
  };
  
   const ensureDefaultRoles = async () => {
    try{
        // Check if the default organization admin exists

          // Check if the default admin user role exists
          if (organizationsRolesMapNew instanceof Map) {
            const userExists = Array.from(organizationsRolesMapNew.values()).some(org => org.role === appEnumerations.APP_DEFAULT_ROLE_ADMIN);
            //console.log('Array.from(organizationsRolesMapNew.values()).some(org => org.role - user :',userExists);
            if(!userExists){
              console.log('Adding application admin user role.')
              organizationsRolesMapNew.set(defaultRoleAdmin.id,defaultRoleAdmin);
            }else{
              console.log('Default application admin user role exists.')
            }
          } 
        
        if (organizationsRolesMapNew instanceof Map) {
          const userExists = Array.from(organizationsRolesMapNew.values()).some(org => org.role === appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN);
          //console.log('Array.from(organizationsRolesMapNew.values()).some(org => org.role - user :',userExists);
          if(!userExists){
            console.log('Adding organization admin role.')
            organizationsRolesMapNew.set(defaultRoleOrganizationAdmin.id,defaultRoleOrganizationAdmin);
          }else{
            console.log('Default organization admin role exists.')
          }
        } 

        // Check if the default organization user role exists
        if (organizationsRolesMapNew instanceof Map) {
          const userExists = Array.from(organizationsRolesMapNew.values()).some(org => org.role === appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_USER);
          //console.log('Array.from(organizationsRolesMapNew.values()).some(org => org.role - user :',userExists);
          if(!userExists){
            console.log('Adding organization user role.')
            organizationsRolesMapNew.set(defaultRoleOrganizationUser.id,defaultRoleOrganizationUser);
          }else{
            console.log('Default organization user role exists.')
          }
        } 
        
      }catch(error) {
        console.log(error);
      } 
  };

  export const ensureSystemSettings = async () => {
    // Set or update the configuration values based on whether the key exists
    if (!global.serverConfigurationMap.has(appEnumerations.PROCESS_RULES_TIME_INTERVAL)) {
      global.serverConfigurationMap.set(appEnumerations.PROCESS_RULES_TIME_INTERVAL, 1000);
    } 

    if (!global.serverConfigurationMap.has(appEnumerations.PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL)) {
        global.serverConfigurationMap.set(appEnumerations.PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL, 1000);
    }

    if (!global.serverConfigurationMap.has(appEnumerations.PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL)) {
        global.serverConfigurationMap.set(appEnumerations.PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL, 1000);
    }

    if (!global.serverConfigurationMap.has(appEnumerations.PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL)) {
        global.serverConfigurationMap.set(appEnumerations.PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL, 1000);
    }

    if (!global.serverConfigurationMap.has(appEnumerations.REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL)) {
        global.serverConfigurationMap.set(appEnumerations.REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL, 30000);
    }

    if (!global.serverConfigurationMap.has(appEnumerations.REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS)) {
        global.serverConfigurationMap.set(appEnumerations.REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS, 1);
    }

    if (!global.serverConfigurationMap.has(appEnumerations.FTP_PICKUP_MAX_FILE_DOWNLOAD_LIST_LIMIT_PER_SESSION)) {
      global.serverConfigurationMap.set(appEnumerations.FTP_PICKUP_MAX_FILE_DOWNLOAD_LIST_LIMIT_PER_SESSION, 10);
  }
  };
  

export const initFunction = async () => {
        //Object  stores for runtime configurations
        global.configurationPickupMap = new Map(); // map to store the confirguartion items such as pickup  objects
        global.configurationDeliveryMap = new Map(); // map to store the confirguartion items objects
        global.configurationProcessingMap = new Map(); // map to store the processing items objects
        global.configurationFlowMap = new Map(); // map to store the flow configruations objects
        global.transactonsStatisticsMap = new Map(); // Map to store runtime trasactions objects
        global.forntEndConfigurationMap = new Map(); // Map to store runtime trasactions objects
        global.demoModeEnabledMap=new Map();
        global.configruationProcessor = new ConfigurationProcessor();
        // Map to store runtime transaction objects
        global.organizationsMap = new Map();
        // Map to store application users
        global.organizationsUsersMap = new Map();
        // Map to store application users
        global.organizationsRolesMapNew = new Map();
        //Global queues for message processing and handling
        global.pickupProcessingQueue = new Queue();
        global.configurationProcessingQueue = new Queue();
        global.deliveryProcessingQueue = new Queue();

        //fix used to stop user creation duplicate issue for google uses
        global.googleUserCreationStatus={};

        //system settings
        global.serverConfigurationMap= new Map();


     //Configruation save funtionality
        global.storageConfiguration = new ConfigurationFileStorage('FS',process.env.CONFIG_STORAGE_DIR,);
        console.log('global.storageConfiguration',global.storageConfiguration);
        global.storage = new FileStorage('FS');
        global.storage._storageLocation= process.env.FILE_STORAGE_DIR;


        await configruationProcessor.loadConfigurations();
        await ensureDefaultOrganization();
        await ensureDefaultRoles();
        await ensureSystemSettings();

        //Setting config saving interval
        const saveInterval = 10000; // 10 seconds
        setInterval(() => {
          global.configruationProcessor.saveConfigurations();
          console.log('Configurations saved at', new Date());
        }, saveInterval);
};

export default appEnumerations;