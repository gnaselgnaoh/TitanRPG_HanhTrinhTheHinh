
import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { UserProfile } from './types';
import { soundEngine } from './utils/soundEngine';

type AppState = 'LOADING' | 'DASHBOARD' | 'ONBOARDING';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appState, setAppState] = useState<AppState>('LOADING');
  const [isSaving, setIsSaving] = useState(false);

  // Load initial profile and determine state
  useEffect(() => {
    const savedProfile = localStorage.getItem('titan_profile');
    if (savedProfile) {
      const p = JSON.parse(savedProfile);
      setProfile(p);
      if (p.settings?.volume !== undefined) {
        soundEngine.setVolume(p.settings.volume);
      }
      setAppState('DASHBOARD');
    } else {
      setAppState('ONBOARDING');
    }
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (profile) {
      // Save immediately on change
      localStorage.setItem('titan_profile', JSON.stringify(profile));
    }
  }, [profile]);

  // Periodic Auto-save visual indicator & backup interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (profile && appState === 'DASHBOARD') {
        setIsSaving(true);
        localStorage.setItem('titan_profile', JSON.stringify(profile));
        // Reset saving indicator after a moment
        setTimeout(() => setIsSaving(false), 2000);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [profile, appState]);

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    if (appState === 'ONBOARDING') {
       setAppState('DASHBOARD');
       soundEngine.playSuccess();
    }
  };

  const handleResetJourney = () => {
    if (window.confirm("CẢNH BÁO: Toàn bộ tiến trình sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn làm lại từ đầu?")) {
      try {
        soundEngine.playClick();
      } catch (e) { /* ignore sound error */ }
      
      // Clear main profile
      localStorage.removeItem('titan_profile');
      
      // Clear ALL potential daily plan keys
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('titan_plan_')) {
          localStorage.removeItem(key);
        }
      });
      
      // State reset
      setProfile(null);
      setAppState('ONBOARDING');
    }
  };

  if (appState === 'LOADING') return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-4 border-rpg-gold border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <>
      {isSaving && (
        <div className="fixed top-4 right-4 z-[100] bg-slate-900/80 border border-emerald-500/50 text-emerald-400 text-xs px-3 py-1 rounded-full animate-pulse flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          Đã lưu tự động
        </div>
      )}

      {appState === 'ONBOARDING' && (
        <Onboarding onComplete={handleSaveProfile} />
      )}

      {appState === 'DASHBOARD' && profile && (
        <Dashboard profile={profile} setProfile={handleSaveProfile} onReset={handleResetJourney} />
      )}
    </>
  );
};

export default App;
