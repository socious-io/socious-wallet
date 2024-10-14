import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { StateType, ActionType, AppProviderProps, VerifyStatus } from './types';
import { usePluto } from 'src/services/pluto';
import { useAgent } from 'src/services/agent';
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
  mnemonics: [],
  device: undefined,
  listenerActive: false,
  verifiedVC: {},
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
    case 'LOADING_START':
      return state;
    case 'LOADING_END':
      return state;
    case 'VERIFIED_VC':
      return { ...state, verifiedVC: action.payload };
    default:
      return state;
  }
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  console.log('start app store context');
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { pluto } = usePluto();
  const { agent } = useAgent(pluto, dispatch);
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
    if (!pluto || !agent) return;
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
        dispatch({
          type: 'SET_DID',
          payload: dids?.length > 0 ? dids[0].did : null,
        });
        // Indicate loading end if necessary
        dispatch({ type: 'LOADING_END' });
      })
      .catch(error => {
        console.error('Failed to load data from Pluto', error);
        // Handle error state if necessary
        dispatch({ type: 'LOADING_END' });
      });
  }, [pluto, agent]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
