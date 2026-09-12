import { configureStore } from '@reduxjs/toolkit';
import authReducer, { persistData } from './Slices/AuthSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Restore the saved session before the first render so role-guarded panels don't redirect on refresh
store.dispatch(persistData());
