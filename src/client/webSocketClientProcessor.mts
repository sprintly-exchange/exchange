

import WebSocket from 'ws';
import { CommonFunctions } from '../api/models/CommonFunctions.mjs';


export class WebSocketClientProcessor {
  connectionName;
  host;
  port;
  protocol;
  path;
  contentType;
  accept;
  websocketUrl;
  ws;

  constructor(config:any) {
    const {
      connectionName,
      host,
      port,
      protocol,
      path,
      headers: {
        'Content-Type': contentType,
        Accept,
      },
    } = config;

    this.connectionName = connectionName;
    this.host = host;
    this.port = port;
    this.protocol = protocol;
    this.path = path;
    this.contentType = contentType;
    this.accept = Accept;

    this.websocketUrl = `${protocol}://${host}:${port}${path}`;
    this.ws = new WebSocket(this.websocketUrl, {
      headers: {
        'Content-Type': this.contentType,
        Accept: this.accept,
      },
    });

    this.initializeWebSocket();
  }

  initializeWebSocket() {
    this.ws.on('open', () => {
      CommonFunctions.logWithTimestamp('WebSocket connected');
      this.ws.send(JSON.stringify({ type: 'init', message: 'WebSocket initialized' }));
    });

    this.ws.on('message', (data) => {
      CommonFunctions.logWithTimestamp('Received message:', data);
    });

    this.ws.on('close', () => {
      CommonFunctions.logWithTimestamp('WebSocket disconnected');
    });

    this.ws.on('error', (error:any) => {
      CommonFunctions.logWithTimestamp('WebSocket error:', error.message);
    });
  }

  sendWebSocketData(data:any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not open, data not sent');
    }
  }

  main() {
    try {
      this.sendWebSocketData({ type: 'message', content: 'Hello WebSocket!' });
    } catch (error:any) {
      CommonFunctions.logWithTimestamp('Error in main function:', error.message);
    }
  }
}

/*
// Example usage
const webSocketClient = new WebSocketClient(websocketRecordType);
webSocketClient.main();
*/