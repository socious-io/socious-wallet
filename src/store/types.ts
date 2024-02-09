import SDK from '@atala/prism-wallet-sdk';

// Define the state structure
export interface State {
  did?: SDK.Domain.DID;
  credentials: SDK.Domain.Credential[];
  didLoading: boolean;
  pluto: SDK.Domain.Pluto;
  agent: SDK.Agent;
}

export type Action =
  | { type: 'SET_CREDENTIALS'; payload: SDK.Domain.Credential[] }
  | { type: 'SET_PLUTO'; payload: SDK.Domain.Pluto }
  | { type: 'SET_DID'; payload: SDK.Domain.DID }
  | { type: 'SET_AGENT'; payload: SDK.Agent }
  | { type: 'LOADING_START' }
  | { type: 'LOADING_END' };
