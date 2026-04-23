import AnimatedPage from '../components/AnimatedPage';
import { FaMapMarkedAlt, FaSearchLocation, FaLocationArrow, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useLanguage } from '../context/LanguageContext';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom User Location Icon
const UserIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color: #4f46e5; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Custom Listing Icon with dynamic label and color (XSS Safe)
const createListingIcon = (listing) => {
  let label = "";
  let color = "#10b981"; // Default Green for property

  if (listing.category === 'service') {
    label = listing.speciality || "Service";
    color = "#8b5cf6"; // Purple for service
  } else {
    label = `${listing.availableRooms || 0} Rooms`;
  }

  // Basic HTML escaping for security
  const safeLabel = label.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);

  return L.divIcon({
    className: 'custom-listing-marker',
    html: `<div style="background-color: ${color}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); white-space: nowrap;">${safeLabel}</div>`,
    iconSize: [safeLabel.length * 8 + 20, 28],
    iconAnchor: [(safeLabel.length * 8 + 20) / 2, 14]
  });
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

export default function Map() {
  const { t } = useLanguage();
  useDocumentTitle(`${t('map')} | Co-Spaces`);
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState([36.7538, 3.0588]); // Default to Algiers
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/listing/get?limit=1000`);
        setListings(res.data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };
    fetchListings();
  }, []);

  const handleGetLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setLoading(false);
        },
        (error) => {
          // Silent fallback to Algiers if location denied/fails
          setUserLocation([36.7538, 3.0588]);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      // Silent fallback
      setUserLocation([36.7538, 3.0588]);
      setLoading(false);
    }
  };

  // Removed auto-location on mount so the map loads instantly in Algiers

  const nearbyListings = useMemo(() => {
    if (!userLocation || listings.length === 0) return [];

    return listings.filter(listing => {
      return listing.latitude && listing.longitude;
    });
  }, [userLocation, listings]);

  return (
    <AnimatedPage>
      <div className='min-h-[calc(100vh-80px)] pt-24 pb-10 px-4 max-w-7xl mx-auto flex flex-col'>
        <div className='mb-6 flex justify-between items-end flex-wrap gap-4'>
          <div>
            <h1 className='text-3xl font-extrabold text-slate-900 mb-2'>{t('map_title') || 'Interactive Map'}</h1>
            <p className='text-slate-500 font-light max-w-2xl'>
              {t('map_subtitle') || 'Find co-working spaces near you.'}
            </p>
          </div>
          <button
            onClick={handleGetLocation}
            className='flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-semibold hover:bg-indigo-100 transition-colors shadow-sm'
          >
            <FaLocationArrow /> {t('locate_me') || 'Locate Me'}
          </button>
        </div>

        <div className='flex-1 bg-slate-50 border border-slate-200 rounded-3xl shadow-sm overflow-hidden relative flex flex-col min-h-[600px]'>
          {loading && (
            <div className='absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white/80 backdrop-blur-sm z-[500]'>
              <div className='w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4'></div>
              <p className='text-slate-800 font-bold'>{t('locating_you') || 'Locating you...'}</p>
            </div>
          )}
          <MapContainer
            center={userLocation}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', minHeight: '600px', width: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <RecenterMap position={userLocation} />

            {/* User Location Marker */}
            <Marker position={userLocation} icon={UserIcon}>
              <Popup>
                <div className="font-bold text-slate-800">{t('you_are_here') || 'You are here'}</div>
              </Popup>
            </Marker>

            {/* Nearby Listings Markers */}
            {nearbyListings.map(listing => (
              <Marker
                key={listing._id}
                position={[listing.latitude, listing.longitude]}
                icon={createListingIcon(listing)}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                  <div className="font-bold text-indigo-600 px-1">{listing.name}</div>
                </Tooltip>
                <Popup className="custom-popup" closeButton={false}>
                  <div className=" group/card bg-white rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-300 border border-slate-100">
                    {/* Image Section */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={listing.imageUrls[0]}
                        alt={listing.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                      />
                      {/* Overlay Gradients */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${listing.category === 'service' ? 'bg-purple-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
                          {listing.category === 'service' ? t('service') : t('property')}
                        </span>
                        {listing.offer && (
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
                            {t('offer') || 'OFFER'}
                          </span>
                        )}
                      </div>

                      {/* Bottom Info on Image */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-1 text-white/90 text-[10px] mb-1 font-medium">
                          <FaMapMarkerAlt className="text-white/70" />
                          <span className="truncate">{listing.address}</span>
                        </div>
                        <h3 className="text-white font-bold text-lg leading-tight truncate drop-shadow-md">
                          {listing.name}
                        </h3>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('price')}</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-slate-900">
                              {listing.discountPrice > 0 ? listing.discountPrice : listing.regularPrice}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{t('currency') || 'DA'}</span>
                          </div>
                        </div>

                        {/* Info Badge */}
                        <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2">
                          {listing.category === 'service' ? (
                            <span className="text-[10px] font-bold text-purple-600">{listing.speciality || 'Service'}</span>
                          ) : (
                            <div className="flex items-center gap-1.5 text-emerald-600">
                              <span className="text-xs font-black">{listing.availableRooms || 0}</span>
                              <span className="text-[10px] font-bold uppercase tracking-tighter">{t('rooms') || 'Rooms'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => navigate(`/listing/${listing._id}`)}
                        className="w-full bg-slate-900 text-white py-3 rounded-2xl text-xs font-bold hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-lg shadow-slate-200"
                      >
                        {t('view_details') || 'Explore Space'}
                        <FaArrowRight className="text-[10px] transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <div className="absolute bottom-6 right-6 z-[400] bg-white p-3 rounded-2xl shadow-lg border border-slate-100 flex flex-col gap-2 pointer-events-none">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{t('you_map') || 'You'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#10b981] rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{t('property') || 'Property'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#8b5cf6] rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{t('service') || 'Service'}</span>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
