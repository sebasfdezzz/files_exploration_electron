const { exec } = require('child_process');

// Function to execute terminal command and return result as a Promise
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// Function to get system architecture
async function getArchitecture() {
  try {
    const architecture = await executeCommand('uname -m');
    return architecture;
  } catch (error) {
    console.error('Error getting architecture:', error);
    return null;
  }
}

// Function to get disk space information
async function getDiskSpace() {
  try {
    const diskSpace = await executeCommand('df -h');
    return diskSpace;
  } catch (error) {
    console.error('Error getting disk space:', error);
    return null;
  }
}

// Function to get total RAM
async function getTotalRAM() {
  try {
    const totalRAM = await executeCommand('free -h | grep "Mem:" | awk \'{ print $2 }\'');
    return totalRAM;
  } catch (error) {
    console.error('Error getting total RAM:', error);
    return null;
  }
}

// Function to get system model
async function getSystemModel() {
  try {
    const systemModel = await executeCommand('sudo dmidecode -s system-product-name');
    return systemModel;
  } catch (error) {
    console.error('Error getting system model:', error);
    return null;
  }
}

// Function to get system owner
async function getSystemOwner() {
  try {
    const systemOwner = await executeCommand('whoami');
    return systemOwner;
  } catch (error) {
    console.error('Error getting system owner:', error);
    return null;
  }
}

async function getSystemInfo() {
    const architecture = await getArchitecture();
    const diskSpace = await getDiskSpace();
    const totalRAM = await getTotalRAM();
    const systemModel = await getSystemModel();
    const systemOwner = await getSystemOwner();
  
    return {
      architecture,
      diskSpace,
      totalRAM,
      systemModel,
      systemOwner
    };
}





module.exports = { getSystemInfo };
