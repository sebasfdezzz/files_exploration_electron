const { ipcRenderer } = require('electron');
const { execute_ls } = require('../utils/commands.js');

document.addEventListener('DOMContentLoaded', async function() {
    const fileListDiv = document.getElementById('file-list');
    const breadcrumbDiv = document.getElementById('breadcrumb');
    const backToIndexButton = document.getElementById('back-to-index');
    const backToPrevButton = document.getElementById('back-to-prev');
    const addFileButton = document.getElementById('add-file');
    const selectModeButton = document.getElementById('select-mode');
    const fileOptionsButton = document.getElementById('file-options');

    let currentDirectory = '/'; // Start from the root directory or set an initial path
    let directoryHistory = [];

    const renderBreadcrumb = (path) => {
        breadcrumbDiv.textContent = path;
    };

    const renderFiles = (files) => {
        fileListDiv.innerHTML = '';
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const fileIcon = document.createElement('span');
            fileIcon.className = 'file-icon';
            fileIcon.textContent = file.is_directory ? '📁' : '📄';
            
            const fileName = document.createElement('span');
            fileName.textContent = file.file_name;
            
            fileItem.appendChild(fileIcon);
            fileItem.appendChild(fileName);
            fileListDiv.appendChild(fileItem);

            fileItem.addEventListener('click', () => {
                if (file.is_directory) {
                    directoryHistory.push(currentDirectory);
                    loadDirectory(file.absolute_path);
                } else {
                    console.log(file);
                }
            });
        });
    };

    const loadDirectory = async (directory) => {
        try {
            currentDirectory = directory;
            renderBreadcrumb(currentDirectory);
            const files = await execute_ls(directory);
            renderFiles(files);
        } catch (error) {
            console.error(`Error loading directory: ${error.message}`);
        }
    };

    backToIndexButton.addEventListener('click', () => {
        ipcRenderer.send('navigate', 'index.html');
    });

    backToPrevButton.addEventListener('click', () => {
        if (directoryHistory.length > 0) {
            const prevDirectory = directoryHistory.pop();
            loadDirectory(prevDirectory);
        }
    });

    addFileButton.addEventListener('click', () => {
        // Future implementation for adding files
    });

    selectModeButton.addEventListener('click', () => {
        // Future implementation for selecting files
    });

    fileOptionsButton.addEventListener('click', () => {
        // Future implementation for file options
    });

    // Initial load
    loadDirectory(currentDirectory);
});
