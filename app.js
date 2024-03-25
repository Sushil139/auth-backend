import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

function App() {
  const [deals, setDeals] = useState([]);
  const [user, setUser] = useState(null);

  const register = async (username, password) => {
    console.log("register")
    const response = await axios.post('/register', { username, password });
    setUser(response.data);
  };

  const login = async (username, password) => {
    console.log("login")
    const response = await axios.post('/login', { username, password });
    setUser(response.data);
  };

  const getDeals = async () => {
    const response = await axios.get('/deals', { headers: { Authorization: `Bearer ${user.token}` } });
    setDeals(response.data);
  };

  const addDeal = async (deal) => {
    await axios.post('/add-deal', deal, { headers: { Authorization: `Bearer ${user.token}` } });
    getDeals();
  };

  const editDeal = async (id, deal) => {
    await axios.put(`/edit-deal/${id}`, deal, { headers: { Authorization: `Bearer ${user.token}` } });
    getDeals();
  };

  const deleteDeal = async (id) => {
    await axios.delete(`/delete-deal/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
    getDeals();
  };

  useEffect(() => {
    if (user) {
      getDeals();
    }
  }, [user]);

  return (
    console.log("App.js2"),
    <Router>
      <Switch>
        <Route path="/register">
          <Register onRegister={register} />
        </Route>
        <Route path="/login">
          <Login onLogin={login} />
        </Route>
        <Route path="/deals">
          <Deals deals={deals} onAddDeal={addDeal} onEditDeal={editDeal} onDeleteDeal={deleteDeal} />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;