'use client';

import React, { useState } from 'react';
import VaultCreate from '@/components/VaultCreate';
import Login from '@/components/Login';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import CustomCursor from '@/components/CustomCursor';
import InteractiveBackground from '@/components/InteractiveBackground';
import { useAuth } from '@/context/AuthContext';
import { AppMode } from '@/types';

export default function Page() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.LANDING);

  // 1. Landing Page (Public)
  if (!user && !showLogin) {
    return (
      <div className="bg-[#fcfcfc] text-black relative min-h-screen overflow-hidden">
        <InteractiveBackground />
        <CustomCursor />
        <LandingPage onGetStarted={() => setShowLogin(true)} />
      </div>
    );
  }

  // 2. Login Page
  if (!user && showLogin) {
    return (
      <div className="bg-[#fcfcfc] text-black relative min-h-screen overflow-hidden">
        <InteractiveBackground />
        <CustomCursor />
        <Login onBack={() => setShowLogin(false)} />
      </div>
    );
  }

  // 3. Authenticated App
  return (
    <div className="bg-[#fcfcfc] text-black min-h-screen relative overflow-hidden">
      <InteractiveBackground />
      <CustomCursor />

      {mode === AppMode.LANDING && (
        <Dashboard onCreateNew={() => setMode(AppMode.CREATE)} />
      )}

      {mode === AppMode.CREATE && (
        <VaultCreate onBack={() => setMode(AppMode.LANDING)} />
      )}
    </div>
  );
}
