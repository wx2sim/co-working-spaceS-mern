import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './user/userSlice.js';
import themeReducer from './theme/themeSlice.js';
import {persistReducer, persistStore, } from 'redux-persist';

const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

const storage = typeof window !== "undefined" 
  ? {
      getItem: (key) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
      removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
    }
  : createNoopStorage();

const rootReducer = combineReducers({user: userReducer, theme: themeReducer});
const persistConfig = {
  key: 'root',
  storage,
  version: 1,
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
  
});
export const persistor = persistStore(store);