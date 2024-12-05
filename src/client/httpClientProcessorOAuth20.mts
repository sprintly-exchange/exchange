import axios from 'axios';
import { CommonFunctions } from '../api/models/CommonFunctions.mjs';

export class HttpClientProcessorOAuth20 {
  connectionName;
  host;
  port;
  protocol;
  basePath;
  contentType;
  accept;
  method;
  clientId;
  clientSecret;
  accessTokenUrl;
  refreshTokenUrl;
  scope;
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
      clientId,
      clientSecret,
      accessTokenUrl,
      refreshTokenUrl,
      scope,
    } = config;

    this.connectionName = connectionName;
    this.host = host;
    this.port = port;
    this.protocol = protocol;
    this.basePath = basePath;
    this.contentType = contentType;
    this.accept = Accept;
    this.method = method;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessTokenUrl = accessTokenUrl;
    this.refreshTokenUrl = refreshTokenUrl;
    this.scope = scope;

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
      CommonFunctions.logWithTimestamp('Error making HTTP request:', error.message);
      throw error;
    }
  }

  async getAccessToken() {
    try {
      const tokenResponse = await axios.post(this.accessTokenUrl, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
        scope: this.scope,
      });
      return tokenResponse.data.access_token;
    } catch (error:any) {
      CommonFunctions.logWithTimestamp('Error fetching access token:', error.message);
      throw error;
    }
  }

  async refreshToken(refreshToken:any) {
    try {
      const tokenResponse = await axios.post(this.refreshTokenUrl, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });
      return tokenResponse.data.access_token;
    } catch (error:any) {
      CommonFunctions.logWithTimestamp('Error refreshing token:', error.message);
      throw error;
    }
  }

  async makeAuthenticatedRequest(url:string, method:string, data:any) {
    try {
      let accessToken = await this.getAccessToken();
      const headers = {
        'Content-Type': this.contentType,
        Accept: this.accept,
        Authorization: `Bearer ${accessToken}`,
      };
      return await this.makeHttpRequest(url, method, headers, data);
    } catch (error:any) {
      CommonFunctions.logWithTimestamp('Error making authenticated request:', error.message);
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
      CommonFunctions.logWithTimestamp('Error in main function:', error.message);
    }
  }
}

/*
// Example usage
const httpClient = new HttpClient(httpRecordTypeOAuth2);
httpClient.main();
*/
