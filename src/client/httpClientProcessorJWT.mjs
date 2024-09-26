import axios from 'axios';
import { httpRecordTypeJWTAuth } from './protocolTemplates.mjs'; // Adjust path as per your structure

export class httpClientProcessorJWT {
  constructor(config) {
    const {
      connectionName,
      host,
      port,
      protocol,
      basePath,
      headers: {
        'Content-Type': contentType,
        Accept,
      },
      method,
      userName,
      password,
    } = config;

    this.connectionName = connectionName;
    this.host = host;
    this.port = port;
    this.protocol = protocol;
    this.basePath = basePath;
    this.contentType = contentType;
    this.accept = Accept;
    this.method = method;
    this.userName = userName;
    this.password = password;

    this.apiUrl = `${protocol}://${host}:${port}${basePath}`;
  }

  async makeHttpRequest(url, method, headers, data) {
    try {
      const response = await axios({
        url,
        method,
        headers,
        data,
      });
      return response.data;
    } catch (error) {
      console.error('Error making HTTP request:', error.message);
      throw error;
    }
  }

  async getAuthToken(username, password) {
    try {
      // Example: Fetch token from authentication service
      const authResponse = await axios.post(`${this.apiUrl}/auth/login`, {
        username,
        password,
      });
      return authResponse.data.token;
    } catch (error) {
      console.error('Error fetching auth token:', error.message);
      throw error;
    }
  }

  async makeAuthenticatedRequest(url, method, data) {
    try {
      const token = await this.getAuthToken(this.userName, this.password);
      const headers = {
        'Content-Type': this.contentType,
        Accept: this.accept,
        Authorization: `Bearer ${token}`,
      };
      return await this.makeHttpRequest(url, method, headers, data);
    } catch (error) {
      console.error('Error making authenticated request:', error.message);
      throw error;
    }
  }


  async main() {
    try {
      const data = {
        // Data to be sent in the request body
      };
      const response = await this.makeAuthenticatedRequest(this.apiUrl, this.method, data);
      console.log('Response:', response);
    } catch (error) {
      console.error('Error in main function:', error.message);
    }
  }
}

/*
// Example usage
const httpClient = new HttpClient(httpRecordTypeJWTAuth);
httpClient.main();
*/

