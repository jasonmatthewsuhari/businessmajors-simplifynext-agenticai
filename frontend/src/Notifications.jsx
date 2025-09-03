import React, { useState, useEffect } from 'react';

const mockNotifications = [
  { id: '1', message: 'Protest near City Hall tomorrow', time: '2025-09-04 10:00' },
  { id: '2', message: 'Climate Action Rally happening now downtown', time: '2025-09-03 14:00' },
  { id: '3', message: 'Workers Rights March planned for Friday', time: '2025-09-05 09:00' },
];

const bellIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.686 2 6 4.686 6 8V11C6 13.21 4.42 15 2 15V17H22V15C19.58 15 18 13.21 18 11V8C18 4.686 15.314 2 12 2ZM12 22C13.104 22 14 21.104 14 20H10C10 21.104 10.896 22 12 22Z" fill="#333"/>
  </svg>
);

const Notifications = () => {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('dismissedNotifications');
    if (stored) setDismissed(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('dismissedNotifications', JSON.stringify(dismissed));
  }, [dismissed]);

  const handleDismiss = (id) => {
    setDismissed((prev) => [...prev, id]);
  };

  const visibleNotifications = mockNotifications.filter(n => !dismissed.includes(n.id));

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        aria-label="Notifications"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        onClick={() => setOpen((o) => !o)}
      >
        {bellIcon}
        {visibleNotifications.length > 0 && (
          <span style={{ position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', borderRadius: '50%', fontSize: 12, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {visibleNotifications.length}
          </span>
        )}
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderRadius: 8, minWidth: 220, zIndex: 100 }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Notifications</div>
          {visibleNotifications.length === 0 ? (
            <div style={{ padding: '12px', color: '#888' }}>No new notifications</div>
          ) : (
            visibleNotifications.map(n => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #f5f5f5' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15 }}>{n.message}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{n.time}</div>
                </div>
                <button
                  onClick={() => handleDismiss(n.id)}
                  style={{ marginLeft: 8, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16 }}
                  title="Dismiss"
                >&#10005;</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
