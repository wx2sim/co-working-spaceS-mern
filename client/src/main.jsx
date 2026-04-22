import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { persistor, store } from './redux/store.js'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { Toaster } from 'react-hot-toast';

import axios from 'axios';
import { signOutUserSuccess } from './redux/user/userSlice.js'

axios.defaults.withCredentials = true;

// Add a response interceptor to handle authentication errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error is 401 (Unauthorized) or 404 with "User not found"
    // it means the session is invalid or the user no longer exists in the DB
    if (
      error.response &&
      (error.response.status === 401 || (error.response.status === 404 && error.response.data?.message === 'User not found'))
    ) {
      // Clear redux state to stop polling and redirect to login
      store.dispatch(signOutUserSuccess());
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Toaster position='top-center ' />
      <App />
    </PersistGate>
  </Provider>,
) 
