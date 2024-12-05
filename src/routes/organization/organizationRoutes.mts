import { Router } from 'express';
import { userHasDeleteRights, filterResultsBasedOnUserRole, setCommonHeaders } from '../../api/utilities/serverCommon.mjs';
import { v4 as uuidv4 } from 'uuid';
import { ResponseMessage } from '../../api/models/ResponseMessage.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import GlobalConfiguration from '../../GlobalConfiguration.mjs';
import { CommonFunctions } from '../../api/models/CommonFunctions.mjs';

const organizationRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Organization
 *   description: API endpoints for organization
 */

/**
 * @swagger
 * /api/organizations/register-organization:
 *   post:
 *     summary: Register an organization
 *     tags: [Organization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *             example:
 *               name: OrganizationName
 *               address: OrganizationAddress
 *     responses:
 *       '201':
 *         description: Organization registered successfully
 *       '400':
 *         description: Organization name already exists or other error
 */
organizationRoutes.post('/register-organization', async (req:any, res:any) => {
  try {
    const { name, address, mobile, email, web , phone } = req.body;
    req.body.id === undefined ? req.body.id = uuidv4() : '';
    const id = req.body.id;
    setCommonHeaders(res);

    // Check if the organization name already exists
    for (let organization of GlobalConfiguration.organizationsMap.values()) {
      if (organization.name === name) {
        return res.status(400).send(new ResponseMessage(uuidv4(),'Organization name already exists','Failed'));
      }
    }

    // Add the new organization to the map
    GlobalConfiguration.organizationsMap.set(id, req.body);

    res.status(201).send({ id, message: 'Organization registered successfully' });
  } catch (error:any) {
    res.status(400).send(error.message);
  }
});

/**
 * @swagger
 * /api/organizations/:
 *   get:
 *     summary: Get all organizations
 *     tags: [Organization]
 *     responses:
 *       '200':
 *         description: A list of organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   address:
 *                     type: string
 *       '204':
 *         description: No organizations found
 */
organizationRoutes.get('/', (req, res) => {
  console.debug(`All organizations requested.`);
  getOrganizations(req,res);
});

async function getOrganizations(req:any,res:any){
  setCommonHeaders(res);
  const events = await filterResultsBasedOnUserRole(GlobalConfiguration.organizationsMap,req);
  return events.length > 0 ? res.status(200).send(events) : res.status(204).send('');
}

/**
 * @swagger
 * /api/organizations/name/{name}:
 *   get:
 *     summary: Get an organization by name
 *     tags: [Organization]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the organization
 *     responses:
 *       '200':
 *         description: Organization found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 *       '404':
 *         description: Organization not found
 */
organizationRoutes.get('/name/:name', (req, res) => {
  const { name } = req.params;
  setCommonHeaders(res);
  const organization = [...GlobalConfiguration.organizationsMap.values()].find(org => org.name === name);
  if (organization) {
    res.status(200).send(organization);
  } else {
    res.status(404).send(new ResponseMessage(uuidv4(),'Organization not found','Failed'));
  }
});

/**
 * @swagger
 * /api/organizations/id/{id}:
 *   get:
 *     summary: Get an organization by ID
 *     tags: [Organization]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the organization
 *     responses:
 *       '200':
 *         description: Organization found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 *       '404':
 *         description: Organization not found
 */
organizationRoutes.get('/id/:id', (req, res) => {
  const { id } = req.params;
  setCommonHeaders(res);
  if (GlobalConfiguration.organizationsMap.has(id)) {
    const organization = GlobalConfiguration.organizationsMap.get(id);
    res.status(200).send(organization);
  } else {
    res.status(404).send(new ResponseMessage(uuidv4(),'Organization not found','Failed'));
  }
});

/**
 * @swagger
 * /api/organization/id/{id}:
 *   delete:
 *     summary: Delete an organization by ID
 *     tags: [Organization]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the organization to delete
 *     responses:
 *       '200':
 *         description: Organization deleted successfully
 *       '404':
 *         description: Organization not found
 */
organizationRoutes.delete('/id/:id', (req, res) => {
  deleteOrganisaton(req,res);
});

async function deleteOrganisaton(req:any,res:any){
  const { id } = req.params;
  setCommonHeaders(res);  
 

  if (GlobalConfiguration.organizationsMap.has(id)) {
    CommonFunctions.logWithTimestamp('organizationsMap.get(id).isDefaultUiDisplayFalse',GlobalConfiguration.organizationsMap.get(id).isDefaultUiDisplayFalse);
    if(GlobalConfiguration.organizationsMap.get(id).isDefaultUiDisplayFalse !== true){
      //organizationsMap.delete(id);
      await userHasDeleteRights(req,GlobalConfiguration.organizationsMap,req.params.id) ? res.status(200).send('') : res.status(400).send(new ResponseMessage(uuidv4(),'Not allowed','Failed'));
      res.status(200).send(new ResponseMessage(uuidv4(),'Organization deleted successfully','Success'));
    } else {
      res.status(404).send(new ResponseMessage(uuidv4(),`${GlobalConfiguration.organizationsMap.get(id).name} cannot be deleted.`,'Failed'));
    }
    
  } else {
    res.status(404).send(new ResponseMessage(uuidv4(),`Organization ${id} not found.`,'Failed'));
  }
}

/**
 * @swagger
 * /api/organization/id/{id}:
 *   put:
 *     summary: Update an organization by ID
 *     tags: [Organization]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the organization to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *             example:
 *               name: UpdatedOrganizationName
 *               address: UpdatedOrganizationAddress
 *     responses:
 *       '200':
 *         description: Organization updated successfully
 *       '400':
 *         description: Invalid request body or organization name already exists
 *       '404':
 *         description: Organization not found
 */
organizationRoutes.put('/id/:id', async (req:any, res:any) => {
  const { id } = req.params;
  const { name, address, email, phone, web } = req.body;
  setCommonHeaders(res);

  if (!name || !address) {
    return res.status(400).send('Invalid request body');
  }

  if (!GlobalConfiguration.organizationsMap.has(id)) {
    return res.status(404).send('Organization not found.');
  }

  //if (organizationsMap.get(id).name === 'Default Organization') {
  //  return res.status(404).send('Cannot edit default organization.');
  //

  // Check if the updated name already exists in another organization
  for (let organization of GlobalConfiguration.organizationsMap.values()) {
    if (organization.name === name && organization.id !== id) {
      return res.status(400).send(new ResponseMessage(uuidv4(),'Organization name already exists','Failed'));
    }
  }



  //not to remove the default organization attributes set by API server.
  if( GlobalConfiguration.organizationsMap.get(id).isDefaultUiDisplayFalse === true) {
    const isDefaultUiDisplayFalse = true;
    GlobalConfiguration.organizationsMap.set(id,{isDefaultUiDisplayFalse,id,name:'Default Organization', address , email, phone, web});
  } else {
    GlobalConfiguration.organizationsMap.set(id,{id,name, address , email, phone, web});
  }
  
  res.status(200).send(new ResponseMessage(uuidv4(),'Organization updated successfully','Success'));
});

export default organizationRoutes;
