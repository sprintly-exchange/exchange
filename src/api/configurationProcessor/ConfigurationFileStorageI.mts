export default interface ConfigurationFileStorageI{
    saveStaticFile(filename:string, data:any):any;
    loadStaticFile(filename:string):any;
}