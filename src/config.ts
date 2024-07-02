export const APP_VERSION = '1.3.2';
export const config = {
  DEBUG: process.env.REACT_APP_DEBUG,
  SECRET_KEY: process.env.REACT_APP_SECRET_KEY,
  PLUTO_PASSWD: new Uint8Array(32).fill(parseInt(process.env.REACT_APP_PLUTO_PASSWD)),
  PLUTO_DB_NAME: process.env.REACT_APP_PLUTO_DB_NAME,
  MEDIATOR_DID: process.env.REACT_APP_MEDIATOR_DID,
  ISSUER_AGENT: process.env.REACT_APP_ISSUER_AGENT,
  BACKUP_AGENT: process.env.REACT_APP_BACKUP_AGENT,
  BACKUP_AGENT_API_KEY: process.env.REACT_APP_BACKUP_AGENT_API_KEY,
  VERIFF_API_KEY: process.env.REACT_APP_VERIFF_API_KEY,
  DISCORD_WEBHOOK: process.env.REACT_APP_DISCORD_WEBHOOK,
  PLATFORM: process.env.REACT_APP_PLATFORM,
};
