import React, { useState, useEffect } from 'react';

const relationships = ['Mom', 'Dad', 'Friend', 'Sibling', 'Colleague', 'Partner', 'Other'];

function getRandomLocation() {
  // Mock: random US city or coordinates
  const cities = [
    { city: 'San Francisco', coords: [37.7749, -122.4194] },
    { city: 'New York', coords: [40.7128, -74.0060] },
    { city: 'Chicago', coords: [41.8781, -87.6298] },
    { city: 'Austin', coords: [30.2672, -97.7431] },
    { city: 'Seattle', coords: [47.6062, -122.3321] },
    { city: 'Miami', coords: [25.7617, -80.1918] },
  ];
  const pick = cities[Math.floor(Math.random() * cities.length)];
  return { city: pick.city, coords: pick.coords };
}

const Community = () => {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: relationships[0], location: getRandomLocation() });

  useEffect(() => {
    const stored = localStorage.getItem('communityMembers');
    if (stored) setMembers(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('communityMembers', JSON.stringify(members));
  }, [members]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    setMembers((prev) => [...prev, { ...form, location: getRandomLocation() }]);
    setForm({ name: '', relationship: relationships[0], location: getRandomLocation() });
    setShowForm(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '16px 8px' }}>
      <h2 style={{ textAlign: 'center', fontSize: 22, marginBottom: 16 }}>Community Members</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {members.length === 0 && <div style={{ color: '#888', textAlign: 'center' }}>No members added yet.</div>}
        {members.map((m, idx) => (
          <div key={idx} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{m.name}</div>
            <div style={{ fontSize: 15, color: '#1976d2' }}>{m.relationship}</div>
            <div style={{ fontSize: 14, color: '#555' }}>Location: {m.location.city} ({m.location.coords[0].toFixed(2)}, {m.location.coords[1].toFixed(2)})</div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setShowForm(true)}
        style={{ margin: '24px auto 0 auto', display: 'block', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontSize: 17, fontWeight: 500, padding: '12px 28px', cursor: 'pointer' }}
      >
        Add Member
      </button>
      {showForm && (
        <form onSubmit={handleAdd} style={{ marginTop: 18, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ fontSize: 15 }}>
            Name
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Member name"
              style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }}
            />
          </label>
          <label style={{ fontSize: 15 }}>
            Relationship
            <select
              name="relationship"
              value={form.relationship}
              onChange={handleChange}
              style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }}
            >
              {relationships.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <button type="submit" style={{ padding: '12px 0', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontSize: 17, fontWeight: 500, cursor: 'pointer' }}>
            Save Member
          </button>
        </form>
      )}
    </div>
  );
};

export default Community;
