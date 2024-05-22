// const { ipcRenderer } = require('../js/index.js');
// // ipcRenderer.send('log', 'b4 load');

// // Function to get query parameters
// function getQueryParams() {
//     const params = {};
//     const queryString = window.location.search.slice(1);
//     const queryArray = queryString.split('&');
//     queryArray.forEach(query => {
//         const [key, value] = query.split('=');
//         params[key] = decodeURIComponent(value);
//     });
//     return params;
// }

// document.addEventListener('DOMContentLoaded', () => {
//     // ipcRenderer.send('log', 'b4 params');
//     const params = getQueryParams();
//     // ipcRenderer.send('log', params);

//     document.getElementById('save-button').addEventListener('click', () => {
//         const filename = document.getElementById('filename').value;
//         const content = document.getElementById('file-content').value;

//         if (!filename) {
//             alert('Please enter a filename.');
//             return;
//         }

//         let abs_path = params.directory + "/" + filename;
//         // ipcRenderer.send('log', abs_path);
//         // Send the filename and content back to the main process
//         ipcRenderer.send('save-file', { filename, content });
//         ipcRenderer.send('log', 'sent to save');
//         window.close();
//     });

//     document.getElementById('back-button').addEventListener('click', () => {
//         window.close();
//     });
// });