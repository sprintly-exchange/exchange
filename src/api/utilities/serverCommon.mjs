import { userInfo } from "os";
import { getAuthDetails } from "./getOrganization&User.mjs";
import appEnumerations from "./severInitFunctions.mjs";

export function setCommonHeaders(res){
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

export function mapEntrySearchByValue(map, searchKey, searchValue) {
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
export function getRoleId(role){
    let roleId = undefined;

    for (let [key, value] of organizationsRolesMapNew.entries()) {
        if (value.role === role) {
            roleId = value.id;
            break;
        }
    }
    return roleId;
};


//get role name given the role Id
export function getRoleById(roleId){
    let role = undefined;
    //console.log('roleId',roleId);
    for (let [key, value] of organizationsRolesMapNew.entries()) {
        //console.log('value',value);
        if (value.id === roleId) {
            role = value.role;
            //console.log('role',role);
            break;
        }
    }
    return role;
};

export function userExists(nameIn){
    let userFound=false;
    for (let user of organizationsUsersMap.values()) {
        if (user.username === nameIn) {
            userFound=true;
        }
    }
    return userFound;
};


export function getUserId(nameIn){
    let userId=null;
    for (let user of organizationsUsersMap.values()) {
        if (user.username === nameIn) {
            userId = user.id;
        }
    }
    return userId;
};

export function getUserById(userId){
    return organizationsUsersMap.get(userId);
};

export function organizationExists(organizationIn){
    let orgFound = false;
    for (let organization of organizationsMap.values()) {
        if (organization.name === organizationIn) {
            orgFound = true;
        }
    }
    return orgFound;
};

export function getOrgId(orgIn){
    let orgId=null;
    for (let org of organizationsMap.values()) {
        if (org.name === orgIn) {
            orgId = org.id;
        }
    }
    return orgId;
};

export async function userHasDeleteRights(req, map, id) {
    // Destructure userId and organizationId from getAuthDetails result
    const { userId, organizationId } = await getAuthDetails(req.headers['authorization']);
    
    // Retrieve user's membership information
    const memberOfOrganizationIds = organizationsUsersMap.get(userId)?.memberOfOrganizationIds || [];

    // Retrieve the item from the map by id
    const item = map.get(id);

    // Ensure item exists before checking delete rights
    if (!item) {
        console.log(" DELETE ****************  LOG : item does not exists.");
        return false; // Return false if no such item exists
    }

    // First condition: The user is the owner or an admin
    if (item.userId === userId || getUserById(userId).roleId === getRoleId(appEnumerations.APP_DEFAULT_ROLE_ADMIN)) {
        console.log(" DELETE ****************  LOG : First condition: The user is the owner or an admin. Deleting record");
        map.delete(id);
        return true;
    // Second condition: The user belongs to the organization and is an organization admin
    } else if (item.organizationId === organizationId 
        && memberOfOrganizationIds.includes(organizationId) 
        && getRoleById(getUserById(userId)) === getRoleId(appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN)) {
        console.log(" DELETE ****************  LOG : Second condition: The user belongs to the organization and is an organization admin. Deleting record");
        map.delete(id);
        return true;
    } else {
        console.log(" DELETE ****************  LOG : User does not have delete rights. Deleting record");
        return false; // User does not have delete rights
    }
};


export const filterResultsBasedOnUserRole = async (map,req) => {
    
    let events =[];

    try {
        const { userId, organizationId } = await getAuthDetails( req.headers['authorization']);
        const memberOforganizationIds = organizationsUsersMap.get(userId).memberOforganizationIds;

        console.log('organizationId',organizationId);
        console.log('event recevied for filtering',map.size);
        console.log("getUserById(userId).roleId)",getUserById(userId).roleId);
        console.log("getRoleById(getUserById(userId).roleId)",getRoleById(getUserById(userId).roleId));

            switch (getRoleById(getUserById(userId).roleId)) 
            {
                case appEnumerations.APP_DEFAULT_ROLE_ADMIN : {
                    events = [...map.values()];
                    console.log('events admin',events.length);
                    break;
                }
                case appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN  : {
                    events = [...map.values()].filter((item) => item.organizationId === organizationId || memberOforganizationIds.includes(item.organizationId));
                    console.log('events org admin' ,events.length);
                    break;
                }
                case appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_USER : {
                    events = [...map.values()].filter((item) => item.organizationId === organizationId || memberOforganizationIds.includes(item.organizationId));
                    console.log('events org user' ,events.length);
                    break;
                }
                default:     
                    break;
            }
    }catch(error){
        console.log('Error handling the user');
    }

    return events;
}

export const filterResultsBasedOnUserRoleAndUserId = async (map,req) => {
    let events =[];
    try {
        const { userId, organizationId } = await getAuthDetails( req.headers['authorization']);
        const memberOforganizationIds = organizationsUsersMap.get(userId).memberOforganizationIds;

        console.log('organizationId : ',organizationId);
        console.log('Events recevied for filtering : ',map.size);
        console.log("User Id :",getUserById(userId).roleId);
        console.log("role Id : ",getRoleById(getUserById(userId).roleId));
    
            switch (getRoleById(getUserById(userId).roleId)) 
            {
                case appEnumerations.APP_DEFAULT_ROLE_ADMIN : {
                    events = [...map.values()];
                    console.log('events admin',events.length);
                    break;
                }
                case appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN  : {
                    events = [...map.values()].filter((item) => (item.organizationId === organizationId || item.userId === userId ||  memberOforganizationIds.includes(item.organizationId)));
                    //events = [...events,[...map.values()].filter((item) => item.userId === userId)]
                    console.log('events org admin/user' ,events.length);
                    break;
                }
                case appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_USER : {
                    events = [...map.values()].filter((item) => (item.organizationId === organizationId || item.userId === userId || memberOforganizationIds.includes(item.organizationId)));
                    //events = [...events,[...map.values()].filter((item) => item.userId === userId)]
                    console.log('events org admin/user' ,events.length);
                    break;
                }
                default:     
                    break;
            }
    }catch(error){
        console.log('Error handling the user');
    }

    return events;
}

export const filterResultsBasedOnUser = async (map,req) => {
    const { userId, organizationId } = await getAuthDetails( req.headers['authorization']);
    let events =[];
    try {
        events = [...map.values()].filter((item) => item.userId === userId);
    }catch(error){
        console.log('Error handling the user');
    }

    return events;
}

//this is to retrn item in a map, stored by usierId, example user configuragion stored by userId
export const getItemByUserId = async (map,req) => {
    const { userId, organizationId } = await getAuthDetails( req.headers['authorization']);
    let events =[];
    //console.log('userId',userId);
    //console.log('map',map);
    try {
        events = await map.get(userId);
        //console.log('events selected : ',events);
    }catch(error){
        console.log('Error handling the user');
    }

    return events;
}

//get organization name by Id

export const getOrganizatonNameById = async (id) => {
    const {name} = organizationsMap.get(id);
    return name;
}
