export const config = {
  SECRET_KEY: process.env.REACT_APP_SECRET_KEY,
  PLUTO_PASSWD: new Uint8Array(32).fill(parseInt(process.env.REACT_APP_PLUTO_PASSWD)),
  PLUTO_DB_NAME: process.env.REACT_APP_PLUTO_DB_NAME,
  MEDIATOR_DID: process.env.REACT_APP_MEDIATOR_DID,
  ISSUER_AGENT: process.env.REACT_APP_ISSUER_AGENT,
};
