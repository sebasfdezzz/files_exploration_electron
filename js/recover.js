const { ipcRenderer, remote } = require('electron');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Function to load disks using lsblk
async function loadDisks() {
    exec('lsblk -o KNAME,FSTYPE -J', (error, stdout) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        const disks = JSON.parse(stdout).blockdevices.filter(device => device.fstype);
        disks.unshift({ kname: '/', fstype: 'root' }); // Add root directory
        const diskSelect = document.getElementById('disk-select');
        disks.forEach(disk => {
            const option = document.createElement('option');
            option.value = disk.kname;
            option.textContent = disk.kname === '/' ? 'Root Directory' : `/dev/${disk.kname}`;
            diskSelect.appendChild(option);
        });
    });
}

// Function to run a sudo command securely with password input
function runSudoCommand(command, password, callback) {
    const commandParts = command.split(' ');
    const sudoCommand = commandParts.shift();
    const sudoArgs = commandParts;

    const process = spawn(sudoCommand, sudoArgs, {
        stdio: 'pipe'
    });

    process.stdin.write(password + '\n');
    process.stdin.end();

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
        stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
        stderr += data.toString();
    });

    process.on('exit', (code) => {
        if (code !== 0) {
            const error = new Error(`Failed to execute command: ${command}. Exit code: ${code}`);
            error.stdout = stdout;
            error.stderr = stderr;
            callback(error);
            return;
        }
        callback(null, stdout, stderr);
    });
}

// Function to handle file recovery
async function recoverFiles() {
    const disk = document.getElementById('disk-select').value;
    const destination = document.getElementById('destination-folder').value;
    const fileTypes = [];

    if (document.getElementById('documents-toggle').classList.contains('selected')) {
        fileTypes.push('doc', 'docx', 'pdf', 'txt', 'xls', 'xlsx', 'ppt', 'pptx');
    }
    if (document.getElementById('videos-toggle').classList.contains('selected')) {
        fileTypes.push('mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'mpeg', 'mpg');
    }
    if (document.getElementById('images-toggle').classList.contains('selected')) {
        fileTypes.push('jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'svg');
    }
    const fileTypesStr = fileTypes.length > 0 ? fileTypes.map(type => `${type},enable`).join(',') : 'everything,disable,jpg,enable,png,enable';

    const sudoCommand = `photorec /log /d ${destination} /cmd ${disk} fileopt,${fileTypesStr},search`;
    const fullCommand = `echo S1f2L3123sfl | sudo -S ${sudoCommand}`;

    runSudoCommand(fullCommand, 'S1f2L3123sfl', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        console.log(stdout);
        alert('Recovery process started. Check logs for details.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadDisks();

    const toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('selected');
            if (button.id === 'all-toggle') {
                toggleButtons.forEach(btn => {
                    if (btn !== button) btn.classList.remove('selected');
                });
            } else {
                document.getElementById('all-toggle').classList.remove('selected');
            }
        });
    });

    document.getElementById('choose-destination').addEventListener('click', async () => {
        const { canceled, filePaths } = await remote.dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        if (!canceled && filePaths.length > 0) {
            document.getElementById('destination-folder').value = filePaths[0];
        }
    });

    document.getElementById('recover-button').addEventListener('click', recoverFiles);

    // Back button event listener
    document.getElementById('back-button').addEventListener('click', () => {
        ipcRenderer.send('navigate', 'index.html');
    });
});
