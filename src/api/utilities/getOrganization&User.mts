import pkg from 'jsonwebtoken';

import jwt, { decode,JwtPayload } from 'jsonwebtoken';
import axios from 'axios';
import jwkToPem from 'jwk-to-pem';
import { getOrgId, getRoleId, getUserById, getUserId, organizationExists, userExists } from './serverCommon.mjs';
import {v4 as uuidv4} from 'uuid';
import bcrypt from 'bcryptjs';
import GlobalConfiguration from '../../GlobalConfiguration.mjs';
import { CommonFunctions } from '../models/CommonFunctions.mjs';

const {TokenExpiredError} = pkg;
const returnObj =  {userId: '',organizationId: ''}
type AuthDetails = {
  userId: string;
  organizationId: string; // Mark as optional if it can be undefined
};


export const getAuthDetails = async (authorizationHeader:string): Promise<AuthDetails | undefined> => {
    if (
      typeof authorizationHeader !== 'string' ||
      !authorizationHeader.startsWith('Bearer ')
    ) {
      throw new Error('Access Denied: No Token Provided!');
      return returnObj;
    }
  
    const token = authorizationHeader.split(' ')[1];
    try {
      //Check API server provided JWT token
      const secret = process.env.JWT_SECRET;
      if (!secret) {
          throw new Error("JWT_SECRET environment variable is not set");
      }
      const decoded = jwt.verify(token, secret);

      if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && 'organizationId' in decoded) {
          const { userId, organizationId } = decoded as JwtPayload;
          CommonFunctions.logWithTimestamp(`User ID: ${userId}, Organization ID: ${organizationId}`);
          returnObj.userId = userId;
          returnObj.organizationId = organizationId;
          return returnObj;
      }
      //if found retun the userId and organizationId
      
    }catch (error) {
      if (error instanceof TokenExpiredError) {
        // Handle the expired token case
        CommonFunctions.logWithTimestamp('Token expired:', error.expiredAt);
        throw new Error('Access Denied: Token has expired, please reauthenticate!');
        // Alternatively, implement token refresh logic here if applicable
        // Example:
        // const newToken = await refreshToken(token);
        // return await getAuthDetails(`Bearer ${newToken}`);
      } else {
        // For other types of errors (like invalid token), fall back to Google authentication
        CommonFunctions.logWithTimestamp('Checking for Google user authentication.');
        return await checkGoogleAuth(token);
      }
    }
   };

   const checkGoogleAuth = async (token:any) : Promise<AuthDetails | undefined>  => {
    //attempt to move forward, check for google token to enable the other features to google authenticated user
    
    //Check organization existance based on email
    try{
      const result = await verifyGoogleToken(token);

      if (result && result.email) {
          const { email } = result;
          // Proceed with email
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
            GlobalConfiguration.organizationsMap.set(org.id,org);
            returnObj.organizationId = org.id;
            CommonFunctions.logWithTimestamp('rganization added : ',new Date().toISOString(), org);
          } else {
            returnObj.organizationId = getOrgId(email);
          }
  
          //Check user existance based on email
          if(!userExists(email) && GlobalConfiguration.googleUserCreationStatus[email] !== true){
            GlobalConfiguration.googleUserCreationStatus[email] = true;
            const user = {
              id: `${uuidv4()}`,
              username : email,
              email : email,
              mobileNumber : '',
              password :  `${await bcrypt.hash('changeme', 10)}`,
              organizationId: returnObj.organizationId,
              memberOforganizationIds: [getOrgId( GlobalConfiguration.appEnumerations.APP_DEFAULT_ORGANIZATION_NAME)],
              roleId : getRoleId( GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN),
              registrationDate: new Date().toISOString(),
              lastLoggedInTime: new Date(),
            };
            GlobalConfiguration.organizationsUsersMap.set(user.id,user);
            returnObj.userId = user.id;
            CommonFunctions.logWithTimestamp('User added : ',new Date().toISOString(), user);
            GlobalConfiguration.googleUserCreationStatus[email] = false;
          } else {
            returnObj.userId = getUserId(email);
            const currUserSet = getUserById(returnObj.userId);
            currUserSet.lastLoggedInTime =  new Date();
          }
      } else {
          // Handle the case where email or result is undefined
          console.error('Google token verification failed or email is missing');
      }
      
      return returnObj;
    }catch(error:any){
      CommonFunctions.logWithTimestamp(error);
      return  returnObj;
  
    }
    
  };



   const verifyGoogleToken = async (token:any) => {
    try {
      // Fetch Google's public keys
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/certs');
      const keys = response.data.keys;
      //CommonFunctions.logWithTimestamp('Fetched keys:', JSON.stringify(keys, null, 2));
  
      // Decode the token header to get the key ID (kid)
      const decodedHeader = jwt.decode(token, { complete: true });
      if (!decodedHeader) {
        throw new Error('Invalid token');
      }
      //CommonFunctions.logWithTimestamp('Decoded header:', JSON.stringify(decodedHeader, null, 2));
  
      const kid = decodedHeader.header.kid;
      //CommonFunctions.logWithTimestamp('Key ID (kid):', kid);
  
      // Find the public key that matches the key ID
      const key = keys.find((k:any) => k.kid === kid);
      if (!key) {
        throw new Error('Key not found');
      }
      //CommonFunctions.logWithTimestamp('Matched key:', JSON.stringify(key, null, 2));
  
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
      //CommonFunctions.logWithTimestamp('Public key:', pubKey);
  
      // Verify the token
      const decoded = jwt.verify(token, pubKey);

      if (typeof decoded === 'object' && decoded !== null && 'email' in decoded) {
          const { email } = decoded as JwtPayload; // Narrow down the type to JwtPayload
          return { email };
      } else {
          throw new Error('Token does not contain a valid payload with an email');
      }
    } catch (error:any) {
      console.error('Error verifying token:', error.message);
  
    }
  };