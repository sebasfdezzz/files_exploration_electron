const { exec } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs').promises;

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        console.log(error);
        return;
      }
      if (stderr) {
        reject(stderr);
        console.log(stderr);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

async function getSystemInfo() {
  try {
    const disks = await executeCommand('lsblk -o NAME,SIZE,TYPE,MOUNTPOINT');
    const diskUsage = await executeCommand('df -h');
    const ram = await executeCommand('free -h');
    const systemInfo = await executeCommand('sudo dmidecode -t system');

    const systemData = {
      architecture: os.arch(),
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus(),
      disks: disks,
      diskUsage: diskUsage,
      ram: ram,
      systemInfo: systemInfo
    };

    return systemData
  } catch (error) {
    return {"ERROR":"Error retrieving System Information"}
  }
}

async function getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const fileType = path.extname(filePath) || (stats.isDirectory() ? 'directory' : 'file');
      const isExecutable = (stats.mode & 0o111) ? true : false;
  
      return {
        file_name: path.basename(filePath),
        file_type: fileType,
        file_size: stats.size,
        absolute_path: path.resolve(filePath),
        is_directory: stats.isDirectory(),
        is_executable: isExecutable
      };
    } catch (error) {
      throw new Error(`Error getting file info: ${error.message}`);
    }
  }
  
  async function execute_ls(directory) {
    try {
      const files = await executeCommand(`ls -A1 "${directory}"`);
      const fileList = files.split('\n');
  
      const fileInfos = await Promise.all(fileList.map(async (file) => {
        const filePath = path.join(directory, file);
        return getFileInfo(filePath);
      }));
  
      return fileInfos;
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return [];
    }
  }

module.exports = { getSystemInfo, execute_ls };
