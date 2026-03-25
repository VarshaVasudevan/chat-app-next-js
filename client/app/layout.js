import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// client/app/layout.js
export const metadata = {
  title: 'ChatVerse - Instant Messaging',
  description: 'Connect with friends instantly with real-time messaging',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/chat-icon.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" 
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}