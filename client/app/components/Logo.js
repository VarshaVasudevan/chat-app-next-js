'use client';

import { FaCommentDots } from 'react-icons/fa';

export default function Logo({ size = 'normal' }) {
  const getSize = () => {
    switch(size) {
      case 'small':
        return { iconSize: 24, textSize: '1.1rem', containerSize: '38px' };
      case 'large':
        return { iconSize: 36, textSize: '2rem', containerSize: '60px' };
      default:
        return { iconSize: 28, textSize: '1.4rem', containerSize: '48px' };
    }
  };

  const { iconSize, textSize, containerSize } = getSize();

  return (
    <div className="d-flex align-items-center gap-2">
      <div 
        className="rounded-circle d-flex align-items-center justify-content-center"
        style={{ 
          width: containerSize, 
          height: containerSize,
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
          transition: 'transform 0.3s ease'
        }}
      >
        <FaCommentDots color="white" size={iconSize} />
      </div>
      <div>
        <span 
          className="fw-bold"
          style={{ 
            fontSize: textSize, 
            color: '#075E54',
            letterSpacing: '-0.3px'
          }}
        >
          ChatVerse
        </span>
        {size === 'normal' && (
          <div style={{ fontSize: '0.7rem', marginTop: '-4px', color: '#128C7E' }}>
            Instant Messaging
          </div>
        )}
      </div>
    </div>
  );
}