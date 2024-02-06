import SDK from '@atala/prism-wallet-sdk';

// Define the state structure
export interface State {
  did?: SDK.Domain.DID;
  credentials: SDK.Domain.Credential[];
  didLoading: boolean;
}

export type Action =
  | { type: 'SET_CREDENTIALS'; payload: SDK.Domain.Credential[] }
  | { type: 'SET_DID'; payload: SDK.Domain.DID }
  | { type: 'LOADING_START' }
  | { type: 'LOADING_END' };
