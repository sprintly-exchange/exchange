export  class CommonFunctions {
    static logWithTimestamp(...args:any){
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}]`, ...args);
    }
};