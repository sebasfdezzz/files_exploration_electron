const { ipcRenderer } = require('electron');
const { execute_ls, createFileWithContent } = require('../utils/commands.js');
const { destination_folder_copy } = require('../utils/global_values.js');
const path = require('path');
const fs = require('fs').promises;

document.addEventListener('DOMContentLoaded', async function() {
    const fileListDiv = document.getElementById('file-list');
    const breadcrumbDiv = document.getElementById('breadcrumb');
    const backToIndexButton = document.getElementById('back-to-index');
    const backToPrevButton = document.getElementById('back-to-prev');
    const addFileButton = document.getElementById('add-file');
    const selectModeButton = document.getElementById('select-mode');
    const fileOptionsButton = document.getElementById('file-options');
    //ipcRenderer.send('log', '1');
    let currentDirectory = '/';
    let directoryHistory = [];
    let selectionMode = false;
    let selectedItems = [];
    //ipcRenderer.send('log', '2');
    const renderBreadcrumb = (path) => {
        breadcrumbDiv.textContent = path;
        //ipcRenderer.send('log', '19');
    };
    //ipcRenderer.send('log', '3');
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
    //ipcRenderer.send('log', '4');
    const renderFiles = (files) => {
        //ipcRenderer.send('log', '20');
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
    
            popupWindow.addEventListener('load', async () => {
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
                        try {
                            fileText.textContent = await fs.readFile(file.absolute_path, 'utf8');
                        } catch (error) {
                            ipcRenderer.send('log', error);
                            fileText.textContent = error;
                        }
                    }
                }
            });
        };
        //ipcRenderer.send('log', '21');
    };
    //ipcRenderer.send('log', '5');
    //ipcRenderer.send('log', '6');
    const loadDirectory = async (directory) => {
        //ipcRenderer.send('log', '14');
        try {
            currentDirectory = directory;
            //ipcRenderer.send('log', '15');
            renderBreadcrumb(currentDirectory);
            //ipcRenderer.send('log', '16');
            //ipcRenderer.send('log', directory);
            const files = await execute_ls(directory);
            
            //ipcRenderer.send('log', files);
            //ipcRenderer.send('log', '17');
            renderFiles(files);
            //ipcRenderer.send('log', '18');
        } catch (error) {
            console.error(`Error loading directory: ${error.message}`);
        }
    };
    //ipcRenderer.send('log', '7');
    backToIndexButton.addEventListener('click', () => {
        ipcRenderer.send('navigate', 'index.html');
    });
    //ipcRenderer.send('log', '8');
    backToPrevButton.addEventListener('click', () => {
        if (directoryHistory.length > 0) {
            const prevDirectory = directoryHistory.pop();
            loadDirectory(prevDirectory);
        }
    });
    //ipcRenderer.send('log', '9');
    addFileButton.addEventListener('click', async () => {
        ipcRenderer.send('log', 'add file clicked');
        try {
            openEditPopup();
            //const newFilePath = path.join(currentDirectory, 'test.txt');
            //await createFileWithContent(newFilePath, 'this is a test');
            //loadDirectory(currentDirectory); // Refresh the directory view
        } catch (error) {
            ipcRenderer.send('log', error.message);
        }
    });

    const openEditPopup = () => {
        ipcRenderer.send('log', 'opening pop up');
        const editPopUp = window.open(`../template/editor.html?directory=${encodeURIComponent(currentDirectory)}`, 'File Editor', 'width=800,height=600');
        if (!editPopUp) {
            alert('Popup blocked! Please allow popups for this site.');
            return;
        }

        editPopUp.addEventListener('load', async () => {
            editPopUp.document.getElementById('save-button').addEventListener('click', async () => {
                ipcRenderer.send('log', 'entered save directives');
                const filename = editPopUp.document.getElementById('filename').value;
                const content = editPopUp.document.getElementById('file-content').value;
        
                if (!filename) {
                    alert('Please enter a filename.');
                    return;
                }
        
                let abs_path = path.join(currentDirectory, filename);
                ipcRenderer.send('log', abs_path);
                ipcRenderer.send('log', content);

                // Send the filename and content back to the main process
                await createFileWithContent(abs_path, content);
                ipcRenderer.send('log', 'sent to save');
                loadDirectory(currentDirectory); 
                editPopUp.window.close();
            });
        
            editPopUp.document.getElementById('back-button').addEventListener('click', () => {
                editPopUp.window.close();
            });
        });


    };

    //ipcRenderer.send('log', '10');
    fileOptionsButton.addEventListener('click', async () => {
        ipcRenderer.send('log', 'file download clicked');
        const destinationDir = destination_folder_copy;
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
            ipcRenderer.send('log', 'copied file');
            alert(`Files copied onto ${destination_folder_copy}`);
        } catch (error) {
            ipcRenderer.send('log', error.message);
        }
    });
    //ipcRenderer.send('log', '11');
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
    //ipcRenderer.send('log', '12');
    // Initial load
    loadDirectory(currentDirectory);
    //ipcRenderer.send('log', '13');
});
