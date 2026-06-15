import React from 'react';
import { LoginForm } from '../components/Auth/LoginForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-primary p-4 overflow-y-auto">
      <LoginForm />
    </div>
  );
};
