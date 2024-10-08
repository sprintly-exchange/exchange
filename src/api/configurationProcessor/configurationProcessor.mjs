export class ConfigurationProcessor {
  async saveConfigurations() {
    const userConfigurations = {
        organizationsMap: this.mapToJson(global.organizationsMap),
        organizationsUsersMap: this.mapToJson(global.organizationsUsersMap),
        organizationsRolesMapNew: this.mapToJson(global.organizationsRolesMapNew),
        forntEndConfigurationMap: this.mapToJson(global.forntEndConfigurationMap),
      };

      await global.storageConfiguration.saveStaticFile('User_Configurations.json', JSON.stringify(userConfigurations));

      const dataConfigurations = {
        configurationPickupMap: this.mapToJson(global.configurationPickupMap),
        configurationDeliveryMap: this.mapToJson(global.configurationDeliveryMap),
        configurationProcessingMap: this.mapToJson(global.configurationProcessingMap),
        configurationFlowMap: this.mapToJson(global.configurationFlowMap),
        demoModeEnabledMap: this.mapToJson(global.demoModeEnabledMap),
        serverConfigurationMap: this.mapToJson(global.serverConfigurationMap),
      };
    
      await global.storageConfiguration.saveStaticFile('Configurations.json', JSON.stringify(dataConfigurations));

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
          const dataConfigurations = JSON.parse(await global.storageConfiguration.loadStaticFile('Configurations.json'));
          global.configurationPickupMap = this.jsonToMap(dataConfigurations.configurationPickupMap);
          global.configurationDeliveryMap = this.jsonToMap(dataConfigurations.configurationDeliveryMap);
          global.configurationProcessingMap = this.jsonToMap(dataConfigurations.configurationProcessingMap);
          global.configurationFlowMap = this.jsonToMap(dataConfigurations.configurationFlowMap);
          global.demoModeEnabledMap = this.jsonToMap(dataConfigurations.demoModeEnabledMap);
          global.serverConfigurationMap = this.jsonToMap(userConfigurations.serverConfigurationMap);
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
