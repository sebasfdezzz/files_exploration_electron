const { ipcRenderer, remote } = require('electron');
const { exec } = require('child_process');
const { executeCommand } = require('../utils/commands.js');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const destination = 'Downloads/recovered_files/recovered_files';
let childProcess;

// Function to load disks using lsblk
async function loadDisks() {
    exec('lsblk -o KNAME,FSTYPE -J', (error, stdout) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        const disks = JSON.parse(stdout).blockdevices.filter(device => device.fstype);
        const diskSelect = document.getElementById('disk-select');
        disks.forEach(disk => {
            const option = document.createElement('option');
            option.value = disk.kname;
            option.textContent = disk.kname === '/' ? 'Root Directory' : `${disk.kname}`;
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
    const fileTypes = [];

    let mkdir_command = 'mkdir -p /home/sebastianf/Downloads/recovered_files/';

    if (document.getElementById('documents-toggle').classList.contains('selected')) {
        fileTypes.push('doc', 'pdf', 'txt');
    }
    if (document.getElementById('videos-toggle').classList.contains('selected')) {
        fileTypes.push('mkv', 'mov','flv', 'mpg');
    }
    if (document.getElementById('images-toggle').classList.contains('selected')) {
        fileTypes.push('jpg', 'png', 'gif', 'bmp');
    }
    // if (document.getElementById('all-toggle').classList.contains('selected')) {
    //     fileTypes = []
    // }
    const fileTypesStr = fileTypes.length > 0 ? 'everything,disable,'+fileTypes.map(type => `${type},enable`).join(',') : 'everything,enable';

    const diskCommand = `/dev/${disk}`;
    const sudoCommand = `photorec /log /d /home/sebastianf/${destination} /cmd ${diskCommand} fileopt,${fileTypesStr},search`;
    const fullCommand = `${mkdir_command} | echo S1f2L3123sfl | sudo -S ${sudoCommand}`;

    ipcRenderer.send('log', fullCommand);

    childProcess = exec(fullCommand, (error, stdout, stderr) => {
        if (error) {
            ipcRenderer.send('log', `error: ${error.message}`);
        } else {
            ipcRenderer.send('log', `stdout: ${stdout}`);
        }
        ipcRenderer.send('log', `stderr: ${stderr}`);
    });

    childProcess.on('exit', () => {
        ipcRenderer.send('log', 'finished');
    });
}

async function executeCommand2(command) {
    return new Promise((resolve, reject) => {
        const child = exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });

        child.stdout.on('data', (data) => {
            console.log(data);
        });

        child.stderr.on('data', (data) => {
            console.error(data);
        });
    });
}

function cancelRecovery() {
    if (childProcess) {
        exec(`kill -9 ${childProcess.pid}`, (error, stdout, stderr) => {
            ipcRenderer.send('log', `kill stdout: ${stdout}`);
            ipcRenderer.send('log', `kill stderr: ${stderr}`);
            if (error) {
                ipcRenderer.send('log', `error: ${error.message}`);
            } else {
                ipcRenderer.send('log', 'recovery process canceled');
            }
        });
    }
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
    document.getElementById('destination-folder').value = destination; 

    document.getElementById('recover-button').addEventListener('click', recoverFiles);

    // Back button event listener
    document.getElementById('back-button').addEventListener('click', () => {
        cancelRecovery();
        ipcRenderer.send('navigate', 'index.html');
    });
});
