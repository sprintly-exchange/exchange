import { Router } from 'express';
import { setCommonHeaders } from '../../api/utilities/serverCommon.mjs';
import { v4 as uuidv4 } from 'uuid';
import { ResponseMessage } from '../../api/models/ResponseMessage.mjs';

const OpenApis = Router();

OpenApis.get('/defaultOrganization', (req, res) => {
    setCommonHeaders(res);
    const organization = [...organizationsMap.values()].find(org => org.name === 'Default Organization');
    if (organization) {
      res.status(200).send(organization);
    } else {
      res.status(404).send(new ResponseMessage(uuidv4(),'Organization not found','Failed'));
    }
  });


export default OpenApis;
