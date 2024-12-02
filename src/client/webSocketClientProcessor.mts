

import WebSocket from 'ws';
import { websocketRecordType } from './protocolTemplates.mjs'; // Adjust path as per your structure

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
      console.log('WebSocket connected');
      this.ws.send(JSON.stringify({ type: 'init', message: 'WebSocket initialized' }));
    });

    this.ws.on('message', (data) => {
      console.log('Received message:', data);
    });

    this.ws.on('close', () => {
      console.log('WebSocket disconnected');
    });

    this.ws.on('error', (error:any) => {
      console.error('WebSocket error:', error.message);
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
      console.error('Error in main function:', error.message);
    }
  }
}

/*
// Example usage
const webSocketClient = new WebSocketClient(websocketRecordType);
webSocketClient.main();
*/