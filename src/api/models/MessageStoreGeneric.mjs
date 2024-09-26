import { v4 as uuidv4 } from 'uuid';
import { FileStorage } from './FileStorage.mjs';

export class MessageStoreGeneric {
    _id;
    _messageStorage;

    constructor(storageType) {
        this.id = uuidv4();
        switch (storageType) {
            case 'FS': {
                this._messageStorage = new FileStorage('FS');
                this._messageStorage.storageLocation = '/tmp';
                console.log("Setting storage type to FS");
                break;
            }
            default: {
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
    async storeMessage(value) {
        if (value === undefined) 
            return ['', 0];
        
        const messageSize = Buffer.byteLength(value, 'utf-8');
        const messagePath = await this._messageStorage.storeMessage(value);
        console.log("Setting message path", messagePath);
        console.log("Setting message size", messageSize);
        return [messagePath, messageSize];
    }

    // Get methods
    async getMessage(id) {
        console.debug("Reading file from id:", id);
        return await this._messageStorage.getMessage(id);
    }
}
