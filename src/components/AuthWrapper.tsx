'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';

const AuthWrapper: React.FC = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return isLogin ? (
    <Login onSwitchToSignup={() => setIsLogin(false)} />
  ) : (
    <Signup onSwitchToLogin={() => setIsLogin(true)} />
  );
};

export default AuthWrapper;