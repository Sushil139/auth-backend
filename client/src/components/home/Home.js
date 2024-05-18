import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [activeLink, setActiveLink] = useState('');

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '20%',
        backgroundColor: 'FFF7FC',
      }}
    >
      <div
        style={{
          position: 'flex',
          left: '0',
          height: '100%',
          width: '10%',
          backgroundColor: 'white',
          color: '#000',
          padding: '20px',
        }}
      >
        <Link
          to="/dashboard"
          onClick={() => setActiveLink('dashboard')}
          style={
            activeLink === 'dashboard'
              ? { color: 'red', display: 'block' }
              : { color: 'black', display: 'block' }
          }
        >
          Dashboard
        </Link>
        <Link
          to="/deal"
          onClick={() => setActiveLink('deal')}
          style={
            activeLink === 'deal'
              ? { color: 'red', display: 'block' }
              : { color: 'black', display: 'block' }
          }
        >
          Deal
        </Link>
      </div>
    </div>
  );
}

export default Home;
