import React, { useState, useEffect } from 'react';

const initialProfile = {
  name: '',
  city: '',
  radius: 10,
};

const UserProfile = () => {
  const [profile, setProfile] = useState(initialProfile);

  useEffect(() => {
    const stored = localStorage.getItem('userProfile');
    if (stored) setProfile(JSON.parse(stored));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: name === 'radius' ? Number(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '24px auto', padding: 16, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 style={{ margin: 0, fontSize: 22, textAlign: 'center' }}>User Profile</h2>
      <label style={{ fontSize: 15 }}>
        Name
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
          placeholder="Your name"
          style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }}
          autoComplete="off"
        />
      </label>
      <label style={{ fontSize: 15 }}>
        Location (City)
        <input
          type="text"
          name="city"
          value={profile.city}
          onChange={handleChange}
          placeholder="e.g. San Francisco"
          style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }}
          autoComplete="off"
        />
      </label>
      <label style={{ fontSize: 15 }}>
        Preferred Alert Radius (km)
        <input
          type="number"
          name="radius"
          value={profile.radius}
          onChange={handleChange}
          min={1}
          max={100}
          style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }}
        />
      </label>
      <button type="submit" style={{ padding: '12px 0', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 17, fontWeight: 500, cursor: 'pointer' }}>
        Save Profile
      </button>
    </form>
  );
};

export default UserProfile;
