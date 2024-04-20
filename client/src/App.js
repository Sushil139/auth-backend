import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import setAuthToken from './utils/setAuthToken';

import { setCurrentUser, logoutUser } from './actions/authActions';
import { Provider } from 'react-redux';
import store from './store';

import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
// import PrivateRoute from "./components/private-route/PrivateRoute";
import Dashboard from './components/dashboard/Dashboard';
import EditDeal from './components/deal/EditDeal';
import CreateDeal from './components/deal/CreateDeal';
import Home from './components/home/Home';
import Deal from './components/deal/Deal';

import './App.css';

// Check for token to keep user logged in
if (localStorage.jwtToken) {
  // Set auth token header auth
  const token = localStorage.jwtToken;
  setAuthToken(token);
  // Decode token and get user info and exp
  const decoded = jwtDecode(token);
  // Set user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));
  // Check for expired token
  const currentTime = Date.now() / 1000; // to get in milliseconds
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());

    // Redirect to login
    window.location.href = './login';
  }
}
// class App extends Component {
//   render() {
//     console.log('App.js');
//     return (
//       <Provider store={store}>
//         <Router>
//           <div className="App">
//             <Navbar />
//             <Routes>
//               <Route path="/" element={<Landing />} />
//               <Route path="/register" element={<Register />} />
//               <Route path="/login" element={<Login />} />
//               <Route path="/home" element={<Home />} />
//               <Route path="/dashboard" element={<Dashboard />} />
//               <Route path="/edit-deal/:_id" element={<EditDeal />} />
//               <Route path="/create-deal" element={<CreateDeal />} />
//             </Routes>
//           </div>
//         </Router>
//       </Provider>
//     );
//   }
// }
// export default App;

const MainContent = () => {
  const location = useLocation();

  return (
    <div style={{ display: 'flex' }}>
      {['/', '/register', '/login'].includes(location.pathname) ? null : (
        <Home />
      )}
      <div style={{ flex: 1, backgroundColor: '#F6F5F2' }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/edit-deal/:_id" element={<EditDeal />} />
          <Route path="/create-deal" element={<CreateDeal />} />
          <Route path="/deal" element={<Deal />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
          <MainContent />
        </div>
      </Router>
    </Provider>
  );
};

export default App;
