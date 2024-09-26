// routes/demo.mjs
import { Router } from 'express';
import { setCommonHeaders } from '../../api/utilities/serverCommon.mjs';
import { addDemoCases, removeDemoCases } from './addDemoCases.mjs';
import { getAuthDetails } from "../../api/utilities/getOrganization&User.mjs";

const demoRoutes = Router();

//function for enabling disabling the demo mode
const toogleDemoMode = async (req) => {
      const { userId, organizationId } = await getAuthDetails( req.headers['authorization']);
       if(!global.demoModeEnabled[organizationId]) {
            addDemoCases(organizationId);
            global.demoModeEnabled[organizationId] = true;
            console.log('Demo mode status enabled : ', global.demoModeEnabled[organizationId]);
            return true;
       } else {
            removeDemoCases(configurationPickupMap,configurationDeliveryMap,configurationFlowMap,organizationId);
            global.demoModeEnabled[organizationId] = false; 
            console.log('Demo mode status enabled : ', global.demoModeEnabled[organizationId]); 
            return true;
       }

     
       
};


//enable for testing purpose during development
//(toogleDemoMode(true));

demoRoutes.get('/toggle', function (req, res) {   
      toggle(req,res);
});

  async function toggle(req,res){
      const { userId, organizationId } = await getAuthDetails( req.headers['authorization']);
      const demoStatus = {
            status: global.demoModeEnabled[organizationId],
      };
      console.debug(`Toggle demo mode request.`);
      setCommonHeaders(res);
      toogleDemoMode(req)?res.status(200).send(JSON.stringify(demoStatus)):res.status(400).send(JSON.stringify(demoStatus)); ; 
      console.debug(`Demo mode status: ${global.demoModeEnabled[organizationId]}`);
  };

//api to get status of demo mode
/**
* @swagger
* /api/toggledemomode/status:
*   get:
*     summary: Get status of demo mode
*     responses:
*       200:
*         description: Successful response
*/
demoRoutes.get('/status', function (req, res) {  
      status(req,res);
});

async function status(req,res){
      const { userId, organizationId } = await getAuthDetails( req.headers['authorization']);
      const demoStatus = {
            status: demoModeEnabled[organizationId],
      }; 
      console.debug(`Demo mode status requested.`);
      setCommonHeaders(res);
      res.status(200).send(JSON.stringify(demoStatus));   
       console.debug(`Demo mode status: ${demoModeEnabled[organizationId]}`);
}

export default demoRoutes;
