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
    ipcRenderer.send('log', '1');
    let currentDirectory = '/';
    let directoryHistory = [];
    let selectionMode = false;
    let selectedItems = [];
    ipcRenderer.send('log', '2');
    const renderBreadcrumb = (path) => {
        breadcrumbDiv.textContent = path;
    };
    ipcRenderer.send('log', '3');
    const toggleSelection = (fileItem, file) => {
        const index = selectedItems.findIndex(item => item.absolute_path === file.absolute_path);
        if (index === -1) {
            selectedItems.push(file);
            fileItem.classList.add('selected');
        } else {
            selectedItems.splice(index, 1);
            fileItem.classList.remove('selected');
        }
    };
    ipcRenderer.send('log', '4');
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
                if (selectionMode) {
                    toggleSelection(fileItem, file);
                } else {
                    if (file.is_directory) {
                        directoryHistory.push(currentDirectory);
                        loadDirectory(file.absolute_path);
                    } else {
                        console.log(file);
                        openPopup(file);
                    }
                }
            });
        });
        
        const openPopup = (file) => {
            const popupWindow = window.open('../template/file_viewer.html', 'File Viewer', 'width=800,height=600');
            if (!popupWindow) {
                alert('Popup blocked! Please allow popups for this site.');
                return;
            }
    
            popupWindow.addEventListener('load', () => {
                const fileImage = popupWindow.document.getElementById('file-image');
                const fileText = popupWindow.document.getElementById('file-text');
    
                if (file.is_directory) {
                    fileText.textContent = 'This is a directory.';
                } else {
                    const fileExtension = file.file_name.split('.').pop().toLowerCase();
                    if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'gif') {
                        fileImage.style.display = 'block';
                        fileImage.src = file.absolute_path;
                        fileText.style.display = 'none';
                    } else {
                        fileImage.style.display = 'none';
                        fileText.style.display = 'block';
                        fileText.textContent = 'File type not supported for preview.';
                    }
                }
            });
        };
    };
    ipcRenderer.send('log', '5');
    ipcRenderer.send('log', '6');
    const loadDirectory = async (directory) => {
        ipcRenderer.send('log', '14');
        try {
            currentDirectory = directory;
            ipcRenderer.send('log', '15');
            renderBreadcrumb(currentDirectory);
            ipcRenderer.send('log', '16');
            const files = await execute_ls(directory);
            ipcRenderer.send('log', '17');
            renderFiles(files);
            ipcRenderer.send('log', '18');
        } catch (error) {
            console.error(`Error loading directory: ${error.message}`);
        }
    };
    ipcRenderer.send('log', '7');
    backToIndexButton.addEventListener('click', () => {
        ipcRenderer.send('navigate', 'index.html');
    });
    ipcRenderer.send('log', '8');
    backToPrevButton.addEventListener('click', () => {
        if (directoryHistory.length > 0) {
            const prevDirectory = directoryHistory.pop();
            loadDirectory(prevDirectory);
        }
    });
    ipcRenderer.send('log', '9');
    addFileButton.addEventListener('click', async () => {
        const newFilePath = path.join(currentDirectory, 'test.txt');
        try {
            await fs.writeFile(newFilePath, 'This is a test.');
            loadDirectory(currentDirectory); // Refresh the directory view
        } catch (error) {
            console.error(`Error creating file: ${error.message}`);
        }
    });
    ipcRenderer.send('log', '10');
    fileOptionsButton.addEventListener('click', async () => {
        const destinationDir = path.join(require('os').homedir(), 'Documents', 'copied_files');
        try {
            await fs.mkdir(destinationDir, { recursive: true });
            for (const item of selectedItems) {
                const destinationPath = path.join(destinationDir, path.basename(item.absolute_path));
                await fs.copyFile(item.absolute_path, destinationPath);
            }
            selectedItems = [];
            document.querySelectorAll('.file-item').forEach(item => item.classList.remove('selected'));
            selectionMode = false;
            selectModeButton.textContent = 'SELECT';
            alert('Files copied successfully!');
        } catch (error) {
            console.error(`Error copying files: ${error.message}`);
        }
    });
    ipcRenderer.send('log', '11');
    selectModeButton.addEventListener('click', () => {
        selectionMode = !selectionMode;
        selectModeButton.textContent = selectionMode ? 'CANCEL SELECT' : 'SELECT';
        if (!selectionMode) {
            selectedItems = [];
            document.querySelectorAll('.file-item').forEach(item => {
                item.classList.remove('selected');
            });
        }
    });
    ipcRenderer.send('log', '12');
    // Initial load
    loadDirectory(currentDirectory);
    ipcRenderer.send('log', '13');
});
