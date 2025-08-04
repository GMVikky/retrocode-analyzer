import React from 'react';
import { Toaster } from 'react-hot-toast';

export const Toast: React.FC = () => {
  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options
        duration: 4000,
        style: {
          background: 'rgba(30, 30, 38, 0.95)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          backdropFilter: 'blur(20px)',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        },
        // Success
        success: {
          duration: 3000,
          style: {
            borderColor: 'rgba(0, 255, 136, 0.3)',
            background: 'rgba(0, 255, 136, 0.1)',
          },
          iconTheme: {
            primary: '#00ff88',
            secondary: '#ffffff',
          },
        },
        // Error
        error: {
          duration: 5000,
          style: {
            borderColor: 'rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.1)',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
        // Loading
        loading: {
          style: {
            borderColor: 'rgba(0, 212, 255, 0.3)',
            background: 'rgba(0, 212, 255, 0.1)',
          },
          iconTheme: {
            primary: '#00d4ff',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
};