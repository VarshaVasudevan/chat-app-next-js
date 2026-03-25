'use client';

import { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';
import axios from 'axios';
import Logo from './Logo';

export default function Register({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password
      });
      
      if (response.data.success) {
        onRegister(response.data.token, response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <h2 className="fw-bold" style={{ color: '#075E54' }}>Create Account</h2>
          <p className="text-muted">Join ChatVerse and start messaging</p>
        </div>

        {error && <Alert variant="danger" className="rounded-pill">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#075E54', fontWeight: '500' }}>Username</Form.Label>
            <div className="position-relative">
              <FaUser className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: '16px' }} />
              <Form.Control
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                className="ps-5 py-2 rounded-pill"
                style={{ borderColor: '#e0e0e0' }}
              />
            </div>
          </Form.Group>

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

          <Form.Group className="mb-3">
            <Form.Label style={{ color: '#075E54', fontWeight: '500' }}>Password</Form.Label>
            <div className="position-relative">
              <FaLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: '16px' }} />
              <Form.Control
                type="password"
                placeholder="Create a password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="ps-5 py-2 rounded-pill"
                style={{ borderColor: '#e0e0e0' }}
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label style={{ color: '#075E54', fontWeight: '500' }}>Confirm Password</Form.Label>
            <div className="position-relative">
              <FaLock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: '16px' }} />
              <Form.Control
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </Form>

        <div className="text-center mt-4">
          <p className="text-muted">
            Already have an account?{' '}
            <Button 
              variant="link" 
              onClick={onSwitchToLogin} 
              className="p-0 text-decoration-none"
              style={{ color: '#25D366', fontWeight: '500' }}
            >
              Sign In
            </Button>
          </p>
        </div>

        <div className="text-center mt-3">
          <small className="text-muted">
            By creating an account, you agree to our Terms of Service
          </small>
        </div>
      </Card.Body>
    </Card>
  );
}