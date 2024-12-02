import * as fs from 'fs';
import * as path from 'path';

export class FSClient {
  constructor(){

  }

   async readFile(filePath:string) {
    try {
      const data = await fs.readFileSync(filePath, 'utf8');
      return await data;
    } catch (err) {
      console.error('Error reading file:', err);
      return null;
    }
  }

   async writeFile(filePath:string, data:any) {
    try {
      await fs.writeFileSync(filePath, data);
      console.debug('File successfully written.', filePath);
      return true;
    } catch (err) {
      console.error('Error writing file:', err);
      return false;
    }
  }

  async getOldestFile(directoryPath:string) {
    try {
      console.debug(`Reading directory path : ${directoryPath}`);
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
          console.debug(`Setting oldest file: ${file}`);
          oldestFile = file;
          oldestTime = stats.birthtimeMs;
        }
      });
  
      return oldestFile;
    } catch (err) {
      console.error('Error getting oldest file:', err);
      return null;
    }
  }


async  deleteFile(filePath:string) {
  try {
    // Use fs.promises.unlink to delete the file
    await fs.promises.unlink(filePath);
    console.debug('File deleted successfully');
  } catch (err) {
    console.error('Error deleting file:', err);
  }
}

}
