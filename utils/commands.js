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

      // Remove newline characters and extra whitespace
      const cleanedOutput = stdout.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
      resolve(cleanedOutput);
    });
  });
}

function parseSize(sizeStr) {
  // Convert size string with units to bytes
  const sizeUnits = {
      'K': 1024,
      'M': 1024 ** 2,
      'G': 1024 ** 3,
      'T': 1024 ** 4
  };
  const unit = sizeStr.slice(-1);
  const size = parseFloat(sizeStr);
  if (sizeUnits[unit]) {
      return size * sizeUnits[unit];
  } else {
      return size;
  }
}

function cleanBlockDevices(jsonStr) {
  // Remove the slashes from the input JSON string
  const cleanedJsonStr = jsonStr.replace(/\\/g, '');

  // Parse the JSON string into an object
  const data = JSON.parse(cleanedJsonStr);

  // Clean and process the block device information
  const cleanedDevices = data.blockdevices.map(device => ({
      kname: device.kname,
      sizeBytes: device.size
  }));

  return cleanedDevices;
}

function cleanFilesystemInfo(inputStr) {
  const entries = inputStr.trim().split(/\s+/); // Split input string by whitespace

  const cleanedData = [];
  for (let i = 0; i < entries.length; i += 3) {
      const filesystem = entries[i].startsWith('/dev/') ? entries[i].slice(5) : entries[i];
      const size = entries[i + 1];
      const usePercentage = entries[i + 2];
      cleanedData.push({ filesystem, size, usePercentage });
  }

  return cleanedData;
}

async function getSystemInfo() {
  try {
    const disks = await executeCommand('lsblk -n -o KNAME,SIZE -J');
    const cleanedDisks = cleanBlockDevices(disks);
    const diskUsage = await executeCommand('df -h --output=source,size,pcent | grep -v -e loop -e tmp -efi');
    const cleanedDiskUsage = cleanFilesystemInfo(diskUsage);
    // const ram = await executeCommand('free -h');
    // const systemInfo = await executeCommand('sudo dmidecode -t system');

    const systemData = {
      architecture: os.arch(),
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus(),
      disks: cleanedDisks,
      diskUsage: cleanedDiskUsage,
      // ram: ram
      //systemInfo: systemInfo
    };

    // const systemData = {
    //   architecture: "yo",
    //   hostname: "yo",
    //   platform: "yo",
    //   release: "yo",
    //   totalMemory: "yo",
    //   freeMemory: "yo",
    //   cpus:"yo",
    //   disks: "yo",
    //   diskUsage: "yo",
    //   ram: "yo",
    //   systemInfo: "yo"
    // };

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
