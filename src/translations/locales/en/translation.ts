import intro from './intro.json';
import download from './download.json';
import register from './register.json';
import scan from './scan.json';
import created from './created.json';
import verify from './verify.json';
import recover from './recover.json';
import connection from './connection.json';
import settings from './settings.json';
import credentials from './credentials.json';
import setupPass from './setup-pass.json';
import createPass from './create-pass.json';
import general from './general.json';

export function generateTranslationFile() {
  return Object.assign(
    {},
    intro,
    download,
    register,
    scan,
    created,
    verify,
    recover,
    connection,
    settings,
    credentials,
    setupPass,
    createPass,
    general,
  );
}
