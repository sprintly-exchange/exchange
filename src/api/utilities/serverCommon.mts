import { userInfo } from "os";
import { getAuthDetails } from "./getOrganization&User.mjs";
import GlobalConfiguration from "../../GlobalConfiguration.mjs";
import { Organization } from "../models/Organization.mjs";
import { User } from "../models/User.mjs";

export function setCommonHeaders(res:any){
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export function mapEntrySearchByValue(map:any, searchKey:any, searchValue:any) {
    // Iterate through the map entries
    for (let [key, value] of map.entries()) {
      // Check if the value is an object and has a property that matches searchKey and searchValue
      if (value && value[searchKey] === searchValue) {
        return true;
      }
    }
    
    // Return false if no matching entry is found
    return false;
  }
  
//get role id when given a role
export function getRoleId(role:string){
    let roleId = undefined;

    for (let [key, value] of GlobalConfiguration.organizationsRolesMap.entries()) {
        if (value.role === role) {
            roleId = value.id;
            break;
        }
    }
    return roleId;
};


//get role name given the role Id
export function getRoleById(roleId:string){
    let role = undefined;
    //console.log('roleId',roleId);
    for (let [key, value] of GlobalConfiguration.organizationsRolesMap.entries()) {
        //console.log('value',value);
        if (value.id === roleId) {
            role = value.role;
            //console.log('role',role);
            break;
        }
    }
    return role;
};

export function userExists(nameIn:string){
    let userFound=false;
    for (let user of GlobalConfiguration.organizationsUsersMap.values()) {
        if (user.username === nameIn) {
            userFound=true;
        }
    }
    return userFound;
};


export function getUserId(nameIn:string){
    let userId=null;
    for (let user of GlobalConfiguration.organizationsUsersMap.values()) {
        if (user.username === nameIn) {
            userId = user.id;
        }
    }
    return userId;
};

export function getUserByName(nameIn:string):User|undefined{
    let retUser:User|undefined = undefined;
    for (let user of GlobalConfiguration.organizationsUsersMap.values()) {
        if (user.username === nameIn) {
            retUser = GlobalConfiguration.organizationsUsersMap.get(user.id);
        }
    }
    return retUser;
};

export function getOrganizationByName(nameIn:string):Organization|undefined{
    let retOrg:Organization|undefined=undefined;
    for (let org of GlobalConfiguration.organizationsMap.values()) {
        if (org.name === nameIn) {
            retOrg = GlobalConfiguration.organizationsMap.get(org.id);
        }
    }
    return retOrg;
};

export function getUserById(userId:any){
    return GlobalConfiguration.organizationsUsersMap.get(userId);
};

export function organizationExists(organizationIn:any){
    let orgFound = false;
    for (let organization of GlobalConfiguration.organizationsMap.values()) {
        if (organization.name === organizationIn) {
            orgFound = true;
        }
    }
    return orgFound;
};

export function getOrgId(orgIn:string){
    let orgId=null;
    for (let org of GlobalConfiguration.organizationsMap.values()) {
        if (org.name === orgIn) {
            orgId = org.id;
        }
    }
    return orgId;
};

export async function userHasDeleteRights(req:any, map:any, id:string) {

    const authDetails = await getAuthDetails(req.headers['authorization']);

    if (authDetails && 'userId' in  authDetails && 'organizationId' in authDetails) {
        const { userId, organizationId } = authDetails;

    if (typeof userId === 'string') {
            const memberOfOrganizationIds = GlobalConfiguration.organizationsUsersMap.get(userId)?.memberOfOrganizationIds || [];
            // Proceed with memberOfOrganizationIds
            // Retrieve the item from the map by id
        const item = map.get(id);

        // Ensure item exists before checking delete rights
        if (!item) {
            console.log(" DELETE ****************  LOG : item does not exists.");
            return false; // Return false if no such item exists
        }

        // First condition: The user is the owner or an admin
        if (item.userId === userId || getUserById(userId).roleId === getRoleId( GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ADMIN)) {
            console.log(" DELETE ****************  LOG : First condition: The user is the owner or an admin. Deleting record");
            map.delete(id);
            return true;
        // Second condition: The user belongs to the organization and is an organization admin
        } else if (item.organizationId === organizationId 
            && memberOfOrganizationIds.includes(organizationId) 
            && getRoleById(getUserById(userId)) === getRoleId( GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN)) {
            console.log(" DELETE ****************  LOG : Second condition: The user belongs to the organization and is an organization admin. Deleting record");
            map.delete(id);
            return true;
        } else {
            console.log(" DELETE ****************  LOG : User does not have delete rights. Deleting record");
            return false; // User does not have delete rights
        }
        } else {
            throw new Error('Authorization details are missing');
        }
    } else {
            throw new Error('Invalid userId: must be a string');
    }
};


export const filterResultsBasedOnUserRole = async (map:any,req:any) => {
    
    let events =[];

    try {
        const authDetails = await getAuthDetails(req.headers['authorization']);

        if (authDetails && 'userId' in  authDetails && 'organizationId' in authDetails) {
            const { userId, organizationId } = authDetails;
            const memberOforganizationIds = GlobalConfiguration.organizationsUsersMap.get(userId).memberOforganizationIds;

        console.log('organizationId',organizationId);
        console.log('event recevied for filtering',map.size);
        console.log("getUserById(userId).roleId)",getUserById(userId).roleId);
        console.log("getRoleById(getUserById(userId).roleId)",getRoleById(getUserById(userId).roleId));

            switch (getRoleById(getUserById(userId).roleId)) 
            {
                case  GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ADMIN : {
                    events = [...map.values()];
                    console.log('events admin',events.length);
                    break;
                }
                case  GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN  : {
                    events = [...map.values()].filter((item) => item.organizationId === organizationId || memberOforganizationIds.includes(item.organizationId));
                    console.log('events org admin' ,events.length);
                    break;
                }
                case  GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_USER : {
                    events = [...map.values()].filter((item) => item.organizationId === organizationId || memberOforganizationIds.includes(item.organizationId));
                    console.log('events org user' ,events.length);
                    break;
                }
                default:     
                    break;
            }
        }
        
    }catch(error){
        console.log('Error handling the user');
    }

    return events;
}


export const filterResultsBasedOnUserRoleAndUserId = async (map:any,req:any) => {
    let events =[];
    try {
        const authDetails = await getAuthDetails(req.headers['authorization']);

        if (authDetails && 'userId' in  authDetails && 'organizationId' in authDetails) {
            const { userId, organizationId } = authDetails;
            const memberOforganizationIds = GlobalConfiguration.organizationsUsersMap.get(userId).memberOforganizationIds;

        console.log('organizationId : ',organizationId);
        console.log('Events recevied for filtering : ',map.size);
        console.log("User Id :",getUserById(userId).roleId);
        console.log("role Id : ",getRoleById(getUserById(userId).roleId));
    
            switch (getRoleById(getUserById(userId).roleId)) 
            {
                case  GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ADMIN : {
                    events = [...map.values()];
                    console.log('events admin',events.length);
                    break;
                }
                case  GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN  : {
                    events = [...map.values()].filter((item) => (item.organizationId === organizationId || item.userId === userId ||  memberOforganizationIds.includes(item.organizationId)));
                    //events = [...events,[...map.values()].filter((item) => item.userId === userId)]
                    console.log('events org admin/user' ,events.length);
                    break;
                }
                case  GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_USER : {
                    events = [...map.values()].filter((item) => (item.organizationId === organizationId || item.userId === userId || memberOforganizationIds.includes(item.organizationId)));
                    //events = [...events,[...map.values()].filter((item) => item.userId === userId)]
                    console.log('events org admin/user' ,events.length);
                    break;
                }
                default:     
                    break;
            }
        }
        
    }catch(error){
        console.log('Error handling the user');
    }

    return events;
}

export const filterResultsBasedOnUser = async (map:any,req:any) => {
    const authDetails = await getAuthDetails(req.headers['authorization']);
    let events =[];
        if (authDetails && 'userId' in  authDetails && 'organizationId' in authDetails) {
            const { userId, organizationId } = authDetails;
            
            try {
                events = [...map.values()].filter((item) => item.userId === userId);
            }catch(error){
                console.log('Error handling the user');
            }
        }
    

    return events;
}

//this is to retrn item in a map, stored by usierId, example user configuragion stored by userId
export const getItemByUserId = async (map:any,req:any) => {
    const authDetails = await getAuthDetails(req.headers['authorization']);
    let events =[];
        if (authDetails && 'userId' in  authDetails && 'organizationId' in authDetails) {
            const { userId, organizationId } = authDetails;
            //console.log('userId',userId);
        //console.log('map',map);
        try {
            events = await map.get(userId);
            //console.log('events selected : ',events);
        }catch(error){
            console.log('Error handling the user');
     }
    }
    
    return events;
}

//get organization name by Id

export const getOrganizatonNameById = async (id:string) => {
    const {name} = GlobalConfiguration.organizationsMap.get(id);
    return name;
}
