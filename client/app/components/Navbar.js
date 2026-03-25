'use client';

import { Navbar, Container, Button, Dropdown } from 'react-bootstrap';
import { FaSignOutAlt, FaUser, FaCog, FaMoon, FaSun, FaBell, FaCircle } from 'react-icons/fa';
import Logo from './Logo';
import { useState, useEffect } from 'react';

export default function ChatNavbar({ user, onLogout }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      style={{ 
        background: '#075E54', 
        color: 'white',
        padding: '10px 20px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: scrolled ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
      }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <Logo size="small" />
        
        <div className="d-flex align-items-center gap-3">
          <Button variant="link" className="text-white p-0" style={{ textDecoration: 'none' }}>
            <FaBell size={20} />
          </Button>
          
          <Dropdown align="end">
            <Dropdown.Toggle 
              variant="link" 
              className="p-0 d-flex align-items-center"
              style={{ textDecoration: 'none', color: 'white' }}
            >
              <img
                src={user?.avatar}
                alt={user?.username}
                className="rounded-circle"
                style={{ width: '35px', height: '35px', objectFit: 'cover', border: '2px solid white' }}
              />
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-lg border-0 mt-2 rounded-3">
              <Dropdown.Item className="d-flex align-items-center py-2">
                <FaUser className="me-2 text-success" /> Profile
              </Dropdown.Item>
              <Dropdown.Item className="d-flex align-items-center py-2">
                <FaCog className="me-2 text-secondary" /> Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item 
                onClick={onLogout}
                className="d-flex align-items-center py-2 text-danger"
              >
                <FaSignOutAlt className="me-2" /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}