import { v4 as uuidv4 } from 'uuid';
import { FileStorage } from './FileStorage.mjs';
import { CommonFunctions } from './CommonFunctions.mjs';

export class MessageStoreGeneric {
    _id:string;
    _messageStorage;

    constructor(storageType:any) {
        this._id = uuidv4();
        switch (storageType) {
            case 'FS': {
                this._messageStorage = new FileStorage('FS');
                this._messageStorage.storageLocation = '/tmp';
                CommonFunctions.logWithTimestamp("Setting storage type to FS");
                break;
            }
            default: {
                this._messageStorage = new FileStorage('FS');
                this._messageStorage.storageLocation = '/tmp';
                CommonFunctions.logWithTimestamp("Setting storage type to FS");
                console.error("Storage type not defined, current supported type is FS (file system)");
            }
        }
    }

    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }

    // Set methods
    async storeMessage(value:any) {
        if (value === undefined) 
            return ['', 0];
        
        const messageSize = Buffer.byteLength(value, 'utf-8');
        const messagePath = await this._messageStorage.storeMessage(value);
        CommonFunctions.logWithTimestamp("Setting message path", messagePath);
        CommonFunctions.logWithTimestamp("Setting message size", messageSize);
        return [messagePath, messageSize];
    }

    // Get methods
    async getMessage(id:string) {
        console.debug("Reading file from id:", id);
        return await this._messageStorage.getMessage(id);
    }
}
