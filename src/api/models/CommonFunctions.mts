

export  class CommonFunctions {
    static logWithTimestamp(...args:any){
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}]`, ...args);
    }
    static logErrorWithTimestamp(...args:any){
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}]`, ...args);
    }
    static logWarningWithTimestamp(...args:any){
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}]`, ...args);
    }
    static logFatalWithTimestamp(...args:any){
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}]`, ...args);
    }
};