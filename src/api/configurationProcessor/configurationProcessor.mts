import GlobalConfiguration from "../../GlobalConfiguration.mjs";

export class ConfigurationProcessor {
  async saveConfigurations() {
    const userConfigurations = {
        organizationsMap: this.mapToJson(GlobalConfiguration.organizationsMap),
        organizationsUsersMap: this.mapToJson(GlobalConfiguration.organizationsUsersMap),
        organizationsRolesMap: this.mapToJson(GlobalConfiguration.organizationsRolesMap),
        forntEndConfigurationMap: this.mapToJson(GlobalConfiguration.frontEndConfigurationMap),
      };

      await GlobalConfiguration.storageConfiguration.saveStaticFile('User_Configurations.json', JSON.stringify(userConfigurations));

      //configurationPickupMap config
      const configurationPickupMap = {
        configurationPickupMap: this.mapToJson(GlobalConfiguration.configurationPickupMap),
      };
      await GlobalConfiguration.storageConfiguration.saveStaticFile('configurationPickupMap.json', JSON.stringify(configurationPickupMap));

      //configurationProcessingMap config
      const configurationProcessingMap = {
        configurationProcessingMap: this.mapToJson(GlobalConfiguration.configurationProcessingMap),
      };
      await GlobalConfiguration.storageConfiguration.saveStaticFile('configurationProcessingMap.json', JSON.stringify(configurationProcessingMap));
      
       //configurationDeliveryMap config
       const configurationDeliveryMap = {
        configurationDeliveryMap: this.mapToJson(GlobalConfiguration.configurationDeliveryMap),
      };
      await GlobalConfiguration.storageConfiguration.saveStaticFile('configurationDeliveryMap.json', JSON.stringify(configurationDeliveryMap));
      
      //configurationFlowMap config
      const configurationFlowMap = {
        configurationFlowMap: this.mapToJson(GlobalConfiguration.configurationFlowMap),
      };
      await GlobalConfiguration.storageConfiguration.saveStaticFile('configurationFlowMap.json', JSON.stringify(configurationFlowMap));
      
      //demoModeEnabledMap config
      const demoModeEnabledMap = {
        demoModeEnabledMap: this.mapToJson(GlobalConfiguration.demoModeEnabledMap),
      };
      await GlobalConfiguration.storageConfiguration.saveStaticFile('demoModeEnabledMap.json', JSON.stringify(demoModeEnabledMap));

      //demoModeEnabledMap config
      const serverConfigurationMap = {
        serverConfigurationMap: this.mapToJson(GlobalConfiguration.serverConfigurationMap),
      };
      await GlobalConfiguration.storageConfiguration.saveStaticFile('serverConfigurationMap.json', JSON.stringify(serverConfigurationMap));


      const dataTransactions = {
          transactonsStatisticsMap: this.mapToJson(GlobalConfiguration.transactionsStatisticsMap),
      };
      await GlobalConfiguration.storageConfiguration.saveStaticFile('Transactions.json',JSON.stringify(dataTransactions));
  }

  async loadConfigurations() {
        try {
            const userConfigurations = JSON.parse(await GlobalConfiguration.storageConfiguration.loadStaticFile('User_Configurations.json'));
            GlobalConfiguration.organizationsMap = this.jsonToMap(userConfigurations.organizationsMap);
            GlobalConfiguration.organizationsUsersMap = this.jsonToMap(userConfigurations.organizationsUsersMap);
            GlobalConfiguration.organizationsRolesMap = this.jsonToMap(userConfigurations.organizationsRolesMap);
            GlobalConfiguration.frontEndConfigurationMap = this.jsonToMap(userConfigurations.forntEndConfigurationMap);
        } catch (error:any) {
            console.log('userConfigurations not found for loading.');
        }

      try {
          const configurationPickupMap = JSON.parse(await GlobalConfiguration.storageConfiguration.loadStaticFile('configurationPickupMap.json'));
          GlobalConfiguration.configurationPickupMap = this.jsonToMap(configurationPickupMap.configurationPickupMap);

          const configurationDeliveryMap = JSON.parse(await GlobalConfiguration.storageConfiguration.loadStaticFile('configurationDeliveryMap.json'));
          GlobalConfiguration.configurationDeliveryMap = this.jsonToMap(configurationDeliveryMap.configurationDeliveryMap);

          const configurationProcessingMap = JSON.parse(await GlobalConfiguration.storageConfiguration.loadStaticFile('configurationProcessingMap.json'));
          GlobalConfiguration.configurationProcessingMap = this.jsonToMap(configurationProcessingMap.configurationProcessingMap);

          const configurationFlowMap = JSON.parse(await GlobalConfiguration.storageConfiguration.loadStaticFile('configurationFlowMap.json'));
          GlobalConfiguration.configurationFlowMap = this.jsonToMap(configurationFlowMap.configurationFlowMap);

          const demoModeEnabledMap = JSON.parse(await GlobalConfiguration.storageConfiguration.loadStaticFile('demoModeEnabledMap.json'));
          GlobalConfiguration.demoModeEnabledMap = this.jsonToMap(demoModeEnabledMap.demoModeEnabledMap);

          const serverConfigurationMap = JSON.parse(await GlobalConfiguration.storageConfiguration.loadStaticFile('serverConfigurationMap.json'));
          GlobalConfiguration.serverConfigurationMap = this.jsonToMap(serverConfigurationMap.serverConfigurationMap);
          // Iterate over the Map and print all key-value pairs
          //Loaded server configuration settings
          console.log('Loaded server configruation settings.');
          GlobalConfiguration.serverConfigurationMap.forEach((value, key) => {
          console.log(`Key: ${key}, Value: ${value}`);
});

      } catch (error:any) {
          console.log(error);
          console.log('dataConfigurations not found for loading.');
      }
    
      try {
          const dataTransactions = JSON.parse(await GlobalConfiguration.storageConfiguration.loadStaticFile('Transactions.json'));
          GlobalConfiguration.transactionsStatisticsMap = this.jsonToMap(dataTransactions.transactonsStatisticsMap);
      } catch (error:any) {
          console.log('dataTransactions not found for loading.');
      }
  }

  mapToJson(map: Map<string, any>): string {
    return JSON.stringify([...map]);
}

  jsonToMap(jsonStr: string): Map<string, any> {
      return new Map<string, any>(JSON.parse(jsonStr));
  }
}
