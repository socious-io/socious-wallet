export const config = {
  SECRET_KEY: import.meta.env.REACT_APP_SECRET_KEY,
  PLUTO_PASSWD: new Uint8Array(32).fill(parseInt(import.meta.env.REACT_APP_PLUTO_PASSWD)),
  PLUTO_DB_NAME: import.meta.env.REACT_APP_PLUTO_DB_NAME,
  MEDIATOR_DID: import.meta.env.REACT_APP_MEDIATOR_DID,
  ISSUER_AGENT: import.meta.env.REACT_APP_ISSUER_AGENT,
};
