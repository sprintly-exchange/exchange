import Queue from "./api/system/Queue.mjs";
import { FileStorage } from "./api/models/FileStorage.mjs";
import { ConfigurationProcessor } from "./api/configurationProcessor/configurationProcessor.mjs";
import ConfigurationFileStorage from "./api/configurationProcessor/ConfigurationFileStorage.mjs";

class GlobalConfiguration {
    public static configurationPickupMap: Map<string, any> = new Map();
    public static configurationDeliveryMap: Map<string, any> = new Map();
    public static configurationFlowMap: Map<string, any> = new Map();
    public static transactionsStatisticsMap: Map<string, any> = new Map(); // Fixed typo
    public static frontEndConfigurationMap: Map<string, any> = new Map(); // Fixed typo
    public static configurationProcessingMap: Map<string, any> = new Map();
    public static demoModeEnabledMap: Map<string, any> = new Map();
    public static serverConfigurationMap: Map<string, any> = new Map();
    public static organizationsMap: Map<string, any> = new Map();
    public static organizationsUsersMap: Map<string, any> = new Map();
    public static organizationsRolesMapNew: Map<string, any> = new Map();
    public static storage: FileStorage = new FileStorage('FS');

    public static configurationProcessingQueue: Queue = new Queue([]);
    public static pickupProcessingQueue: Queue = new Queue([]);
    public static deliveryProcessingQueue: Queue = new Queue([]);

    public static configurationProcessor: ConfigurationProcessor = new ConfigurationProcessor(); // Fixed typo

    public static storageConfiguration: ConfigurationFileStorage = new ConfigurationFileStorage('FS');

    public static googleUserCreationStatus: Record<string, any> = {}; // More specific typing

   public static appEnumerations = Object.freeze({
        APP_DEFAULT_ORGANIZATION_NAME: 'Default Organization',
        APP_DEFAULT_ROLE_ADMIN: 'Admin',
        APP_DEFAULT_ROLE_ORGANIZATION_USER: 'Organization User',
        APP_DEFAULT_ROLE_ORGANIZATION_ADMIN: 'Organization Admin',
        APP_DEFAULT_ADMIN_NAME: 'Admin',  
        TRANSACTION_STATUS_COMPLETED: 'COMPLETED',
        TRANSACTION_STATUS_FAILED: 'FAILED',
        TRANSACTION_STATUS_INPROCESSING: 'INPROCESSING',
        TRANSACTION_STATUS_PROCESSING_DELIVERY: 'PROCESSING_DELIVERY',
        TRANSACTION_STATUS_PROCESSING_PICKUP: 'PROCESSING_PICKUP',
        TRANSACTION_STATUS_PROCESSING_CONFIGURATIONS: 'PROCESSING_CONFIGURATIONS',
        TRANSACTION_STATUS_SUCCESS: 'SUCCESS',
        PROCESS_RULES_TIME_INTERVAL : 'PROCESS_RULES_TIME_INTERVAL',
        PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL: 'PROCESS_PICKUP_PROCESSING_QUEUE_TIME_INTERVAL',
        PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL: 'PROCESS_DELIVERY_PROCESSING_QUEUE_TIME_INTERVAL',
        PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL: 'PROCESS_CONFIGURATION_PROCESSING_QUEUE_TIME_INTERVAL',
        REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL: 'REMOVE_OLD_TRANSACTIONS_TIME_INTERVAL',
        REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS: 'REMOVE_OLD_TRANSACTIONS_ARCHIVE_DAYS',
        FTP_PICKUP_MAX_FILE_DOWNLOAD_LIST_LIMIT_PER_SESSION: 'FTP_PICKUP_MAX_FILE_DOWNLOAD_LIST_LIMIT_PER_SESSION',
        STORAGE_PICKUP_INBOUND_MESSAGE:'PIM',
        STORAGE_PICKUP_OUTBOUND_MESSAGE:'POM',
        STORAGE_DELIVERY_INBOUND_MESSAGE:'DIM',
        STORAGE_DELIVERY_OUTBOUND_MESSAGE:'DOM'
      });
}

export default GlobalConfiguration;
