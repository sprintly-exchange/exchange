
import {v4 as uuidv4} from 'uuid';
import { FileStorage } from '../models/FileStorage.mjs';
import Queue from '../system/Queue.mjs';
import {ConfigurationFileStorage } from '../configurationProcessor/ConfigurationFileStorage.mjs';
import GlobalConfiguration from '../../GlobalConfiguration';

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
    organizationExists = Array.from(GlobalConfiguration.organizationsMap.values()).some(org => org.name === appEnumerations.APP_DEFAULT_ORGANIZATION_NAME);
    if(organizationExists){
      console.log('Default organitaion exists')
    }else{
        console.log('Adding default organization')
        GlobalConfiguration.organizationsMap.set(defaultOrg.id, defaultOrg) ;
    }
      
    //console.log('Default user ', defaultUser);
    // Check if the default user exists
    let userExists = false;
    userExists = Array.from(GlobalConfiguration.organizationsUsersMap.values()).some(user =>  user.username === appEnumerations.APP_DEFAULT_ADMIN_NAME);
    if(userExists){
      console.log('Default admin user exists') 
    }else{
      console.log('Adding default admin user.')
      GlobalConfiguration.organizationsUsersMap.set(defaultUser.id,defaultUser);
    }
    return true;
  };
  
   const ensureDefaultRoles = async () => {
    try{
        // Check if the default organization admin exists

          // Check if the default admin user role exists
          if (GlobalConfiguration.organizationsRolesMapNew instanceof Map) {
            const userExists = Array.from(GlobalConfiguration.organizationsRolesMapNew.values()).some(org => org.role === appEnumerations.APP_DEFAULT_ROLE_ADMIN);
            //console.log('Array.from(organizationsRolesMapNew.values()).some(org => org.role - user :',userExists);
            if(!userExists){
              console.log('Adding application admin user role.')
              GlobalConfiguration.organizationsRolesMapNew.set(defaultRoleAdmin.id,defaultRoleAdmin);
            }else{
              console.log('Default application admin user role exists.')
            }
          } 
        
        if (GlobalConfiguration.organizationsRolesMapNew instanceof Map) {
          const userExists = Array.from(GlobalConfiguration.organizationsRolesMapNew.values()).some(org => org.role === appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN);
          //console.log('Array.from(organizationsRolesMapNew.values()).some(org => org.role - user :',userExists);
          if(!userExists){
            console.log('Adding organization admin role.')
            GlobalConfiguration.organizationsRolesMapNew.set(defaultRoleOrganizationAdmin.id,defaultRoleOrganizationAdmin);
          }else{
            console.log('Default organization admin role exists.')
          }
        } 

        // Check if the default organization user role exists
        if (GlobalConfiguration.organizationsRolesMapNew instanceof Map) {
          const userExists = Array.from(GlobalConfiguration.organizationsRolesMapNew.values()).some(org => org.role === appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_USER);
          //console.log('Array.from(organizationsRolesMapNew.values()).some(org => org.role - user :',userExists);
          if(!userExists){
            console.log('Adding organization user role.')
            GlobalConfiguration.organizationsRolesMapNew.set(defaultRoleOrganizationUser.id,defaultRoleOrganizationUser);
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
    if (!GlobalConfiguration.serverConfigurationMap.has(appEnumerations.PROCESS_RULES_TIME_INTERVAL)) {
      GlobalConfiguration.serverConfigurationMap.set(appEnumerations.PROCESS_RULES_TIME_INTERVAL, 1000);
    } 

    if (!GlobalConfiguration.serverConfigurationMap.has(appEnumerations.PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL)) {
      GlobalConfiguration.serverConfigurationMap.set(appEnumerations.PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL, 1000);
    }

    if (!GlobalConfiguration.serverConfigurationMap.has(appEnumerations.PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL)) {
      GlobalConfiguration.serverConfigurationMap.set(appEnumerations.PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL, 1000);
    }

    if (!GlobalConfiguration.serverConfigurationMap.has(appEnumerations.PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL)) {
      GlobalConfiguration.serverConfigurationMap.set(appEnumerations.PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL, 1000);
    }

    if (!GlobalConfiguration.serverConfigurationMap.has(appEnumerations.REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL)) {
      GlobalConfiguration.serverConfigurationMap.set(appEnumerations.REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL, 30000);
    }

    if (!GlobalConfiguration.serverConfigurationMap.has(appEnumerations.REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS)) {
      GlobalConfiguration.serverConfigurationMap.set(appEnumerations.REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS, 1);
    }

    if (!GlobalConfiguration.serverConfigurationMap.has(appEnumerations.FTP_PICKUP_MAX_FILE_DOWNLOAD_LIST_LIMIT_PER_SESSION)) {
      GlobalConfiguration.serverConfigurationMap.set(appEnumerations.FTP_PICKUP_MAX_FILE_DOWNLOAD_LIST_LIMIT_PER_SESSION, 10);
  }
  };
  

export const initFunction = async () => {
     //Configruation save funtionality
        console.log('global.storageConfiguration',GlobalConfiguration.storageConfiguration);
        
        GlobalConfiguration.storage._storageLocation= process.env.FILE_STORAGE_DIR;


        await GlobalConfiguration.configruationProcessor.loadConfigurations();
        await ensureDefaultOrganization();
        await ensureDefaultRoles();
        await ensureSystemSettings();

        //Setting config saving interval
        const saveInterval = 10000; // 10 seconds
        setInterval(() => {
          GlobalConfiguration.configruationProcessor.saveConfigurations();
          console.log('Configurations saved at', new Date());
        }, saveInterval);
};

export default appEnumerations;