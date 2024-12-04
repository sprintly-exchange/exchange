
import {v4 as uuidv4} from 'uuid';
import { FileStorage } from '../models/FileStorage.mjs';
import Queue from '../system/Queue.mjs';
import {ConfigurationFileStorage } from '../configurationProcessor/ConfigurationFileStorage.mjs';
import GlobalConfiguration from '../../GlobalConfiguration.mjs';

import bcrypt from 'bcryptjs';
import { getOrganizationByName, getUserByName } from './serverCommon.mjs';

//Global enums


const defaultRoleAdmin = {
  id: `${uuidv4()}`,
  role : GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ADMIN,
};

const defaultRoleOrganizationUser = {
  id: `${uuidv4()}`,
  role : GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_USER,
};

const defaultRoleOrganizationAdmin = {
  id: `${uuidv4()}`,
  role : GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN
};


let defaultOrg = {

  id : '',
  name :'',
  address: '',
  email: '',
  phone:'', 
  isDefaultUiDisplayFalse : true,
  isDefault:true,
  registrationDate:'',
};

let defaultUser = {
  id:'',
  username:'',
  password:'',
  organizationId:'',
  roleId:'',
  registrationDate:''

};

async function generatePassword() {
  const password = await bcrypt.hash('changeme', 10);
  return password;
}


 const ensureDefaultOrganizationAndUser = async () => {
    // Check if the default organization exists
    let organizationExists = false;
    organizationExists = Array.from(GlobalConfiguration.organizationsMap.values()).some(org => org.name === GlobalConfiguration.appEnumerations.APP_DEFAULT_ORGANIZATION_NAME);
    if(organizationExists){
      console.log('Default organitaion exists');
      defaultOrg = getOrganizationByName(GlobalConfiguration.appEnumerations.APP_DEFAULT_ORGANIZATION_NAME);
    }else{
        console.log('Adding default organization');
        defaultOrg = {
          id : `${uuidv4()}`,
          name : GlobalConfiguration.appEnumerations.APP_DEFAULT_ORGANIZATION_NAME,
          address: 'Default Address',
          email: 'mycompany@no-reply.com',
          phone:'+99 999999999', 
          isDefaultUiDisplayFalse : true,
          isDefault:true,
          registrationDate: new Date().toISOString(),
      };
        GlobalConfiguration.organizationsMap.set(defaultOrg.id, defaultOrg) ;
    }
      
    // Check if the default user exists
    let userExists = false;
    userExists = Array.from(GlobalConfiguration.organizationsUsersMap.values()).some(user =>  user.username === GlobalConfiguration.appEnumerations.APP_DEFAULT_ADMIN_NAME);

    if(userExists){
      console.log('Default admin user exists');
      defaultUser = getUserByName(GlobalConfiguration.appEnumerations.APP_DEFAULT_ADMIN_NAME);
    }else{
      console.log('Adding default admin user.');
      defaultUser = {
          id: `${uuidv4()}`,
          username : GlobalConfiguration.appEnumerations.APP_DEFAULT_ADMIN_NAME,
          password :  `${await generatePassword()}`,
          organizationId: `${defaultOrg.id}`,
          roleId : `${defaultRoleAdmin.id}`,
          registrationDate: new Date().toISOString(),
      };
      GlobalConfiguration.organizationsUsersMap.set(defaultUser.id,defaultUser);
    }
    return true;
  };
  
   const ensureDefaultRoles = async () => {
    try{
        // Check if the default organization admin exists

          // Check if the default admin user role exists
          if (GlobalConfiguration.organizationsRolesMapNew instanceof Map) {
            const userExists = Array.from(GlobalConfiguration.organizationsRolesMapNew.values()).some(org => org.role === GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ADMIN);
            //console.log('Array.from(organizationsRolesMapNew.values()).some(org => org.role - user :',userExists);
            if(!userExists){
              console.log('Adding application admin user role.')
              GlobalConfiguration.organizationsRolesMapNew.set(defaultRoleAdmin.id,defaultRoleAdmin);
            }else{
              console.log('Default application admin user role exists.')
            }
          } 
        
        if (GlobalConfiguration.organizationsRolesMapNew instanceof Map) {
          const userExists = Array.from(GlobalConfiguration.organizationsRolesMapNew.values()).some(org => org.role === GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN);
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
          const userExists = Array.from(GlobalConfiguration.organizationsRolesMapNew.values()).some(org => org.role === GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_USER);
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

    if (!GlobalConfiguration.serverConfigurationMap.has(GlobalConfiguration.appEnumerations.CACHE_API_GLOBAL_EXPIERY_MILLISECONDS)) {
      GlobalConfiguration.serverConfigurationMap.set(GlobalConfiguration.appEnumerations.CACHE_API_GLOBAL_EXPIERY_MILLISECONDS, 100);
    }
    if (!GlobalConfiguration.serverConfigurationMap.has(GlobalConfiguration.appEnumerations.PROCESS_RULES_TIME_INTERVAL)) {
      GlobalConfiguration.serverConfigurationMap.set(GlobalConfiguration.appEnumerations.PROCESS_RULES_TIME_INTERVAL, 1000);
    } 

    if (!GlobalConfiguration.serverConfigurationMap.has(GlobalConfiguration.appEnumerations.PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL)) {
      GlobalConfiguration.serverConfigurationMap.set(GlobalConfiguration.appEnumerations.PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL, 1000);
    }

    if (!GlobalConfiguration.serverConfigurationMap.has(GlobalConfiguration.appEnumerations.PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL)) {
      GlobalConfiguration.serverConfigurationMap.set(GlobalConfiguration.appEnumerations.PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL, 1000);
    }

    if (!GlobalConfiguration.serverConfigurationMap.has(GlobalConfiguration.appEnumerations.PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL)) {
      GlobalConfiguration.serverConfigurationMap.set(GlobalConfiguration.appEnumerations.PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL, 1000);
    }

    if (!GlobalConfiguration.serverConfigurationMap.has(GlobalConfiguration.appEnumerations.REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL)) {
      GlobalConfiguration.serverConfigurationMap.set(GlobalConfiguration.appEnumerations.REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL, 30000);
    }

    if (!GlobalConfiguration.serverConfigurationMap.has(GlobalConfiguration.appEnumerations.REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS)) {
      GlobalConfiguration.serverConfigurationMap.set (GlobalConfiguration.appEnumerations.REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS, 1);
    }

    if (!GlobalConfiguration.serverConfigurationMap.has (GlobalConfiguration.appEnumerations.FTP_PICKUP_MAX_FILE_DOWNLOAD_LIST_LIMIT_PER_SESSION)) {
      GlobalConfiguration.serverConfigurationMap.set(GlobalConfiguration.appEnumerations.FTP_PICKUP_MAX_FILE_DOWNLOAD_LIST_LIMIT_PER_SESSION, 10);
  }
  };
  

export const initFunction = async () => {
     //Configruation save funtionality
       
        console.log('global.storageConfiguration',GlobalConfiguration.storageConfiguration);
        
        GlobalConfiguration.storage._storageLocation= process.env.FILE_STORAGE_DIR;


        await GlobalConfiguration.configurationProcessor.loadConfigurations();
        await ensureDefaultOrganizationAndUser
        await ensureDefaultRoles();
        await ensureSystemSettings();

        //Setting config saving interval
        const saveInterval = 10000; // 10 seconds
        setInterval(() => {
          GlobalConfiguration.configurationProcessor.saveConfigurations();
          console.log('Configurations saved at', new Date());
        }, saveInterval);
};

