import React, { useState, useEffect } from 'react';

function getRandomSafetyData() {
  const weatherOptions = ['Sunny', 'Rainy', 'Cloudy', 'Windy', 'Stormy'];
  const trafficOptions = ['Low', 'Medium', 'High'];
  const weather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
  const traffic = trafficOptions[Math.floor(Math.random() * trafficOptions.length)];
  const risk = Math.floor(Math.random() * 10) + 1;
  return { weather, traffic, risk };
}

const SafetyForecast = () => {
  const [data, setData] = useState(getRandomSafetyData());

  useEffect(() => {
    // On reload, generate new mock data
    setData(getRandomSafetyData());
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: '32px auto', padding: 0 }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.10)', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <h2 style={{ margin: 0, fontSize: 22, textAlign: 'center', color: '#1976d2' }}>Safety Forecast</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 18 }}>
          <span>Weather:</span>
          <span style={{ fontWeight: 600 }}>{data.weather}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 18 }}>
          <span>Traffic:</span>
          <span style={{ fontWeight: 600 }}>{data.traffic}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 18 }}>
          <span>Risk Score:</span>
          <span style={{ fontWeight: 700, color: data.risk > 7 ? '#d32f2f' : data.risk > 4 ? '#fbc02d' : '#388e3c' }}>{data.risk}/10</span>
        </div>
      </div>
    </div>
  );
};

export default SafetyForecast;
