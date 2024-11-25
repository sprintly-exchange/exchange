
import Queue from "./api/system/Queue.mjs";
import { FileStorage } from "./api/models/FileStorage.mjs";
import { ConfigurationProcessor } from "./api/configurationProcessor/configurationProcessor.mjs";
import ConfigurationFileStorage from "./api/configurationProcessor/ConfigurationFileStorage.mjs";

class GlobalConfiguration {
    public static configurationPickupMap: Map<string, any> = new Map();
    public static configurationDeliveryMap: Map<string, any> = new Map();
    public static configurationFlowMap: Map<string, any> = new Map();
    public static transactonsStatisticsMap: Map<string, any> = new Map();
    public static forntEndConfigurationMap: Map<string, any> = new Map();
    public static configurationProcessingMap: Map<string, any> = new Map();
    public static demoModeEnabledMap: Map<string, any> = new Map();
    public static serverConfigurationMap: Map<string, any> = new Map();
    public static organizationsMap: Map<string, any> = new Map();
    public static organizationsUsersMap: Map<string, any> = new Map();
    public static organizationsRolesMapNew: Map<string, any> = new Map();
    public static storage = new FileStorage('FS');

    public static configurationProcessingQueue  = new Queue([]);
    public static pickupProcessingQueue = new Queue([]);
    public static deliveryProcessingQueue = new  Queue([]);

    public static configruationProcessor = new ConfigurationProcessor();
    public static storageConfiguration:ConfigurationFileStorage = new ConfigurationFileStorage('FS',process.env.CONFIG_STORAGE_DIR,);

    public static googleUserCreationStatus:any = {};
}

export default GlobalConfiguration;
