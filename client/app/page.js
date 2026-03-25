'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';

export default function Home() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden">
        {/* Animated background bubbles */}
        <div className="position-absolute w-100 h-100">
          <div className="animate-float" style={{ position: 'absolute', top: '10%', left: '5%' }}>
            <div className="rounded-circle bg-white opacity-10" style={{ width: '100px', height: '100px' }}></div>
          </div>
          <div className="animate-float" style={{ position: 'absolute', bottom: '20%', right: '10%', animationDelay: '1s' }}>
            <div className="rounded-circle bg-white opacity-10" style={{ width: '150px', height: '150px' }}></div>
          </div>
          <div className="animate-float" style={{ position: 'absolute', top: '50%', right: '20%', animationDelay: '2s' }}>
            <div className="rounded-circle bg-white opacity-10" style={{ width: '80px', height: '80px' }}></div>
          </div>
        </div>

        <Container>
          <Row className="w-100">
            <Col md={6} lg={5} xl={4} className="mx-auto">
              <div className="animate-fadeIn">
                {showLogin ? (
                  <Login 
                    onLogin={handleLogin} 
                    onSwitchToRegister={() => setShowLogin(false)} 
                  />
                ) : (
                  <Register 
                    onRegister={handleLogin} 
                    onSwitchToLogin={() => setShowLogin(true)} 
                  />
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return <Chat user={user} token={token} onLogout={handleLogout} />;
}