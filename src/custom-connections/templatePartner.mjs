import {axiosInstance} from '../api/utilities/axiosConfig.mjs';

export class TemplatePartner {
    transactionProcessorDelivery(transactionProcessManagerInput){
        let templatePartnerUrl;
        //console.log('transactionProcessManagerInput.configDelivery.',transactionProcessManagerInput.configDelivery);
        
        const env = transactionProcessManagerInput.configDelivery.environment;
        switch (env){
            case 'TEST' || 'Test':{
                templatePartnerUrl = 'https:/partner.test';
                break;
            }
            case 'PRODUCTION':{
                templatePartnerUrl = 'https://partner.live';
                break;
            }
            default: {
                break;
            }
        }

        axiosInstance.post(
            {
                method: 'post',
                url: templatePartnerUrl,
                data: transactionProcessManagerInput.transaction.message,
                headers : {
                    ApiKey: transactionProcessManagerInput.configDelivery.apiKey,
                    Secret : transactionProcessManagerInput.configDelivery.apiSecret
                }
            }
        )
        .then((response) => {
            transactionProcessManagerInput.transaction.message = response.data;
            transactionProcessManagerInput.transaction.deliveryStatus = 'SUCEESS';
        })
        .catch((error) => {
            transactionProcessManagerInput.transaction.deliveryStatus = 'FALED';
        });
        
        return true;
    }
}
