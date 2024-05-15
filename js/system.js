const { ipcRenderer } = require('electron');
const { getSystemInfo } = require('../utils/commands.js');

document.addEventListener('DOMContentLoaded', function() {
    const systemData = getSystemInfo();
    const systemInfoDiv = document.getElementById('system-info');
    
    const createSystemItem = (title, value) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'system-item';
        
        const itemTitle = document.createElement('h3');
        itemTitle.textContent = title;
        
        const itemValue = document.createElement('p');
        itemValue.textContent = value;
        
        itemDiv.appendChild(itemTitle);
        itemDiv.appendChild(itemValue);
        
        return itemDiv;
    };
    
    systemInfoDiv.appendChild(createSystemItem('Architecture', systemData.architecture));
    systemInfoDiv.appendChild(createSystemItem('Hostname', systemData.hostname));
    systemInfoDiv.appendChild(createSystemItem('Platform', systemData.platform));
    systemInfoDiv.appendChild(createSystemItem('Release', systemData.release));
    systemInfoDiv.appendChild(createSystemItem('Total Memory', `${(systemData.totalMemory / (1024 ** 3)).toFixed(2)} GB`));
    systemInfoDiv.appendChild(createSystemItem('Free Memory', `${(systemData.freeMemory / (1024 ** 3)).toFixed(2)} GB`));
    
    systemData.cpus.forEach((cpu, index) => {
        systemInfoDiv.appendChild(createSystemItem(`CPU ${index + 1}`, `${cpu.model} @ ${cpu.speed} MHz`));
    });
    
    systemInfoDiv.appendChild(createSystemItem('Disks', JSON.stringify(systemData.disks, null, 2)));
    systemInfoDiv.appendChild(createSystemItem('Disk Usage', JSON.stringify(systemData.diskUsage, null, 2)));
    systemInfoDiv.appendChild(createSystemItem('RAM', JSON.stringify(systemData.ram, null, 2)));
    systemInfoDiv.appendChild(createSystemItem('System Info', JSON.stringify(systemData.systemInfo, null, 2)));

    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', function() {
        ipcRenderer.send('navigate', 'index.html');
    });
});
