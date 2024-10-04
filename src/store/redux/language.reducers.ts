import { createSlice } from '@reduxjs/toolkit';

interface LangState {
  language: 'en' | 'jp';
}

const initialState = {
  language: localStorage.getItem('i18nextLng') || 'en',
} as LangState;

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = languageSlice.actions;
