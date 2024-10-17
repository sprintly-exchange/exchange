export class ConfigurationProcessor {
  async saveConfigurations() {
    const userConfigurations = {
        organizationsMap: this.mapToJson(global.organizationsMap),
        organizationsUsersMap: this.mapToJson(global.organizationsUsersMap),
        organizationsRolesMapNew: this.mapToJson(global.organizationsRolesMapNew),
        forntEndConfigurationMap: this.mapToJson(global.forntEndConfigurationMap),
      };

      await global.storageConfiguration.saveStaticFile('User_Configurations.json', JSON.stringify(userConfigurations));

      //configurationPickupMap config
      const configurationPickupMap = {
        configurationPickupMap: this.mapToJson(global.configurationPickupMap),
      };
      await global.storageConfiguration.saveStaticFile('configurationPickupMap.json', JSON.stringify(configurationPickupMap));

      //configurationProcessingMap config
      const configurationProcessingMap = {
        configurationProcessingMap: this.mapToJson(global.configurationProcessingMap),
      };
      await global.storageConfiguration.saveStaticFile('configurationProcessingMap.json', JSON.stringify(configurationProcessingMap));
      
       //configurationDeliveryMap config
       const configurationDeliveryMap = {
        configurationDeliveryMap: this.mapToJson(global.configurationDeliveryMap),
      };
      await global.storageConfiguration.saveStaticFile('configurationDeliveryMap.json', JSON.stringify(configurationDeliveryMap));
      
      //configurationFlowMap config
      const configurationFlowMap = {
        configurationFlowMap: this.mapToJson(global.configurationFlowMap),
      };
      await global.storageConfiguration.saveStaticFile('configurationFlowMap.json', JSON.stringify(configurationFlowMap));
      
      //demoModeEnabledMap config
      const demoModeEnabledMap = {
        demoModeEnabledMap: this.mapToJson(global.demoModeEnabledMap),
      };
      await global.storageConfiguration.saveStaticFile('demoModeEnabledMap.json', JSON.stringify(demoModeEnabledMap));

      //demoModeEnabledMap config
      const serverConfigurationMap = {
        serverConfigurationMap: this.mapToJson(global.serverConfigurationMap),
      };
      await global.storageConfiguration.saveStaticFile('serverConfigurationMap.json', JSON.stringify(serverConfigurationMap));


      const dataTransactions = {
          transactonsStatisticsMap: this.mapToJson(global.transactonsStatisticsMap),
      };
      await global.storageConfiguration.saveStaticFile('Transactions.json',JSON.stringify(dataTransactions));
  }

  async loadConfigurations() {
        try {
            const userConfigurations = JSON.parse(await global.storageConfiguration.loadStaticFile('User_Configurations.json'));
            global.organizationsMap = this.jsonToMap(userConfigurations.organizationsMap);
            global.organizationsUsersMap = this.jsonToMap(userConfigurations.organizationsUsersMap);
            global.organizationsRolesMapNew = this.jsonToMap(userConfigurations.organizationsRolesMapNew);
            global.forntEndConfigurationMap = this.jsonToMap(userConfigurations.forntEndConfigurationMap);
        } catch (error) {
            console.log('userConfigurations not found for loading.');
        }

      try {
          const configurationPickupMap = JSON.parse(await global.storageConfiguration.loadStaticFile('configurationPickupMap.json'));
          global.configurationPickupMap = this.jsonToMap(configurationPickupMap.configurationPickupMap);

          const configurationDeliveryMap = JSON.parse(await global.storageConfiguration.loadStaticFile('configurationDeliveryMap.json'));
          global.configurationDeliveryMap = this.jsonToMap(configurationDeliveryMap.configurationDeliveryMap);

          const configurationProcessingMap = JSON.parse(await global.storageConfiguration.loadStaticFile('configurationProcessingMap.json'));
          global.configurationProcessingMap = this.jsonToMap(configurationProcessingMap.configurationProcessingMap);

          const configurationFlowMap = JSON.parse(await global.storageConfiguration.loadStaticFile('configurationFlowMap.json'));
          global.configurationFlowMap = this.jsonToMap(configurationFlowMap.configurationFlowMap);

          const demoModeEnabledMap = JSON.parse(await global.storageConfiguration.loadStaticFile('demoModeEnabledMap.json'));
          global.demoModeEnabledMap = this.jsonToMap(demoModeEnabledMap.demoModeEnabledMap);

          const serverConfigurationMap = JSON.parse(await global.storageConfiguration.loadStaticFile('serverConfigurationMap.json'));
          global.serverConfigurationMap = this.jsonToMap(serverConfigurationMap.serverConfigurationMap);
          // Iterate over the Map and print all key-value pairs
          //Loaded server configuration settings
          console.log('Loaded server configruation settings.');
          global.serverConfigurationMap.forEach((value, key) => {
          console.log(`Key: ${key}, Value: ${value}`);
});

      } catch (error) {
          console.log(error);
          console.log('dataConfigurations not found for loading.');
      }
    
      try {
          const dataTransactions = JSON.parse(await global.storageConfiguration.loadStaticFile('Transactions.json'));
          global.transactonsStatisticsMap = this.jsonToMap(dataTransactions.transactonsStatisticsMap);
      } catch (error) {
          console.log('dataTransactions not found for loading.');
      }
  }

  mapToJson(map) {
      return JSON.stringify([...map]);
  }

  jsonToMap(jsonStr) {
      return new Map(JSON.parse(jsonStr));
  }
}
