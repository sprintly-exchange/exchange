import * as fs from 'fs';
import * as path from 'path';
import { CommonFunctions } from '../api/models/CommonFunctions.mjs';

export class FSClient {
  constructor(){

  }

   async readFile(filePath:string) {
    try {
      const data = await fs.readFileSync(filePath, 'utf8');
      return await data;
    } catch (err) {
      CommonFunctions.logWithTimestamp('Error reading file:', err);
      return null;
    }
  }

   async writeFile(filePath:string, data:any) {
    try {
      await fs.writeFileSync(filePath, data);
      CommonFunctions.logWithTimestamp('File successfully written.', filePath);
      return true;
    } catch (err) {
      CommonFunctions.logWithTimestamp('Error writing file:', err);
      return false;
    }
  }

  async getOldestFile(directoryPath:string) {
    try {
      CommonFunctions.logWithTimestamp(`Reading directory path : ${directoryPath}`);
      // Read the directory contents
      const files = await fs.promises.readdir(directoryPath);
      
      // Filter out directories
      const fileStats = await Promise.all(
        files.map(async file => {
          const filePath = path.join(directoryPath, file);
          const stats = await fs.promises.stat(filePath);
          return { file, stats };
        })
      );
  
      // Find the oldest file
      let oldestFile = null;
      let oldestTime = Number.MAX_SAFE_INTEGER;
      fileStats.forEach(({ file, stats }) => {
        if (stats.isFile() && stats.birthtimeMs < oldestTime) {
          CommonFunctions.logWithTimestamp(`Setting oldest file: ${file}`);
          oldestFile = file;
          oldestTime = stats.birthtimeMs;
        }
      });
  
      return oldestFile;
    } catch (err) {
      CommonFunctions.logWithTimestamp('Error getting oldest file:', err);
      return null;
    }
  }


async  deleteFile(filePath:string) {
  try {
    // Use fs.promises.unlink to delete the file
    await fs.promises.unlink(filePath);
    CommonFunctions.logWithTimestamp('File deleted successfully');
  } catch (err) {
    CommonFunctions.logWithTimestamp('Error deleting file:', err);
  }
}

}
