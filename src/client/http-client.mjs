import axios from 'axios';

export class HTTPClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.client = axios.create({ baseURL });
    }

    async get(endpoint, headers) {
        try {
            const response = await this.client.get(endpoint, { headers });

            // Determine the response type based on the Content-Type header
            const contentType = response.headers['content-type'];
            let data;
            if (contentType.includes('application/json')) {
                data = response.data;
            } else if (contentType.includes('text')) {
                data = response.data;
            } else {
                data = new Blob([response.data]);
            }

            return [JSON.stringify(data), response.status];
        } catch (error) {
            //console.log('error', error);
            if (error.response) {
                return [undefined, error.response.status];
            }
            return false;
        }
    }

    async post(endpoint, sendData, headers) {
        try {
            const response = await this.client.post(endpoint, sendData, { headers });

            // Determine the response type based on the Content-Type header
            const contentType = response.headers['content-type'];
            let data;
            if (contentType.includes('application/json')) {
                data = response.data;
            } else if (contentType.includes('text')) {
                data = response.data;
            } else {
                data = new Blob([response.data]);
            }

            return [JSON.stringify(data), response.status];
        } catch (error) {
            //disabled the logging to remove uncessary http logs when there is an error
            //console.log('error', error);
            if (error.response) {
                return [undefined, error.response.status];
            }
            return false;
        }
    }

    async delete(endpoint, headers) {
        try {
            const response = await this.client.delete(endpoint, { headers });

            // Determine the response type based on the Content-Type header
            const contentType = response.headers['content-type'];
            let data;
            if (contentType.includes('application/json')) {
                data = response.data;
            } else if (contentType.includes('text')) {
                data = response.data;
            } else {
                data = new Blob([response.data]);
            }

            return [JSON.stringify(data), response.status];
        } catch (error) {
            //console.log('error', error);
            if (error.response) {
                return [undefined, error.response.status];
            }
            return false;
        }
    }

    async put(endpoint, sendData, headers) {
        try {
            const response = await this.client.put(endpoint, sendData, { headers });

            // Determine the response type based on the Content-Type header
            const contentType = response.headers['content-type'];
            let data;
            if (contentType.includes('application/json')) {
                data = response.data;
            } else if (contentType.includes('text')) {
                data = response.data;
            } else {
                data = new Blob([response.data]);
            }

            return [JSON.stringify(data), response.status];
        } catch (error) {
            //console.log('error', error);
            if (error.response) {
                return [undefined, error.response.status];
            }
            return false;
        }
    }
}
