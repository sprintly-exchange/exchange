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
}

export default GlobalConfiguration;
