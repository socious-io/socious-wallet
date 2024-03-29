export const config = {
  SECRET_KEY: import.meta.env.VITE_APP_SECRET_KEY,
  PLUTO_PASSWD: new Uint8Array(32).fill(parseInt(import.meta.env.VITE_APP_PLUTO_PASSWD)),
  PLUTO_DB_NAME: import.meta.env.VITE_APP_PLUTO_DB_NAME,
  MEDIATOR_DID: import.meta.env.VITE_APP_MEDIATOR_DID,
  ISSUER_AGENT: import.meta.env.VITE_APP_ISSUER_AGENT,
  BACKUP_AGENT: import.meta.env.VITE_APP_BACKUP_AGENT,
  BACKUP_AGENT_API_KEY: import.meta.env.VITE_APP_BACKUP_AGENT_API_KEY,
  VERIFF_API_KEY: import.meta.env.VITE_APP_VERIFF_API_KEY,
};
