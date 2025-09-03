import React, { useState, useEffect } from 'react';

const mockChecklist = [
  { id: 'water', label: 'Water bottle' },
  { id: 'mask', label: 'Mask' },
  { id: 'firstaid', label: 'First aid kit' },
  { id: 'idclothing', label: 'Avoid wearing identifiable clothing' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'phone', label: 'Charged phone & backup battery' },
  { id: 'cash', label: 'Some cash (in case cards don’t work)' },
  { id: 'contacts', label: 'Emergency contacts written down' },
];

const ActionPlan = () => {
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem('actionPlanChecked');
    if (stored) setChecked(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('actionPlanChecked', JSON.stringify(checked));
  }, [checked]);

  const handleToggle = (id) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '16px 8px' }}>
      <h2 style={{ textAlign: 'center', fontSize: 22, marginBottom: 16 }}>Action Plan Checklist</h2>
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 16 }}>
        {mockChecklist.map(item => (
          <label key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5', fontSize: 16 }}>
            <input
              type="checkbox"
              checked={!!checked[item.id]}
              onChange={() => handleToggle(item.id)}
              style={{ marginRight: 12, width: 20, height: 20 }}
            />
            <span style={{ textDecoration: checked[item.id] ? 'line-through' : 'none', color: checked[item.id] ? '#888' : '#222' }}>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ActionPlan;
