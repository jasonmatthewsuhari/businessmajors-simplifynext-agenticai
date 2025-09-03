import React, { useState } from 'react';
import ProtestMap from './ProtestMap';
import UserProfile from './UserProfile';
import Community from './Community';
import ActionPlan from './ActionPlan';
import SafetyForecast from './SafetyForecast';
import Notifications from './Notifications';

const NAV_ITEMS = [
  { key: 'map', label: 'Map', icon: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2C7.03 2 3 6.03 3 11c0 5.25 7.5 11 9 11s9-5.75 9-11c0-4.97-4.03-9-9-9zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="#1976d2"/></svg>
  ) },
  { key: 'notifications', label: 'Notifications', icon: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.686 2 6 4.686 6 8V11C6 13.21 4.42 15 2 15V17H22V15C19.58 15 18 13.21 18 11V8C18 4.686 15.314 2 12 2ZM12 22C13.104 22 14 21.104 14 20H10C10 21.104 10.896 22 12 22Z" fill="#1976d2"/></svg>
  ) },
  { key: 'community', label: 'Community', icon: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5s-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 13.36 17 14.28 17 15.5V19h7v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#1976d2"/></svg>
  ) },
  { key: 'profile', label: 'Profile', icon: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.7 0 8 1.34 8 4v4H4v-4c0-2.66 5.3-4 8-4zm0-2c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#1976d2"/></svg>
  ) },
  { key: 'actionplan', label: 'Action Plan', icon: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" fill="#1976d2"/></svg>
  ) },
  { key: 'safety', label: 'Forecast', icon: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M6.995 12c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25h10.01c.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25H6.995zm5-10C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 11.995 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#1976d2"/></svg>
  ) },
];

const App = () => {
  const [active, setActive] = useState('map');

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#f5f6fa', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky top header */}
      <header style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: 56, background: '#1976d2', color: '#fff', zIndex: 2100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, letterSpacing: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        AWaS
      </header>
      {/* Main content */}
      <main style={{ flex: 1, width: '100%', marginTop: 56, marginBottom: 64, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 500 }}>
          {active === 'map' && <ProtestMap />}
          {active === 'notifications' && <div style={{ padding: '24px 8px' }}><Notifications /></div>}
          {active === 'community' && <Community />}
          {active === 'profile' && <UserProfile />}
          {active === 'actionplan' && <ActionPlan />}
          {active === 'safety' && <SafetyForecast />}
        </div>
      </main>
      {/* Bottom navigation bar */}
      <nav className="bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, width: '100%', background: '#fff', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-around', zIndex: 2000, height: 64,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
      }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', fontSize: 13,
              color: active === item.key ? '#1976d2' : '#555', fontWeight: active === item.key ? 600 : 400,
              borderTop: active === item.key ? '2px solid #1976d2' : '2px solid transparent',
              cursor: 'pointer',
              padding: '6px 0 0 0',
            }}
          >
            {item.icon}
            <span style={{ marginTop: 2 }}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
