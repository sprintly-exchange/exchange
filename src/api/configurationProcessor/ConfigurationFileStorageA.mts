import ConfigurationFileStorageI from './ConfigurationFileStorageI.mjs'

export default abstract class ConfigurationFileStorageA implements ConfigurationFileStorageI{
    constructor(){
    }
    abstract saveStaticFile(filename:string, data:any):any;
    abstract loadStaticFile(filename: string):any;
}