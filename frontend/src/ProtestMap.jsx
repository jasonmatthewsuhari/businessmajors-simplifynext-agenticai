import React, { useEffect, useState } from 'react';
import Notifications from './Notifications';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icon for Leaflet in React
const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
import 'leaflet/dist/leaflet.css';

// Mock protest data
const protests = [
  {
    id: 1,
    name: 'Climate Action Rally',
    description: 'Demanding urgent climate policy changes.',
    lat: 37.7749,
    lng: -122.4194,
    organizer: 'Youth for Climate',
  },
  {
    id: 2,
    name: 'Workers Rights March',
    description: 'Advocating for fair wages and safe working conditions.',
    lat: 34.0522,
    lng: -118.2437,
    organizer: 'Labor Union',
  },
  {
    id: 3,
    name: 'Education Reform Protest',
    description: 'Calling for better funding for public schools.',
    lat: 40.7128,
    lng: -74.0060,
    organizer: 'Teachers United',
  },
];

const ProtestMap = () => {
  const [userLocation, setUserLocation] = useState({ lat: 39.8283, lng: -98.5795 }); // Default: center of USA

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <header style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 1000, background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '8px 16px', boxSizing: 'border-box', height: 56 }}>
        <Notifications />
      </header>
      <div style={{ height: '100%', width: '100%' }}>
        <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={4} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {/* Custom zoom control at bottom right */}
          <div className="leaflet-bottom leaflet-right">
            {/* The zoom control will be rendered here by Leaflet automatically */}
          </div>
          {/* User location marker */}
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>Your Location</Popup>
          </Marker>
          {/* Protest markers */}
          {protests.map((protest) => (
            <Marker key={protest.id} position={[protest.lat, protest.lng]}>
              <Popup>
                <strong>{protest.name}</strong><br />
                {protest.description}<br />
                <em>Organizer: {protest.organizer}</em>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default ProtestMap;
