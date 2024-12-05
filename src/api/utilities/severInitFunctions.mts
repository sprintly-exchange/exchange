
import {v4 as uuidv4} from 'uuid';
import GlobalConfiguration from '../../GlobalConfiguration.mjs';

import bcrypt from 'bcryptjs';
import { getOrganizationByName, getUserByName } from './serverCommon.mjs';
import { Organization } from '../models/Organization.mjs';
import { User } from '../models/User.mjs';
import { OrganizationRole } from '../models/OrganizationRole.mjs';
import { CommonFunctions } from '../models/CommonFunctions.mjs';

let defaultRoleAdmin:OrganizationRole|undefined;
let defaultRoleOrganizationAdmin:OrganizationRole|undefined;
let defaultRoleOrganizationUser:OrganizationRole|undefined;

let defaultOrg:Organization|undefined=undefined ;
let defaultUser:User|undefined=undefined ;


async function generatePassword() {
  const password = await bcrypt.hash('changeme', 10);
  return password;
}


 const ensureDefaultOrganizationAndUser = async () => {
    // Check if the default organization exists
    let organizationExists = false;
    organizationExists = Array.from(GlobalConfiguration.organizationsMap.values()).some(org => org.name === GlobalConfiguration.appEnumerations.APP_DEFAULT_ORGANIZATION_NAME);
    if(organizationExists){
      CommonFunctions.logWithTimestamp('Default organitaion exists');
      defaultOrg = getOrganizationByName(GlobalConfiguration.appEnumerations.APP_DEFAULT_ORGANIZATION_NAME);
    }else{
        CommonFunctions.logWithTimestamp('Adding default organization');
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
      CommonFunctions.logWithTimestamp('Default admin user exists');
      defaultUser = getUserByName(GlobalConfiguration.appEnumerations.APP_DEFAULT_ADMIN_NAME);
    }else{
      CommonFunctions.logWithTimestamp('Adding default admin user.');
      defaultUser = {
          id: `${uuidv4()}`,
          username : GlobalConfiguration.appEnumerations.APP_DEFAULT_ADMIN_NAME,
          password :  `${await generatePassword()}`,
          organizationId: `${defaultOrg?defaultOrg.id:undefined}`,
          roleId : `${defaultRoleAdmin?defaultRoleAdmin.id:undefined}`,
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
          if (GlobalConfiguration.organizationsRolesMap instanceof Map) {
            const roleExists = Array.from(GlobalConfiguration.organizationsRolesMap.values()).some(org => org.role === GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ADMIN);
            if(!roleExists){
              CommonFunctions.logWithTimestamp('Adding application admin user role.')
              defaultRoleAdmin = {
                id: `${uuidv4()}`,
                role : GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ADMIN,
              }
              GlobalConfiguration.organizationsRolesMap.set(defaultRoleAdmin.id,defaultRoleAdmin);
            }else{
              CommonFunctions.logWithTimestamp('Default application admin user role exists.')
            }
          } 
        
        if (GlobalConfiguration.organizationsRolesMap instanceof Map) {
          const roleExists = Array.from(GlobalConfiguration.organizationsRolesMap.values()).some(org => org.role === GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN);
          if(!roleExists){
            CommonFunctions.logWithTimestamp('Adding organization admin role.')
            defaultRoleOrganizationAdmin = {
              id: `${uuidv4()}`,
              role : GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN
            };
            GlobalConfiguration.organizationsRolesMap.set(defaultRoleOrganizationAdmin.id,defaultRoleOrganizationAdmin);
          }else{
            CommonFunctions.logWithTimestamp('Default organization admin role exists.')
          }
        } 

        // Check if the default organization user role exists
        if (GlobalConfiguration.organizationsRolesMap instanceof Map) {
          const roleExists = Array.from(GlobalConfiguration.organizationsRolesMap.values()).some(org => org.role === GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_USER);
          if(!roleExists){
            CommonFunctions.logWithTimestamp('Adding organization user role.')
            defaultRoleOrganizationUser = {
              id: `${uuidv4()}`,
              role : GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_USER,
            };
            GlobalConfiguration.organizationsRolesMap.set(defaultRoleOrganizationUser.id,defaultRoleOrganizationUser);
          }else{
            CommonFunctions.logWithTimestamp('Default organization user role exists.')
          }
        } 
        
      }catch(error) {
        CommonFunctions.logWithTimestamp(error);
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
       
        CommonFunctions.logWithTimestamp('global.storageConfiguration',GlobalConfiguration.storageConfiguration);
        
        GlobalConfiguration.storage._storageLocation= process.env.FILE_STORAGE_DIR;


        await GlobalConfiguration.configurationProcessor.loadConfigurations();
        await ensureDefaultRoles();
        await ensureSystemSettings();
        await ensureDefaultOrganizationAndUser();

        //Setting config saving interval
        const saveInterval = 10000; // 10 seconds
        setInterval(() => {
          GlobalConfiguration.configurationProcessor.saveConfigurations();
          CommonFunctions.logWithTimestamp('Configurations saved at', new Date());
        }, saveInterval);
};

