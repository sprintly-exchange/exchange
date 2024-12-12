import { v4 as uuidv4 } from 'uuid';
import { FileStorage } from './FileStorage.mjs';
import { CommonFunctions } from '../models/CommonFunctions.mjs';
import { StorageType } from './StorageType';
import { TransactionMessageStorageA } from './TransactionMessageStorageA.mjs';

export class TransactionMessageStorage extends TransactionMessageStorageA {
    _id:string;
    _messageStorage;

    constructor(storageType:StorageType) {
        super();
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
                CommonFunctions.logWithTimestamp("Storage type not defined, current supported type is FS (file system)");
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
    async storeMessage(value:any): Promise<[string, number]>{
        if (value === undefined) 
            return ['', 0];
        
        const messageSize = Buffer.byteLength(value, 'utf-8');
        const messagePath = await this._messageStorage.storeMessage(value);
        CommonFunctions.logWithTimestamp("Setting message path", messagePath);
        CommonFunctions.logWithTimestamp("Setting message size", messageSize);
        return [messagePath, messageSize];
    }

    // Get methods
    async getMessage(id:string):Promise<string|undefined> {
        CommonFunctions.logWithTimestamp("Reading file from id:", id);
        return await this._messageStorage.getMessage(id);
    }
}
