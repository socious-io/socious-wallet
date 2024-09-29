import { createSlice } from '@reduxjs/toolkit';

interface LangState {
  language: 'en' | 'jp' | '';
  system: 'en' | 'jp' | '';
}

const initialState = {
  language: localStorage.getItem('i18nextLng') || '',
  system: localStorage.getItem('system') || '',
} as LangState;

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      state.system = '';
      localStorage.removeItem('system');
    },
    setSystemLanguage: (state, action) => {
      state.system = action.payload;
      localStorage.setItem('system', action.payload);
      if (!state.language) {
        state.language = action.payload;
      }
    },
  },
});

export const { setLanguage, setSystemLanguage } = languageSlice.actions;
