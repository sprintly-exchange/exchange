// routes/demo.mjs

import { Router } from 'express';
import { setCommonHeaders } from '../../api/utilities/serverCommon.mjs';
import { addDemoCases, removeDemoCases } from './addDemoCases.mjs';
import { getAuthDetails } from "../../api/utilities/getOrganization&User.mjs";

const demoRoutes = Router();

// Function for enabling/disabling the demo mode
const toggleDemoMode = async (req) => {
    const { userId, organizationId } = await getAuthDetails(req.headers['authorization']);

    // Get the current demo mode status
    const demoMode = global.demoModeEnabledMap.get(organizationId);
    
    // If no demo mode entry exists for the organization, return false
    if (!demoMode) {
         // If demo mode is currently disabled, enable it
         addDemoCases(organizationId);
         global.demoModeEnabledMap.set(organizationId, { 'status': true });
         console.log('Demo mode status enabled for organization:', organizationId);
         return true;
    }

    const status = demoMode.status;

    // Toggle demo mode: disable if enabled, enable if disabled
    if (status) {
        // If demo mode is currently enabled, disable it
        removeDemoCases(configurationPickupMap, configurationDeliveryMap, configurationFlowMap, organizationId);
        global.demoModeEnabledMap.set(organizationId, { 'status': false });
        console.log('Demo mode status disabled for organization:', organizationId);
        return false;
    } else {
      // If demo mode is currently disabled, enable it
      addDemoCases(organizationId);
      global.demoModeEnabledMap.set(organizationId, { 'status': true });
      console.log('Demo mode status enabled for organization:', organizationId);
      return true;
    }

    return true;  // Return true if the toggle was successful
};

// Route to toggle demo mode
demoRoutes.get('/toggle', async function (req, res) {   
    await toggle(req, res);
});

async function toggle(req, res) {
    const { userId, organizationId } = await getAuthDetails(req.headers['authorization']);
    console.debug('Toggle demo mode request.');
    setCommonHeaders(res);

    // Await the toggleDemoMode function since it's async
    const toggleResult = await toggleDemoMode(req);

    // If toggle was successful, return the updated demo mode status
    if (toggleResult) {
        res.status(200).send(global.demoModeEnabledMap.get(organizationId));  // Successful toggle
    } else {
        res.status(400).send('');  // Bad request
    }
}

// API to get the current status of the demo mode
/**
* @swagger
* /api/toggledemomode/status:
*   get:
*     summary: Get status of demo mode
*     responses:
*       200:
*         description: Successful response
*/
demoRoutes.get('/status', async function (req, res) {  
    await status(req, res);  // Ensure async status function is awaited
});

async function status(req, res) {
    const { userId, organizationId } = await getAuthDetails(req.headers['authorization']);
    const demoStatus = {
        status: global.demoModeEnabledMap.get(organizationId) ? global.demoModeEnabledMap.get(organizationId).status : false,
    }; 
    console.debug('Demo mode status requested.');
    setCommonHeaders(res);
    res.status(200).json(demoStatus);  // Express automatically converts object to JSON
    console.debug(`Demo mode status: ${demoStatus.status}`);
}

export default demoRoutes;
