  export const noAuthTemplate = {
    "connectionName": "Connection Name",
    "host": "https://hostname",
    "port": 443,
    "protocol": "HTTP",
    "retryInterval": 0,
    "retryAttemps": 0,
    "authenticationType": "noAuth",
    "basePath": "/basepath",
    "headers.Content-Type": "application/json",
    "headers.Accept": "application/json",
    "method": "POST"
  };


  export const basicAuthTemplate = {
    "connectionName": "Connection Name",
    "host": "https://hostname",
    "port": 443,
    "protocol": "HTTP",
    "retryInterval": 0,
    "retryAttemps": 0,
    "authenticationType": "noAuth",
    "basePath": "/basepath",
    "headers.Content-Type": "application/json",
    "headers.Accept": "application/json",
    "method": "POST",
    "userName": "User Name",
    "password": "password",
  };
  

  export const jwtTemplate = {
    "connectionName": "Connection Name",
    "host": "https://hostname",
    "port": 443,
    "protocol": "HTTP",
    "retryInterval": 0,
    "retryAttemps": 0,
    "authenticationType": "JWT",
    "basePath": "/basepath",
    "headers.Content-Type": "application/json",
    "headers.Accept": "application/json",
    "method": "POST",
    "jwtToken": "your-jwt-token",
};

export const oAuth2Template = {
  "connectionName": "Connection Name",
  "host": "https://hostname",
  "port": 443,
  "protocol": "HTTP",
  "retryInterval": 0,
  "retryAttemps": 0,
  "authenticationType": "OAuth2.0",
  "basePath": "/basepath",
  "headers.Content-Type": "application/json",
  "headers.Accept": "application/json",
  "method": "POST",
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "tokenUrl": "https://authorization-server.com/token",
  "scope": "your-scope",
  "grantType": "client_credentials", // or other grant types like "authorization_code", "password", etc.
  "accessToken": "your-access-token",
  "refreshToken": "your-refresh-token" // optional, if using refresh tokens
};

export const openIDConnectTemplate = {
  "connectionName": "Connection Name",
  "host": "https://hostname",
  "port": 443,
  "protocol": "HTTP",
  "retryInterval": 0,
  "retryAttempts": 0,
  "authenticationType": "openidConnect",
  "basePath": "/basepath",
  "headers.Content-Type": "application/json",
  "headers.Accept": "application/json",
  "method": "POST",
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "authUrl": "https://authserver.com/auth", // Authorization server URL
  "tokenUrl": "https://authserver.com/token", // Token endpoint URL
  "redirectUri": "https://yourapp.com/callback", // Redirect URI for your application
  "scope": "openid profile email", // Scopes to request
  "grantType": "authorization_code", // Grant type to use
  "code": "authorization-code", // Authorization code received from auth server (for token request)
  "refreshToken": "refresh-token", // Refresh token (if applicable)
  "idToken": "id-token", // ID token (if applicable)
  "accessToken": "access-token" // Access token (if applicable)
};


export const ftpTemplate = {
    "connectionName": "Connection Name",
    "host": "ftp.hostname.com",
    "port": 21,
    "protocol": "FTP",
    "retryInterval": 0,
    "retryAttempts": 0,
    "authenticationType": "basicAuth", // or "anonymous"
    "userName": "User Name",
    "password": "password",
    "remotePath": "/remote/path",
    "localPath": "/local/path",
    "secure": false, // Set to true for FTPS
    "passive": true, // Use passive mode if needed
    "timeout": 30000 // Timeout in milliseconds
};
export const kafkaTemplate = {
    "connectionName": "Connection Name",
    "brokers": ["broker1:9092", "broker2:9092"], // List of Kafka brokers
    "protocol": "SASL_SSL", // Options can be PLAINTEXT, SSL, SASL_PLAINTEXT, SASL_SSL
    "retryInterval": 0,
    "retryAttempts": 0,
    "authenticationType": "SASL_PLAIN", // Options can be PLAIN, SCRAM-SHA-256, SCRAM-SHA-512, OAUTHBEARER
    "topic": "your-topic",
    "groupId": "your-group-id", // Consumer group ID
    "clientId": "your-client-id",
    "securityProtocol": "SASL_SSL", // Options can be PLAINTEXT, SSL, SASL_PLAINTEXT, SASL_SSL
    "saslMechanism": "PLAIN", // Options can be PLAIN, SCRAM-SHA-256, SCRAM-SHA-512, OAUTHBEARER
    "saslUsername": "your-username",
    "saslPassword": "your-password",
    "schemaRegistryUrl": "https://schema-registry:8081", // URL of the schema registry
    "schemaRegistryUser": "your-schema-registry-username",
    "schemaRegistryPassword": "your-schema-registry-password"
};
export const sftpTemplate = {
    "connectionName": "Connection Name",
    "host": "sftp.hostname.com",
    "port": 22,
    "protocol": "SFTP",
    "retryInterval": 0,
    "retryAttempts": 0,
    "authenticationType": "password", // or "key"
    "userName": "User Name",
    "password": "password", // Only if using password authentication
    "privateKey": "/path/to/private/key", // Only if using key authentication
    "passphrase": "passphrase", // Only if the private key has a passphrase
    "remotePath": "/remote/path",
    "localPath": "/local/path",
    "secure": true, // SFTP is inherently secure
    "timeout": 30000, // Timeout in milliseconds
    "knownHosts": "/path/to/known/hosts", // Optional path to known hosts file
    "keepAliveInterval": 10000 // Interval in milliseconds to send keep-alive packets
};
export const websocketTemplate = {
    "connectionName": "Connection Name",
    "host": "wss://hostname",
    "port": 443,
    "protocol": "WebSocket",
    "retryInterval": 5000,
    "retryAttempts": 3,
    "basePath": "/basepath",
    "headers": {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": "Bearer your_token_here" // If authentication is required
    },
    "secure": true, // Set to true for wss (WebSocket Secure)
    "keepAliveInterval": 30000, // Interval in milliseconds to send keep-alive messages
    "subProtocols": ["protocol1", "protocol2"], // Array of sub-protocols
    "pingInterval": 10000, // Interval in milliseconds to send ping messages
    "reconnectOnClose": true, // Automatically try to reconnect on connection close
    "messageFormat": "json", // Format of the messages (json, text, binary)
    "timeout": 60000 // Timeout in milliseconds
};




