import { downloadKDriveFile } from './src/download_file.js';

const link = 'https://kdrive.infomaniak.com/app/share/drive_id/uuid';
const fileId = '123456789';
const destination = 'test.txt';
const password = '';

await downloadKDriveFile(link, fileId, destination, password);
