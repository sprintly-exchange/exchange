import axios from 'axios';
import { CommonFunctions } from '../api/models/CommonFunctions.mjs';

export class httpClientProcessorJWT {
  connectionName;
  host;
  port;
  protocol;
  basePath;
  contentType;
  accept;
  method;
  userName;
  password;
  apiUrl;

  constructor(config:any) {
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

  async makeHttpRequest(url:string, method:string, headers:any, data:any) {
    try {
      const response = await axios({
        url,
        method,
        headers,
        data,
      });
      return response.data;
    } catch (error:any) {
      console.error('Error making HTTP request:', error.message);
      throw error;
    }
  }

  async getAuthToken(username:string, password:string) {
    try {
      // Example: Fetch token from authentication service
      const authResponse = await axios.post(`${this.apiUrl}/auth/login`, {
        username,
        password,
      });
      return authResponse.data.token;
    } catch (error:any) {
      console.error('Error fetching auth token:', error.message);
      throw error;
    }
  }

  async makeAuthenticatedRequest(url:string, method:string, data:any) {
    try {
      const token = await this.getAuthToken(this.userName, this.password);
      const headers = {
        'Content-Type': this.contentType,
        Accept: this.accept,
        Authorization: `Bearer ${token}`,
      };
      return await this.makeHttpRequest(url, method, headers, data);
    } catch (error:any) {
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
      CommonFunctions.logWithTimestamp('Response:', response);
    } catch (error:any) {
      console.error('Error in main function:', error.message);
    }
  }
}

/*
// Example usage
const httpClient = new HttpClient(httpRecordTypeJWTAuth);
httpClient.main();
*/

