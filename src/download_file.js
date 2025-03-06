import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const shareURLReg = /\/app\/share\/(?<driveId>\d+)\/(?<uuid>[\da-z-]+)/;

/**
 * Download a password-protected file from kDrive.
 * @param link {string} The public URL to the shared file, as copied from the kDrive user interface.
 * @param fileId {string} The identifier of the file.
 * @param destination {string} The path to the destination file.
 * @param [password] {string} The password to the file.
 * @returns {Promise<void>} Fulfills when the file has been downloaded.
 */
export async function downloadKDriveFile(link, fileId, destination, password) {
  const shareURL = new URL(link);
  const match = shareURLReg.exec(shareURL.pathname);

  if (!match?.groups) {
    throw new Error(`Invalid share URL: ${link}`);
  }

  let credentials;
  if (password) {
    const authURL = new URL(
      `/2/app/${match.groups.driveId}/share/${match.groups.uuid}/auth`,
      shareURL,
    );
    credentials = await getFileCredentials(authURL, password);
  }

  const downloadURL = new URL(
    `/2/app/${match.groups.driveId}/share/${match.groups.uuid}/files/${fileId}/download`,
    shareURL,
  );

  const headers = credentials ? { cookie: credentials } : {};

  const downloadRequest = await fetch(downloadURL, {
    redirect: 'follow',
    headers,
  });

  if (downloadRequest.status !== 200 || !downloadRequest.body) {
    const body = await downloadRequest.text();
    throw new Error(`Could not download the file: ${body}`);
  }

  const resolvedDestination = path.resolve(destination);

  // Ensure destination directory exists
  await mkdir(path.dirname(resolvedDestination), { recursive: true });

  const fileStream = createWriteStream(resolvedDestination);
  await pipeline(Readable.fromWeb(downloadRequest.body), fileStream);
}

/**
 * Get the credentials for the kDrive file.
 * This calls a kDrive endpoint used by their web app when a file is password-protected.
 * The endpoint sets a cookie with the credentials for the file.
 * @param {URL} passwordRequestURL
 * @param {string} password
 * @returns {Promise<string>}
 */
async function getFileCredentials(passwordRequestURL, password) {
  const passwordRequest = await fetch(passwordRequestURL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (passwordRequest.status !== 200) {
    throw new Error('Invalid password');
  }

  const cookieHeaders = passwordRequest.headers.getSetCookie();
  // Credentials cookie is in the form of DRIVE_{UUID}={TOKEN} (url encoded).
  const credentialsCookie = cookieHeaders.find((cookie) =>
    cookie.startsWith('DRIVE_'),
  );
  if (!credentialsCookie) {
    throw new Error('Could not get credentials');
  }

  return decodeURIComponent(credentialsCookie.split(';')[0]);
}
