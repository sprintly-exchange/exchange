import { Router } from 'express';
import { getOrgId, getRoleId, getUserById, setCommonHeaders } from '../../api/utilities/serverCommon.mjs';
import { v4 as uuidv4 } from 'uuid';
import { ResponseMessage } from '../../api/models/ResponseMessage.mjs';
import bcrypt from 'bcryptjs';
import { getAuthDetails } from '../../api/utilities/getOrganization&User.mjs';
import GlobalConfiguration from '../../GlobalConfiguration.mjs';
import { CommonFunctions } from '../../api/models/CommonFunctions.mjs';

const userRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for users
 */

/**
 * @swagger
 * /api/users/register-user:
 *   post:
 *     summary: Register a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               organizationId:
 *                 type: string
 *             example:
 *               username: UserName
 *               password: Password
 *               email: user@example.com
 *               organizationId: organizationId
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Username already exists, organization does not exist, or other error
 */
userRoutes.post('/register-user', async (req:any, res:any) => {
    try {
        const { username, password, email,mobileNumber, organizationId} = req.body;
        const registrationDate = new Date().toISOString();
        const id = uuidv4();
        setCommonHeaders(res);
        
        if (!GlobalConfiguration.organizationsMap.has(organizationId)) {
            return res.status(403).send(new ResponseMessage(uuidv4(),'Organization does not exist','Failed'));
        }

        // Check if the username already exists in any user
        for (const user of GlobalConfiguration.organizationsUsersMap.values()) {
            if (user.username === username) {
                return res.status(403).send(new ResponseMessage(uuidv4(),'Username already exists','Failed'));
            }
        }


        const roleId = getRoleId( GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_USER);
        const hashedPassword = await bcrypt.hash(password, 10);
        GlobalConfiguration.organizationsUsersMap.set(id, { id, username, password: hashedPassword, email, mobileNumber, organizationId, roleId,registrationDate });
        res.status(201).send(new ResponseMessage(uuidv4(),'User registered successfully','Success'));
        //CommonFunctions.logWithTimestamp('organizationsUsersMap.', organizationsUsersMap);
    } catch (error:any) {
        res.status(400).send(error.message);
    }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       '200':
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *                   organizationId:
 *                     type: string
 *       '204':
 *         description: No users found
 */
userRoutes.get('/', (req, res) => {
    CommonFunctions.logWithTimestamp(`All users requested.`);
    try{
        filterUsers(req, res);
    }catch(error) {
        CommonFunctions.logWithTimestamp(error);
        res.status(400).send('Unable to read the users.');
    }
});

const filterUsers = async  (req:any,res:any) =>  {
    try{
        
        const authDetails = await getAuthDetails(req.headers['authorization']);

        if (authDetails) {
            const { userId, organizationId } = authDetails;
            //CommonFunctions.logWithTimestamp('from auth ', { userId, organizationId });
            setCommonHeaders(res);
            const currUser = GlobalConfiguration.organizationsUsersMap.get(userId);
            //super admin user for the applications
            if(currUser.roleId === getRoleId( GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ADMIN) ) {
                const users = Array.from(GlobalConfiguration.organizationsUsersMap.values());
                users.length > 0 ? res.status(200).send(users) : res.status(204).send([]); 
            } else if(currUser.roleId === getRoleId( GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN)){
                const users = Array.from(GlobalConfiguration.organizationsUsersMap.values()).filter((user) => user.organizationId === organizationId);
                users.length > 0 ? res.status(200).send(users) : res.status(204).send([]);
            }
            else {
                res.status(200).send(GlobalConfiguration.organizationsUsersMap.get(userId));
            }
        } else {
            throw new Error('Authorization details are missing');
        }
        
    }catch(error){
        CommonFunctions.logWithTimestamp(error);
        res.status(400).send('');

    }
}

/**
 * @swagger
 * /api/users/edit-user:
 *   put:
 *     summary: Edit user details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               organizationId:
 *                 type: string
 *             example:
 *               id: userId
 *               username: NewUserName
 *               email: newuser@example.com
 *               organizationId: newOrganizationId
 *     responses:
 *       '200':
 *         description: User updated successfully
 *       '400':
 *         description: User not found, organization does not exist, or other error
 */
userRoutes.put('/edit-user', async (req:any, res:any) => {
    try {
        const { id, username, email,mobileNumber, organizationId, password,roleId } = req.body;
     
        setCommonHeaders(res);

        if (!GlobalConfiguration.organizationsUsersMap.has(id)) {
            return res.status(400).send('User not found');
        }
        if (!GlobalConfiguration.organizationsMap.has(organizationId)) {
            return res.status(400).send(new ResponseMessage(uuidv4(),'Organization does not exist','Failed'));
        }

        const user = GlobalConfiguration.organizationsUsersMap.get(id);
        user.username = username || user.username;
        user.email = email || user.email;
        user.organizationId = organizationId || user.organizationId;
        user.mobileNumber = mobileNumber || user.mobileNumber;
        user.roleId = roleId || user.roleId;


        // Update password only if a new password is provided and it's different from the existing one
        //CommonFunctions.logWithTimestamp('password : ',password);
        //CommonFunctions.logWithTimestamp('user.password : ',user.password)
        //CommonFunctions.logWithTimestamp(user.password === password);

        if (password) {
            const isSamePassword = await bcrypt.compare(password, user.password);
            if (!isSamePassword) {
                const hashedPassword = await bcrypt.hash(password, 10);
                user.password = hashedPassword;
            }
        }

        GlobalConfiguration.organizationsUsersMap.set(id, user);
        res.status(200).send(new ResponseMessage(uuidv4(),'User updated successfully','Sucess'));
    } catch (error) {
        CommonFunctions.logWithTimestamp(error); // Log the error for debugging purposes
        res.status(500).send('Internal server error'); // Send a generic error message to the client
    }
});

/**
 * @swagger
 * /api/users/id/{id}:
 *   delete:
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       '200':
 *         description: User deleted successfully
 *       '400':
 *         description: User not found or other error
 */
userRoutes.delete('/id/:id', (req, res) => {
    try {
       deleteUser(req,res);
    } catch (error:any) {
        res.status(400).send(error.message);
    }
});

const deleteUser = async (req:any,res:any)  => {
    const { id } = req.params;
    setCommonHeaders(res);

    const authDetails = await getAuthDetails(req.headers['authorization']);

    if (authDetails && 'userId' in authDetails) {
        const { userId } = authDetails;
        const currUser = getUserById(userId);
        if(currUser.roleId === getRoleId( GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ADMIN) ) {
            if (!GlobalConfiguration.organizationsUsersMap.has(id)) {
                return res.status(400).send(new ResponseMessage(uuidv4(),'User not found','Failed'));
            }
            if (GlobalConfiguration.organizationsUsersMap.get(id)['username']  ===  GlobalConfiguration.appEnumerations.APP_DEFAULT_ADMIN_NAME) {
                return res.status(400).send(new ResponseMessage(uuidv4(),'Admin user cannot be removed.','Failed'));
            } else {
                GlobalConfiguration.organizationsUsersMap.delete(id);
                res.status(200).send(new ResponseMessage(uuidv4(),'User deleted successfully','Success'));
            }
        } else if(currUser.roleId === getRoleId( GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN)){
            if(currUser.organizationId === currUser.organizationId){
                GlobalConfiguration.organizationsUsersMap.delete(id);
                res.status(200).send(new ResponseMessage(uuidv4(),'User deleted successfully','Success'));
            }
        }
        else {
            return res.status(403).send(new ResponseMessage(uuidv4(),'Users with admin role cannot be removed.','Failed'));
        }
    } else {
        // Handle case where authDetails is undefined or missing userId
        CommonFunctions.logWithTimestamp('Authorization details are missing or invalid');
    }
    
}

/**
 * @swagger
 * /api/users/id/{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       '200':
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 organizationId:
 *                   type: string
 *       '400':
 *         description: User not found or other error
 */
userRoutes.get('/id/:id', (req:any, res:any) => {
    try {
        const { id } = req.params;
        setCommonHeaders(res);
        if (!GlobalConfiguration.organizationsUsersMap.has(id)) {
            return res.status(400).send(new ResponseMessage(uuidv4(),'User not found','Success'));
        }
        const user = GlobalConfiguration.organizationsUsersMap.get(id);
        res.status(200).send(user);
    } catch (error:any) {
        res.status(400).send(error.message);
    }
});

/**
 * @swagger
 * /username/{username}:
 *   get:
 *     summary: Get user by username
 *     description: Retrieve user details by username.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user to retrieve.
 *     responses:
 *       200:
 *         description: Successful response with user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The user's ID.
 *                 username:
 *                   type: string
 *                   description: The user's username.
 *       400:
 *         description: User not found or error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The response ID.
 *                 message:
 *                   type: string
 *                   description: The error message.
 *                 status:
 *                   type: string
 *                   description: The status of the response.
 */

userRoutes.get('/username/:username', (req:any, res:any) => {
    try {
        const { username } = req.params;
        setCommonHeaders(res);
        let userFound = null;
        for (let user of GlobalConfiguration.organizationsUsersMap.values()) {
            if (user.username === username) {
                userFound = user;
                break;
            }
        }
        if (!userFound) {
            return res.status(400).send(new ResponseMessage(uuidv4(), 'User not found', 'Failure'));
        }
        userFound.password = '';
        res.status(200).send(userFound);
    } catch (error:any) {
        res.status(400).send(error.message);
    }
});

userRoutes.get('/roles', (req, res) => {
    CommonFunctions.logWithTimestamp(`All roles requested.`);
   filterRoles(req,res);
    
});

const filterRoles = async  (req:any,res:any) =>  {
    try{
        const authDetails = await getAuthDetails(req.headers['authorization']);

        if (authDetails && 'userId' in authDetails) {
            const { userId } = authDetails;
            // Proceed with userId
            setCommonHeaders(res);
            let events = [];
            const currUser=getUserById(userId);
            //super admin user for the applications
            if(currUser.roleId === getRoleId( GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ADMIN) ) {
                events = Array.from(GlobalConfiguration.organizationsRolesMap.values());
                events.length > 0 ? res.status(200).send(events) : res.status(204).send([]); 
            } else if(currUser.roleId === getRoleId( GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN)){
                events = Array.from(GlobalConfiguration.organizationsRolesMap.values()).filter((role)=> role.role ===  GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_ADMIN || role.role ===  GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_USER);
                events.length > 0 ? res.status(200).send(events) : res.status(204).send([]); 
            }  else if(currUser.roleId === getRoleId( GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_USER)){
                events = Array.from(GlobalConfiguration.organizationsRolesMap.values()).filter((role)=>  role.role ===  GlobalConfiguration.appEnumerations.APP_DEFAULT_ROLE_ORGANIZATION_USER);
                events.length > 0 ? res.status(200).send(events) : res.status(204).send([]); 
            }
            
            else {
                res.status(204).send([]);
            }
            } else {
                // Handle case where authDetails is undefined or missing userId
                CommonFunctions.logWithTimestamp('Authorization details are missing or invalid');
            }
        
    }catch(error){
        res.status(400).send('');
    }
}

export default userRoutes;
