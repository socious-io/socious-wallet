import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { State, Action } from './types';
import { usePluto } from 'src/services/pluto';
import { useAgent } from 'src/services/agent';

// Initial state
const initialState: State = {
  did: null,
  credentials: [],
  didLoading: true,
  pluto: null,
  agent: null
};

// Create contexts
const AppStateContext = createContext<State | undefined>(undefined);
const AppDispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

// Reducer function
function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_CREDENTIALS':
      return { ...state, credentials: [...state.credentials, ...action.payload] };
    case 'SET_PLUTO':
      return { ...state, pluto: action.payload };
    case 'SET_AGENT':
      return { ...state, agent: action.payload };
    case 'SET_DID':
      return { ...state, did: action.payload, didLoading: false }; // Assuming you want to store an array or a single value
    case 'LOADING_START':
      // Handle loading state start
      return state; // Update accordingly
    case 'LOADING_END':
      // Handle loading state end
      return state; // Update accordingly
    default:
      return state;
  }
}

// Provider component
type StateProviderProps = { children: ReactNode };

export const StateProvider: React.FC<StateProviderProps> = ({ children }) => {
  const { pluto } = usePluto();
  const { agent } = useAgent(pluto);
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    if (!pluto || !agent) return;
    // Indicate loading start if necessary
    dispatch({ type: 'LOADING_START' });

    dispatch({type: 'SET_PLUTO', payload: pluto});
    dispatch({type: 'SET_AGENT', payload: agent});

    Promise.all([pluto.getAllCredentials(), pluto.getAllPrismDIDs()])
      .then(([credentials, dids]) => {
        console.log(dids, ' DDDDDDDDDDDDDDDDDDDDDDD');
        dispatch({ type: 'SET_CREDENTIALS', payload: credentials });
        dispatch({ type: 'SET_DID', payload: dids.length > 0 ? dids[0].did : null });
        // Indicate loading end if necessary
        dispatch({ type: 'LOADING_END' });
      })
      .catch((error) => {
        console.error('Failed to load data from Pluto', error);
        // Handle error state if necessary
        dispatch({ type: 'LOADING_END' });
      });
  }, [pluto, agent]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

// Custom hooks for using context
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a AppStateProvider');
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within a AppDispatchContext');
  }
  return context;
}
