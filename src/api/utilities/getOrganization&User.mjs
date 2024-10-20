import pkg from 'jsonwebtoken';
const {jwt, decode, TokenExpiredError, verify } = pkg;
import axios from 'axios';
import jwkToPem from 'jwk-to-pem';
import { getOrgId, getRoleId, getUserById, getUserId, organizationExists, userExists } from './serverCommon.mjs';
import {v4 as uuidv4} from 'uuid';
import bcrypt from 'bcryptjs';
import appEnumerations from './severInitFunctions.mjs';


export const getAuthDetails = async (authorizationHeader) => {
    if (
      typeof authorizationHeader !== 'string' ||
      !authorizationHeader.startsWith('Bearer ')
    ) {
      throw new Error('Access Denied: No Token Provided!');
      return  {undefined, undefined};
    }
  
    const token = authorizationHeader.split(' ')[1];
    try {
      //Check API server provided JWT token
      const secret = process.env.JWT_SECRET;
      const decoded = jwt.verify(token, secret);
      const { userId, organizationId } = decoded;
      //if found retun the userId and organizationId
      return { userId, organizationId };
    }catch (error) {
      if (error instanceof TokenExpiredError) {
        // Handle the expired token case
        console.log('Token expired:', error.expiredAt);
        throw new Error('Access Denied: Token has expired, please reauthenticate!');
        // Alternatively, implement token refresh logic here if applicable
        // Example:
        // const newToken = await refreshToken(token);
        // return await getAuthDetails(`Bearer ${newToken}`);
      } else {
        // For other types of errors (like invalid token), fall back to Google authentication
        console.log('Checking for Google user authentication.');
        return await checkGoogleAuth(token);
      }
    }
   };

   const checkGoogleAuth = async (token) => {
    //attempt to move forward, check for google token to enable the other features to google authenticated user
    
    //Check organization existance based on email
    try{
        const {email} = await verifyGoogleToken(token);
        let {userId,organizationId}={};
        if(!organizationExists(email)){
          const orgId=`${uuidv4()}`;
          const org = {
            id : orgId,
            name : email,
            address: 'N/A',
            email: email,
            web:'N/A',
            phone:'+00 000 000 000', 
            organizationId: orgId,
            registrationDate: new Date().toISOString(),
          };
          organizationsMap.set(org.id,org);
          organizationId = org.id;
          console.log('rganization added : ',new Date().toISOString(), org);
        } else {
          organizationId = getOrgId(email);
        }

        //Check user existance based on email
        if(!userExists(email) && global.googleUserCreationStatus[email] !== true){
          global.googleUserCreationStatus[email] = true;
          const user = {
            id: `${uuidv4()}`,
            username : email,
            email : email,
            mobileNumber : '',
            password :  `${await bcrypt.hash('changeme', 10)}`,
            organizationId: organizationId,
            memberOforganizationIds: [getOrgId(appEnumerations.APP_DEFAULT_ORGANIZATION_NAME)],
            roleId : getRoleId(appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN),
            registrationDate: new Date().toISOString(),
            lastLoggedInTime: new Date(),
          };
          organizationsUsersMap.set(user.id,user);
          userId = user.id;
          console.log('User added : ',new Date().toISOString(), user);
          global.googleUserCreationStatus[email] = false;
        } else {
          userId = getUserId(email);
          const currUserSet = getUserById(userId);
          currUserSet.lastLoggedInTime =  new Date();
        }

        //console.log('Google based user/organization ID',{userId, organizationId});
        //console.log('google user', organizationsUsersMap.get(userId) );
        //console.log('google org', organizationsMap.get(organizationId) );
        return {userId, organizationId};
    }catch(error){
      console.log(error);
      return  {undefined, undefined};
  
    }
    
  };



   const verifyGoogleToken = async (token) => {
    try {
      // Fetch Google's public keys
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/certs');
      const keys = response.data.keys;
      //console.log('Fetched keys:', JSON.stringify(keys, null, 2));
  
      // Decode the token header to get the key ID (kid)
      const decodedHeader = jwt.decode(token, { complete: true });
      if (!decodedHeader) {
        throw new Error('Invalid token');
      }
      //console.log('Decoded header:', JSON.stringify(decodedHeader, null, 2));
  
      const kid = decodedHeader.header.kid;
      //console.log('Key ID (kid):', kid);
  
      // Find the public key that matches the key ID
      const key = keys.find((k) => k.kid === kid);
      if (!key) {
        throw new Error('Key not found');
      }
      //console.log('Matched key:', JSON.stringify(key, null, 2));
  
      // Ensure the key has the x5c property or convert JWK to PEM
      let pubKey;
      if (key.x5c && key.x5c.length) {
        // Construct the public key from x5c
        pubKey = `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`;
      } else if (key.n && key.e) {
        // Convert JWK to PEM format
        pubKey = jwkToPem(key);
      } else {
        throw new Error('Invalid key format: x5c and RSA properties are missing or empty');
      }
      //console.log('Public key:', pubKey);
  
      // Verify the token
      const decoded = jwt.verify(token, pubKey);
      const {email} = decoded;
      return {email};
    } catch (error) {
      console.error('Error verifying token:', error.message);
  
    }
  };