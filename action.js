import core from '@actions/core';

import { downloadKDriveFile } from './src/download_file.js';

const link = core.getInput('link');
const fileId = core.getInput('fileId');
const destination = core.getInput('destination');
const password = core.getInput('password');

await downloadKDriveFile(link, fileId, destination, password);
