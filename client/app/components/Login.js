'use client';

import { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import axios from 'axios';
import Logo from './Logo';

export default function Login({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      if (response.data.success) {
        onLogin(response.data.token, response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-glass animate-fadeIn border-0">
      <Card.Body className="p-5">
        <div className="text-center mb-4">
          <div className="d-flex justify-content-center mb-3">
            <Logo size="large" />
          </div>
          <h2 className="fw-bold" style={{ color: '#075E54' }}>Welcome Back!</h2>
          <p className="text-muted">Sign in to continue to ChatVerse</p>
        </div>

        {error && <Alert variant="danger" className="rounded-pill">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#075E54', fontWeight: '500' }}>Email Address</Form.Label>
            <div className="position-relative">
              <FaEnvelope className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: '16px' }} />
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="ps-5 py-2 rounded-pill"
                style={{ borderColor: '#e0e0e0' }}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label style={{ color: '#075E54', fontWeight: '500' }}>Password</Form.Label>
            <div className="position-relative">
              <FaLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: '16px' }} />
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="ps-5 py-2 rounded-pill"
                style={{ borderColor: '#e0e0e0' }}
              />
            </div>
          </Form.Group>

          <Button
            variant="success"
            type="submit"
            disabled={loading}
            className="w-100 py-2 fw-bold rounded-pill"
            style={{ 
              background: '#25D366',
              border: 'none',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#128C7E'}
            onMouseLeave={(e) => e.target.style.background = '#25D366'}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <p className="text-muted">
            Don't have an account?{' '}
            <Button 
              variant="link" 
              onClick={onSwitchToRegister} 
              className="p-0 text-decoration-none"
              style={{ color: '#25D366', fontWeight: '500' }}
            >
              Create new account
            </Button>
          </p>
        </div>

        <div className="text-center mt-3">
          <small className="text-muted">
            By continuing, you agree to our Terms of Service
          </small>
        </div>
      </Card.Body>
    </Card>
  );
}