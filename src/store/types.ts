import SDK from '@atala/prism-wallet-sdk';

export interface Err {
  err: Error;
  section: string;
}
export interface StateType {
  did?: SDK.Domain.DID;
  mnemonics: string[];
  credentials: SDK.Domain.Credential[];
  verification: SDK.Domain.Credential | null | undefined;
  submitted: boolean;
  didLoading: boolean;
  pluto: SDK.Domain.Pluto;
  agent: SDK.Agent;
  message: SDK.Domain.Message[];
  error: Err;
  warn: Err;
}

export type ActionType =
  | { type: 'SET_CREDENTIALS'; payload: SDK.Domain.Credential[] }
  | { type: 'SET_PLUTO'; payload: SDK.Domain.Pluto }
  | { type: 'SET_DID'; payload: SDK.Domain.DID }
  | { type: 'SET_MNEMONICS'; payload: string[] }
  | { type: 'SET_AGENT'; payload: SDK.Agent }
  | { type: 'SET_ERROR'; payload: Err }
  | { type: 'SET_WARN'; payload: Err }
  | { type: 'SET_NEW_MESSAGE'; payload: SDK.Domain.Message[] }
  | { type: 'SET_VERIFICATION'; payload: SDK.Domain.Credential }
  | { type: 'SET_SUBMIT'; payload: boolean }
  | { type: 'LOADING_END' }
  | { type: 'LOADING_START' }
  | { type: 'LOADING_END' };

export type AppProviderProps = { children: React.ReactNode };
