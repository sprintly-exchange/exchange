import jwt from 'jsonwebtoken';
import { getAuthDetails } from './getOrganization&User.mjs';
import { v4 as uuidv4 } from 'uuid';

// Middleware to decode JWT token and inject userId and organizationId into request body
export const decodeToken = async (req:any, res:any, next:any) => {
  // Paths that do not require token decoding
  const exemptPaths = [
    '/api/iam/login',
    '/api/transactions/statistics/',
    '/api/system/queue/statistics',
    '/api/users/register-user',
    '/api-docs',
    '/api/openapis',
  ];

  console.log('Request Path : ', req.path);
  // Check if the request path is exempted or method is OPTIONS
  if (exemptPaths.some(path => req.path.startsWith(path)) || req.method === 'OPTIONS') {
    return next();
  }

  try {
    const { userId, organizationId } = await getAuthDetails(req.headers['authorization']);
    // Inject userId and organizationId into request body if they exist
    if (req.method === 'POST' || req.method === 'PUT') {

      req.body = {
        ...req.body,
        ...(userId && { "userId":userId }),
        ...(organizationId && { 'organizationId':organizationId }),
        id: req.body.id || uuidv4(),
      };

      //console.log( 'req.body', req.body);
    }

    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(400).send('Invalid Token');
  }
};

// Apply CORS headers if needed
export const applyCorsHeaders = (req:any, res:any, next:any) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');

  // If the request method is OPTIONS, respond with status 204 (No Content)
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
};
