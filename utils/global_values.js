const path = require('path');

const password = 'S1f2L3123sfl';
const destination_folder_copy = path.join(require('os').homedir(), 'Downloads', 'copied_files');
const destination_folder_recover = path.join(require('os').homedir(), 'Downloads', 'recovered_files');

module.exports = { password, destination_folder_copy,destination_folder_recover };

