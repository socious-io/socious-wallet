import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { StateType, ActionType, AppProviderProps, VerifyStatus } from './types';
import { usePluto } from 'src/services/pluto';
import { startAgent } from 'src/services/agent';
import { Device, DeviceInfo } from '@capacitor/device';
import { config } from 'src/config';

const initialState: StateType = {
  did: null,
  credentials: [],
  didLoading: true,
  pluto: null,
  agent: null,
  error: null,
  warn: null,
  message: [],
  verification: undefined,
  submitted: (localStorage.getItem('submitted_kyc') || '') as VerifyStatus,
  firstname: localStorage.getItem('firstname') || '',
  lastname: localStorage.getItem('lastname') || '',
  mnemonics: [],
  device: undefined,
  listenerActive: false,
  verifiedVC: {},
  encrypted: '',
  listProcessing: false,
};

const AppContext = createContext<{
  state: StateType;
  dispatch: React.Dispatch<ActionType>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Reducer function
function appReducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'SET_CREDENTIALS':
      return { ...state, credentials: [...state.credentials, ...action.payload].reverse() };
    case 'SET_VERIFICATION':
      return { ...state, verification: action.payload };
    case 'SET_SUBMIT':
      localStorage.setItem('submitted_kyc', action.payload);
      return { ...state, submitted: action.payload };
    case 'SET_DEVICE':
      return { ...state, device: action.payload };
    case 'SET_PLUTO':
      return { ...state, pluto: action.payload };
    case 'SET_AGENT':
      return { ...state, agent: action.payload };
    case 'SET_DID':
      return { ...state, did: action.payload, didLoading: false };
    case 'SET_MNEMONICS':
      return { ...state, mnemonics: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_WARN':
      return { ...state, warn: action.payload };
    case 'SET_NEW_MESSAGE':
      return { ...state, message: action.payload };
    case 'SET_LISTENER_STATE':
      return { ...state, listenerActive: action.payload };
    case 'VERIFIED_VC':
      return { ...state, verifiedVC: action.payload };
    case 'SET_ENCRYPTED_DATA':
      return { ...state, encrypted: action.payload };
    case 'SET_LIST_PROCESSING':
      return { ...state, listProcessing: action.payload };
    case 'LOADING_START':
      return state;
    case 'LOADING_END':
      return state;
    case 'SET_NAME':
      localStorage.setItem('firstname', action.payload.firstname);
      localStorage.setItem('lastname', action.payload.lastname);
      return { ...state, firstname: action.payload.firstname, lastname: action.payload.lastname };
    default:
      return state;
  }
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  console.log('start app store context');
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { pluto } = usePluto();

  useEffect(() => {
    if (!config.PLATFORM) {
      Device.getInfo().then(info => {
        dispatch({ type: 'SET_DEVICE', payload: info });
      });
    } else {
      dispatch({
        type: 'SET_DEVICE',
        payload: { platform: config.PLATFORM as 'ios' | 'android' | 'web' } as DeviceInfo,
      });
    }
  }, []);

  useEffect(() => {
    if (!pluto) return;
    // Indicate loading start if necessary
    dispatch({ type: 'LOADING_START' });
    dispatch({ type: 'SET_PLUTO', payload: pluto });

    Promise.all([pluto.getAllCredentials(), pluto.getAllPrismDIDs()])
      .then(([credentials, dids]) => {
        dispatch({
          type: 'SET_VERIFICATION',
          payload: credentials.filter(c => c.claims[0]?.type === 'verification')[0] || null,
        });
        dispatch({ type: 'SET_CREDENTIALS', payload: credentials });
        const master = dids.filter(d => d.alias === 'master')[0]?.did;
        dispatch({
          type: 'SET_DID',
          payload: dids?.length > 0 ? master || dids[0].did : null,
        });
        dispatch({ type: 'LOADING_END' });
        if (dids.length > 0) startAgent(pluto, dispatch);
      })
      .catch(error => {
        console.error('Failed to load data from Pluto', error);
        dispatch({ type: 'LOADING_END' });
      });
  }, [pluto, state.submitted]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
