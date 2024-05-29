import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import { jwtDecode } from 'jwt-decode';

import {
  GET_ERRORS,
  SET_CURRENT_USER,
  USER_LOADING,
  DEAL_CREATED,
} from './types';

// Register User
export const registerUser = (userData, history) => dispatch => {
  axios
    .post('/users/register', userData)
    .then(res => history.push('/login'))
    .catch(err => {
      console.log('err', err);
      if (err.response) {
        dispatch({
          type: GET_ERRORS,
          payload: err.response.data,
        });
      } else {
        // Handle the error appropriately when err.response is undefined
        dispatch({
          type: GET_ERRORS,
          payload: { message: err.message },
        });
      }
    });
};

// Login - get user token
export const loginUser = userData => dispatch => {
  console.log('loginUser', userData);
  axios
    .post('/users/login', userData)
    .then(res => {
      // Save to localStorage

      // Set token to localStorage
      const { token } = res.data;
      localStorage.setItem('jwtToken', token);
      // Set token to Auth header
      setAuthToken(token);
      // Decode token to get user data
      const decoded = jwtDecode(token);
      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      })
    );
};

export const createDeal = userData => dispatch => {
  console.log('createDeal', userData);
  axios
    .post('/deals/deal', userData, {
      headers: {
        Authorization: 'Bearer ' + localStorage.jwtToken,
      },
    })
    .then(res => {
      dispatch({
        type: DEAL_CREATED,
        payload: res.data,
      });
    })
    .catch(err => {
      console.log('err', err);
      if (err.response) {
        dispatch({
          type: GET_ERRORS,
          payload: err.response.data,
        });
      } else {
        // Handle the error appropriately when err.response is undefined
        dispatch({
          type: GET_ERRORS,
          payload: { message: err.message },
        });
      }
    });
};

export const getDeals = () => dispatch => {
  console.log('getDeals');
  return new Promise((resolve, reject) => {
    axios
      .get('/deals', {
        headers: {
          Authorization: 'Bearer ' + localStorage.jwtToken,
        },
      })
      .then(res => {
        dispatch({
          type: DEAL_CREATED,
          payload: res.data,
        });
        resolve(res.data);
      })
      .catch(err => {
        console.log('err', err);
        if (err.response) {
          if (err.response.status === 404) {
            return resolve([]);
          }

          dispatch({
            type: GET_ERRORS,
            payload: err.response.data,
          });
        } else {
          // Handle the error appropriately when err.response is undefined
          dispatch({
            type: GET_ERRORS,
            payload: { message: err.message },
          });
        }
        reject(err);
      });
  });
};

export const getDealById = id => dispatch => {
  console.log('getDeals');
  return new Promise((resolve, reject) => {
    axios
      .get('/deals/deal/' + id, {
        headers: {
          Authorization: 'Bearer ' + localStorage.jwtToken,
        },
      })
      .then(res => {
        dispatch({
          type: DEAL_CREATED,
          payload: res.data,
        });
        resolve(res.data);
      })
      .catch(err => {
        console.log('err', err);
        if (err.response) {
          dispatch({
            type: GET_ERRORS,
            payload: err.response.data,
          });
        } else {
          // Handle the error appropriately when err.response is undefined
          dispatch({
            type: GET_ERRORS,
            payload: { message: err.message },
          });
        }
        reject(err);
      });
  });
};

export const editDeal = (id, userData) => dispatch => {
  console.log('createDeal', id);
  axios
    .put('/deals/deal/' + id, userData, {
      headers: {
        Authorization: 'Bearer ' + localStorage.jwtToken,
      },
    })
    .then(res => {
      dispatch({
        type: DEAL_CREATED,
        payload: res.data,
      });
    })
    .catch(err => {
      console.log('err', err);
      if (err.response) {
        dispatch({
          type: GET_ERRORS,
          payload: err.response.data,
        });
      } else {
        // Handle the error appropriately when err.response is undefined
        dispatch({
          type: GET_ERRORS,
          payload: { message: err.message },
        });
      }
    });
};

export const deleteDeal = id => dispatch => {
  console.log('createDeal', id);
  axios
    .delete('/deals/deal/' + id, {
      headers: {
        Authorization: 'Bearer ' + localStorage.jwtToken,
      },
    })
    .then(res => {
      dispatch({
        type: DEAL_CREATED,
        payload: res.data,
      });
    })
    .catch(err => {
      console.log('err', err);
      if (err.response) {
        dispatch({
          type: GET_ERRORS,
          payload: err.response.data,
        });
      } else {
        // Handle the error appropriately when err.response is undefined
        dispatch({
          type: GET_ERRORS,
          payload: { message: err.message },
        });
      }
    });
};

export const getCountryParity = () => dispatch => {
  console.log('getCountryParity');
  return new Promise((resolve, reject) => {
    axios
      .get('/deals/country-parity', {
        headers: {
          Authorization: 'Bearer ' + localStorage.jwtToken,
        },
      })
      .then(res => {
        resolve(res.data);
      })
      .catch(err => {
        console.log('err', err);
        if (err.response) {
          dispatch({
            type: GET_ERRORS,
            payload: err.response.data,
          });
        } else {
          // Handle the error appropriately when err.response is undefined
          dispatch({
            type: GET_ERRORS,
            payload: { message: err.message },
          });
        }
        reject(err);
      });
  });
};

// Set logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded,
  };
};

// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING,
  };
};

// Log user out
export const logoutUser = () => dispatch => {
  // Remove token from local storage
  localStorage.removeItem('jwtToken');
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};
