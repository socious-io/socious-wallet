import { configureStore } from '@reduxjs/toolkit';
import { languageSlice } from './language.reducers';

const store = configureStore({
  reducer: {
    language: languageSlice.reducer,
  },
  middleware: getDefaultMiddleware => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['modals/openModal'],
      },
    });
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
