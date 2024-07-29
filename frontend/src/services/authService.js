import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth/';

const register = (username, email, password, isAdmin) => {
  return axios.post(API_URL + 'register/', {
    username,
    email,
    password,
    is_admin: isAdmin,
  });
};

const login = (username, password) => {
  console.log('Sending login request:', { username, password });  // Log data being sent
  return axios.post(API_URL + 'login/', {
    username,
    password,
  }).then((response) => {
    if (response.data.access) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  });
};

const logout = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  localStorage.removeItem('user'); // Clear local storage immediately

  if (user && user.refresh) {
    const config = {
      headers: {
        Authorization: 'Bearer ' + user.access
      }
    };
    axios.post(API_URL + 'logout/', {
      refresh: user.refresh,
    }, config).then(() => {
      window.location.href = '/'; // Redirect to login page
    }).catch((error) => {
      console.error('Failed to logout:', error);
      window.location.href = '/'; // Redirect to login page even if API request fails
    });
  } else {
    window.location.href = '/'; // Redirect to login page if no user or refresh token
  }
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const getAuthHeader = () => {
  const user = getCurrentUser();
  if (user && user.access) {
    return { Authorization: 'Bearer ' + user.access };
  } else {
    return {};
  }
};
const changePassword = (currentPassword, newPassword) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.access;

  return axios.put(API_URL + "change-password/", {
    old_password: currentPassword,
    new_password: newPassword
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};


export default {
  register,
  login,
  logout,
  getCurrentUser,
  getAuthHeader,
  changePassword,
};
