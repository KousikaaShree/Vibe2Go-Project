import { useState, useEffect } from "react";
import API from "../api/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaMapMarkerAlt, FaSearch, FaArrowLeft, FaLocationArrow, FaWalking, FaCar, FaCity, FaMountain } from "react-icons/fa";

// Fix for default marker icon in react-leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const activityIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const foodIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function Outdoor() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [selections, setSelections] = useState({
    vibe: "",
    timeOfDay: "",
    locationMode: "", // 'current' or 'search'
    latitude: null,
    longitude: null,
    distance: 5,
    energyLevel: "Medium"
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [results, setResults] = useState({ activities: [], food: [] });
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCoords, setManualCoords] = useState({ lat: "", lng: "" });

  const vibes = [
    { name: "Chill", icon: "😌", desc: "Relaxed and peaceful" },
    { name: "Energetic", icon: "⚡", desc: "Active and lively" },
    { name: "Social", icon: "🎉", desc: "Fun with friends" },
    { name: "Romantic", icon: "❤️", desc: "Cozy and intimate" },
    { name: "Solo Recharge", icon: "🌿", desc: "Me-time in nature" }
  ];

  const times = [
    { name: "Morning", icon: "🌅" },
    { name: "Afternoon", icon: "☀️" },
    { name: "Evening", icon: "🌇" },
    { name: "Night", icon: "🌙" }
  ];

  const distances = [
    { value: 1, label: "Walkable", icon: <FaWalking /> },
    { value: 5, label: "Short Drive", icon: <FaCar /> },
    { value: 10, label: "City Trip", icon: <FaCity /> },
    { value: 20, label: "Adventure", icon: <FaMountain /> },
    { value: 50, label: "Day Trip", icon: <FaMapMarkerAlt /> }
  ];

  const handleVibeSelect = (vibe) => {
    const backendVibe = vibe.name === "Solo Recharge" ? "Nature" : vibe.name;
    setSelections({ ...selections, vibe: backendVibe });
    setStep(1);
  };

  const handleTimeSelect = (time) => {
    setSelections({ ...selections, timeOfDay: time.name.toLowerCase() });
    setStep(2);
  };

  const handleLocationSelect = async (mode) => {
    if (mode === 'current') {
      setLoading(true);
      
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser. Please use search.");
        setLoading(false);
        return;
      }

      // Try high accuracy first, then fallback to lower accuracy
      const tryGetLocation = (highAccuracy = true, retryCount = 0) => {
        const geoOptions = {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 30000 : 20000, // 30s for high accuracy, 20s for fallback
          maximumAge: highAccuracy ? 0 : 60000 // Allow 1 minute old cache for fallback
        };

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const accuracy = pos.coords.accuracy;
            
            console.log("Detected location:", { 
              lat, 
              lng, 
              accuracy: `${accuracy.toFixed(0)}m`,
              highAccuracy: highAccuracy 
            });
            
            // Verify location with reverse geocoding to show user where they are
            try {
              const reverseGeocode = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                { timeout: 10000 }
              );
              
              const locationName = reverseGeocode.data?.display_name || "Your location";
              console.log("Location verified as:", locationName);
              
              // Show confirmation to user with accuracy info
              const accuracyInfo = accuracy < 100 ? " (very accurate)" : accuracy < 1000 ? " (accurate)" : " (approximate)";
              const confirmed = window.confirm(
                `Location detected: ${locationName}${accuracyInfo}\n\nAccuracy: ~${accuracy.toFixed(0)} meters\n\nIs this correct? Click OK to continue or Cancel to search manually.`
              );
              
              if (confirmed) {
                setSelections({
                  ...selections,
                  locationMode: 'current',
                  latitude: lat,
                  longitude: lng
                });
                setLoading(false);
                setStep(3);
              } else {
                setLoading(false);
                setSelections({ ...selections, locationMode: 'search' });
              }
            } catch (error) {
              console.error("Reverse geocoding error:", error);
              // Still proceed with coordinates even if reverse geocoding fails
              const confirmed = window.confirm(
                `Location detected at coordinates:\nLatitude: ${lat.toFixed(6)}\nLongitude: ${lng.toFixed(6)}\nAccuracy: ~${accuracy.toFixed(0)} meters\n\nContinue with this location?`
              );
              
              if (confirmed) {
                setSelections({
                  ...selections,
                  locationMode: 'current',
                  latitude: lat,
                  longitude: lng
                });
                setLoading(false);
                setStep(3);
              } else {
                setLoading(false);
                setSelections({ ...selections, locationMode: 'search' });
              }
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            
            // If high accuracy failed and we haven't tried fallback, try with lower accuracy
            if (highAccuracy && error.code === error.TIMEOUT && retryCount === 0) {
              console.log("High accuracy timed out, trying with lower accuracy...");
              tryGetLocation(false, 1);
              return;
            }
            
            let errorMessage = "Location access denied. Please use search.";
            
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied. Please enable location access in your browser settings or use search.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information unavailable. Please check your device's location services or use search.";
                break;
              case error.TIMEOUT:
                errorMessage = "Location request timed out. This might be due to:\n- GPS signal is weak\n- Location services are disabled\n- Network issues\n\nPlease try again or use the search option.";
                break;
              default:
                errorMessage = "An unknown error occurred. Please use search.";
                break;
            }
            
            alert(errorMessage);
            setLoading(false);
          },
          geoOptions
        );
      };

      // Start with high accuracy
      tryGetLocation(true);
    } else {
      setSelections({ ...selections, locationMode: 'search' });
    }
  };

  // Search Location with Nominatim
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
          setSearchResults(res.data);
        } catch (error) {
          console.error("Search error", error);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const selectCity = (city) => {
    setSelections({
      ...selections,
      latitude: parseFloat(city.lat),
      longitude: parseFloat(city.lon)
    });
    setStep(3);
  };

  const handleManualCoordsSubmit = () => {
    const lat = parseFloat(manualCoords.lat);
    const lng = parseFloat(manualCoords.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert("Please enter valid coordinates (numbers only)");
      return;
    }
    
    if (lat < -90 || lat > 90) {
      alert("Latitude must be between -90 and 90");
      return;
    }
    
    if (lng < -180 || lng > 180) {
      alert("Longitude must be between -180 and 180");
      return;
    }
    
    setSelections({
      ...selections,
      locationMode: 'manual',
      latitude: lat,
      longitude: lng
    });
    setShowManualInput(false);
    setManualCoords({ lat: "", lng: "" });
    setStep(3);
  };

  const handleDistanceSelect = (dist) => {
    setSelections({ ...selections, distance: dist });
    fetchSuggestions(dist);
  };

  const fetchSuggestions = async (dist) => {
    setLoading(true);
    setStep(4);
    try {
      // Validate coordinates before sending
      if (!selections.latitude || !selections.longitude) {
        alert("Location not set. Please select a location first.");
        setLoading(false);
        setStep(2); // Go back to location selection
        return;
      }

      const requestData = {
        latitude: parseFloat(selections.latitude),
        longitude: parseFloat(selections.longitude),
        vibes: selections.vibe ? [selections.vibe] : ["Chill"],
        timeOfDay: selections.timeOfDay,
        energyLevel: selections.energyLevel,
        distance: dist
      };
      
      console.log("📍 Sending request with coordinates:", {
        latitude: requestData.latitude,
        longitude: requestData.longitude,
        locationMode: selections.locationMode,
        distance: requestData.distance,
        vibe: requestData.vibes
      });
      
      const res = await API.post("/outdoor/suggestions", requestData, {
        timeout: 60000 // 60 second timeout for API call
      });
      
      console.log("✅ Received response:", res.data);
      console.log("Activities count:", res.data?.activities?.length || 0);
      console.log("Food count:", res.data?.food?.length || 0);
      
      if (res.data) {
        const activities = res.data.activities || [];
        const food = res.data.food || [];
        
        setResults({
          activities: activities,
          food: food
        });
        
        // Show message if no results found
        if (activities.length === 0 && food.length === 0) {
          const message = res.data.message || "No places found in this area. Try increasing the distance or selecting a different location.";
          alert(message);
        } else {
          console.log(`✅ Successfully loaded ${activities.length} activities and ${food.length} food places`);
        }
      } else {
        console.warn("⚠️ Unexpected response format:", res.data);
        setResults({ activities: [], food: [] });
        alert("Received unexpected response format. Check browser console (F12) for details.");
      }
    } catch (err) {
      console.error("❌ Error fetching suggestions:", err);
      console.error("Error response:", err.response);
      console.error("Error details:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error message:", err.message);
      
      let errorMessage = "Error finding places: ";
      
      if (err.response) {
        // Server responded with error
        errorMessage += err.response.data?.error || `Server error (${err.response.status})`;
        if (err.response.status === 401) {
          errorMessage += "\n\nPlease log in again.";
        } else if (err.response.status === 400) {
          errorMessage += "\n\nPlease check your location coordinates.";
        }
      } else if (err.request) {
        // Request made but no response
        errorMessage += "No response from server. Please check:\n- Is the backend server running?\n- Check your network connection";
      } else {
        // Error setting up request
        errorMessage += err.message || "Unknown error occurred";
      }
      
      alert(errorMessage);
      setResults({ activities: [], food: [] });
      setLoading(false);
      // Don't go back automatically, let user decide
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="container py-5">
      <div className="d-flex align-items-center justify-content-between mb-4">
         {step > 0 && (
           <button onClick={goBack} className="btn btn-light rounded-circle shadow-sm" style={{ width: 40, height: 40 }}>
             <FaArrowLeft />
           </button>
         )}
         <div className="flex-grow-1 text-center">
            <h2 className="fw-bold mb-0">Outdoor Planner 🌿</h2>
            <p className="text-muted small mb-0">Step {step + 1} of 5</p>
         </div>
         <div style={{ width: 40 }}></div> {/* Spacer */}
      </div>

      <div className="progress mb-5" style={{ height: "6px" }}>
        <div 
          className="progress-bar bg-primary" 
          role="progressbar" 
          style={{ width: `${((step + 1) / 5) * 100}%`, transition: "width 0.5s ease" }}
        ></div>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="row justify-content-center"
          >
            <div className="col-12 text-center mb-4">
              <h3 className="mb-3">How are you feeling today?</h3>
            </div>
            {vibes.map((v, i) => (
              <div key={i} className="col-md-4 col-sm-6 mb-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="card glass-card h-100 text-center cursor-pointer border-0 shadow-sm"
                  onClick={() => handleVibeSelect(v)}
                >
                  <div className="display-4 mb-3">{v.icon}</div>
                  <h4 className="fw-bold">{v.name}</h4>
                  <p className="text-muted small">{v.desc}</p>
                </motion.div>
              </div>
            ))}
          </motion.div>
        )}

        {step === 1 && (
          <motion.div 
             key="step1"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="row justify-content-center"
          >
            <div className="col-12 text-center mb-4">
              <h3 className="mb-3">When do you want to go?</h3>
            </div>
            {times.map((t, i) => (
              <div key={i} className="col-md-3 col-6 mb-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="card glass-card h-100 text-center cursor-pointer border-0 shadow-sm"
                  onClick={() => handleTimeSelect(t)}
                >
                  <div className="display-4 mb-3">{t.icon}</div>
                  <h5 className="fw-bold">{t.name}</h5>
                </motion.div>
              </div>
            ))}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
             key="step2"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="row justify-content-center"
          >
            <div className="col-12 text-center mb-4">
              <h3 className="mb-3">Where should we start?</h3>
            </div>
            
            <div className="col-md-5 mb-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="card glass-card text-center p-4 cursor-pointer border-primary border-2"
                onClick={() => handleLocationSelect('current')}
              >
                <FaLocationArrow size={40} className="text-primary mb-3 mx-auto"/>
                <h5>Use Current Location</h5>
                <p className="text-muted small">Find spots around me now</p>
                {loading && <div className="spinner-border text-primary mx-auto mt-2" role="status"></div>}
              </motion.div>
            </div>

            <div className="col-md-1 d-flex align-items-center justify-content-center">
              <span className="text-muted fw-bold">OR</span>
            </div>

            <div className="col-md-5 mb-4">
               <div className="card glass-card p-4">
                  <div className="d-flex align-items-center mb-3 justify-content-center">
                    <FaSearch size={30} className="text-secondary mb-2"/>
                  </div>
                  <h5 className="text-center mb-3">Search City / Area</h5>
                  <input 
                    type="text" 
                    className="form-control rounded-pill text-center mb-3" 
                    placeholder="e.g. Paris, Tokyo, T. Nagar" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchResults.length > 0 && (
                    <ul className="list-group mt-3 shadow-sm position-absolute w-100" style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto", left: 0 }}>
                      {searchResults.map((city, i) => (
                        <li key={i} className="list-group-item list-group-item-action cursor-pointer" onClick={() => selectCity(city)}>
                          {city.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {/* Manual Coordinate Input */}
                  <div className="mt-3 pt-3 border-top">
                    <button 
                      type="button"
                      className="btn btn-link text-decoration-none p-0 w-100 text-muted small"
                      onClick={() => setShowManualInput(!showManualInput)}
                    >
                      {showManualInput ? "▼ Hide" : "▲ Show"} Manual Coordinates
                    </button>
                    
                    {showManualInput && (
                      <div className="mt-3">
                        <div className="row g-2">
                          <div className="col-6">
                            <label className="form-label small text-muted">Latitude</label>
                            <input 
                              type="number" 
                              step="any"
                              className="form-control form-control-sm" 
                              placeholder="e.g. 13.0827"
                              value={manualCoords.lat}
                              onChange={(e) => setManualCoords({ ...manualCoords, lat: e.target.value })}
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small text-muted">Longitude</label>
                            <input 
                              type="number" 
                              step="any"
                              className="form-control form-control-sm" 
                              placeholder="e.g. 80.2707"
                              value={manualCoords.lng}
                              onChange={(e) => setManualCoords({ ...manualCoords, lng: e.target.value })}
                            />
                          </div>
                        </div>
                        <button 
                          type="button"
                          className="btn btn-primary btn-sm w-100 mt-2"
                          onClick={handleManualCoordsSubmit}
                          disabled={!manualCoords.lat || !manualCoords.lng}
                        >
                          Use These Coordinates
                        </button>
                        <p className="small text-muted mt-2 mb-0">
                          Tip: You can get coordinates from Google Maps by right-clicking a location
                        </p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
             key="step3"
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             className="row justify-content-center"
          >
             <div className="col-12 text-center mb-4">
              <h3 className="mb-3">How far are you willing to travel?</h3>
              {selections.latitude && selections.longitude && (
                <p className="text-muted small mb-0">
                  📍 Location: {selections.latitude.toFixed(6)}, {selections.longitude.toFixed(6)}
                  {selections.locationMode === 'current' && ' (Current Location)'}
                  {selections.locationMode === 'manual' && ' (Manual Entry)'}
                </p>
              )}
            </div>
            {distances.map((d, i) => (
              <div key={i} className="col-md-4 mb-3">
                 <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-outline-custom w-100 py-4 d-flex flex-column align-items-center gap-2"
                    onClick={() => handleDistanceSelect(d.value)}
                 >
                   <span className="fs-3">{d.icon}</span>
                   <span className="fw-bold">{d.label} ({d.value} km)</span>
                 </motion.button>
              </div>
            ))}
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
             key="step4"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="row g-4"
          >
             {loading ? (
                <div className="col-12 text-center py-5">
                   <div className="spinner-border text-primary mb-3" role="status" style={{ width: "3rem", height: "3rem" }}></div>
                   <h4>Curating your perfect experience...</h4>
                </div>
             ) : (
                <>
                  {/* Left Column: Results List */}
                  <div className="col-lg-4 order-2 order-lg-1 h-100">
                    <div className="d-flex flex-column gap-3" style={{ maxHeight: "80vh", overflowY: "auto", paddingRight: "10px" }}>
                       
                       <h4 className="fw-bold text-success mb-2 sticky-top bg-white py-2" style={{ zIndex: 10 }}>🌿 Activities & Experiences</h4>
                       {results.activities.length === 0 && <p className="text-muted">No activities found nearby. Try increasing the distance!</p>}
                       {results.activities.map((r, i) => (
                          <motion.div 
                            key={`act-${i}`} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card shadow-sm border-0 result-card border-activity"
                          >
                             <div className="card-body">
                                <h5 className="card-title fw-bold text-dark">{r.name}</h5>
                                <p className="text-success small fw-bold mb-1"><span className="badge bg-success me-2">{r.type}</span> {r.experience}</p>
                                <p className="text-muted small mb-2">{r.address || "Address not available"}</p>
                                <a 
                                  href={`https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-success rounded-pill"
                                >
                                  View on Google Maps
                                </a>
                             </div>
                          </motion.div>
                       ))}

                       <h4 className="fw-bold text-warning mb-2 mt-4 sticky-top bg-white py-2" style={{ zIndex: 10 }}>🍽️ Food & Drinks</h4>
                       {results.food.length === 0 && <p className="text-muted">No food spots found nearby.</p>}
                       {results.food.map((r, i) => (
                          <motion.div 
                            key={`food-${i}`} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card shadow-sm border-0 result-card border-food"
                          >
                             <div className="card-body">
                                <h5 className="card-title fw-bold text-dark">{r.name}</h5>
                                <p className="text-warning small fw-bold mb-1"><span className="badge bg-warning text-dark me-2">{r.type}</span> {r.experience}</p>
                                <p className="text-muted small mb-2">{r.address || "Address not available"}</p>
                                <a 
                                  href={`https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-warning text-dark rounded-pill"
                                >
                                  View on Google Maps
                                </a>
                             </div>
                          </motion.div>
                       ))}
                    </div>
                  </div>

                  {/* Right Column: Map */}
                  <div className="col-lg-8 order-1 order-lg-2">
                    <div className="card border-0 shadow-lg overflow-hidden" style={{ borderRadius: "20px", height: "80vh" }}>
                       <MapContainer 
                          center={[selections.latitude || 20, selections.longitude || 78]} 
                          zoom={selections.latitude ? 15 : 13} 
                          style={{ height: "100%", width: "100%" }}
                          key={`${selections.latitude}-${selections.longitude}`}
                       >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          {/* User Location */}
                          {selections.latitude && selections.longitude && (
                             <Marker position={[selections.latitude, selections.longitude]}>
                                <Popup>
                                  <div className="text-center">
                                    <strong>📍 Your Location</strong>
                                    <br />
                                    <small className="text-muted">
                                      {selections.locationMode === 'current' 
                                        ? 'Current location detected' 
                                        : 'Selected location'}
                                    </small>
                                  </div>
                                </Popup>
                             </Marker>
                          )}
                          
                          {/* Activities */}
                          {results.activities.map((r, i) => (
                            <Marker key={`m-act-${i}`} position={[r.latitude, r.longitude]} icon={activityIcon}>
                               <Popup>
                                  <div className="text-center">
                                     <h6>{r.name}</h6>
                                     <p className="m-0 text-muted small">{r.experience}</p>
                                     <span className="badge bg-success">{r.type}</span>
                                  </div>
                               </Popup>
                            </Marker>
                          ))}

                          {/* Food */}
                          {results.food.map((r, i) => (
                            <Marker key={`m-food-${i}`} position={[r.latitude, r.longitude]} icon={foodIcon}>
                               <Popup>
                                  <div className="text-center">
                                     <h6>{r.name}</h6>
                                     <p className="m-0 text-muted small">{r.experience}</p>
                                     <span className="badge bg-warning text-dark">{r.type}</span>
                                  </div>
                               </Popup>
                            </Marker>
                          ))}
                       </MapContainer>
                    </div>
                  </div>
                </>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
