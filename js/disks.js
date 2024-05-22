const { exec } = require('child_process');
const { password } = require('../utils/global_values.js');
let chosen_dir = "/";

async function loadDisks() {
    exec('lsblk -o KNAME,FSTYPE -J', (error, stdout) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        const disks = JSON.parse(stdout).blockdevices.filter(device => device.fstype);
        const diskSelect = document.getElementById('disk-list');
        disks.forEach(disk => {
            const btn = document.createElement('button');
            btn.className = 'button';
            btn.id = disk.kname;
            btn.value = "/dev/"+disk.kname;
            ipcRenderer.send('log', btn.value);
            btn.textContent = disk.kname;

            btn.addEventListener('click', async () => {
                chosen_dir = await mountDevice(btn.value);
                ipcRenderer.send('log', 'chosen_dir '+ chosen_dir);
                ipcRenderer.send('navigate', 'explore.html');
            });

            diskSelect.appendChild(btn);
        });
    });
}

async function exec_command(command){
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            reject(error);
            ipcRenderer.send('log', error);
            console.log(error);
            return;
          }
          if (stderr) {
            reject(stderr);
            ipcRenderer.send('log', stderr);
    
            console.log(stderr);
            return;
          }
    
          resolve(stdout);
        });
      });
}

async function mountDevice(disk) {
    const mkdir_command = `mkdir -p /mnt/${disk}`;
    const diskCommand = `mount ${disk} /mnt/${disk}`;
    const fullCommand = `echo ${password} | ${mkdir_command} | sudo -S ${diskCommand}`;

    try {
        await exec_command(fullCommand);
        return `/mnt/${disk}`;
      } catch (error) {
        ipcRenderer.send('log', error.message);
        return '/';
      }
}

document.addEventListener('DOMContentLoaded', loadDisks);

module.exports = { getChosenDir: () => chosen_dir };