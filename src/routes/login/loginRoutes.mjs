import { Router } from 'express';
import { setCommonHeaders } from '../../api/utilities/serverCommon.mjs';
import { v4 as uuidv4 } from 'uuid';
import { ResponseMessage } from '../../api/models/ResponseMessage.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const loginRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API endpoints for user authentication
 */


/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
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
 *             example:
 *               username: UserName
 *               password: Password
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       '400':
 *         description: Invalid credentials
 */
loginRoutes.post('/login', async (req, res) => {
  try {
      const { username, password } = req.body;
      setCommonHeaders(res);

      // Find the user in organizationsUsersMap by username
      let foundUser = null;
      for (const user of organizationsUsersMap.values()) {
          if (user.username === username) {
              foundUser = user;
              break;
          }
      }

      // If user with the given username is not found
      if (foundUser) {
        // Update the lastLoggedInTime of the found user
        foundUser.lastLoggedInTime = new Date(); // Or set to your desired time
        console.log(`Updated lastLogged for user: ${foundUser.username}`);
    } else {
        console.log('User not found.');
    }

      // Check if password matches
      const isMatch = await bcrypt.compare(password, foundUser.password);
      console.log('foundUser',foundUser);
      console.log('foundUser.password',foundUser.password);
      console.log('received pass',`${await bcrypt.hash(password, 10)}`);
      console.log('received pass',password);
      
      if (!isMatch) {
          return res.status(400).send('Invalid credentials');
      }

      
      // Generate JWT token
      const secret = process.env.JWT_SECRET ;
      const token = jwt.sign({ userId: foundUser.id, name: username , organizationId : foundUser.organizationId }, secret, { expiresIn: '1h' });
      // Return token as response
      res.send({ "status": "success", "token": token });
  } catch (error) {
    console.log(error);
      res.status(400).send(error.message);
  }
});

export default loginRoutes;
