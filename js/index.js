const { ipcRenderer } = require('electron');

document.addEventListener("DOMContentLoaded", function() {
    var exploreBtn = document.getElementById("explore");
    var recoverBtn = document.getElementById("recover");
    var systemBtn = document.getElementById("system");
    var settingsBtn = document.getElementById("settings");

    exploreBtn.addEventListener("click", function() {
        ipcRenderer.send('navigate', 'explore.html');
    });

    recoverBtn.addEventListener("click", function() {
        ipcRenderer.send('navigate', 'recover.html');
    });

    systemBtn.addEventListener("click", function() {
        ipcRenderer.send('navigate', 'system.html');
    });

    settingsBtn.addEventListener("click", function() {
        ipcRenderer.send('navigate', 'settings.html');
    });
});

