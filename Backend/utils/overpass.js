const axios = require("axios");

const fetchPlaces = async (lat, lng, radius, vibes = []) => {
  // Ensure coordinates are numbers
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  if (isNaN(latitude) || isNaN(longitude)) {
    console.error("Invalid coordinates provided:", { lat, lng });
    return [];
  }
  
  // Map vibes to Overpass QL queries - using both node and way/relation
  const vibeMappings = {
    "Chill": [
      `node["amenity"="cafe"](around:${radius},${latitude},${longitude});`,
      `way["amenity"="cafe"](around:${radius},${latitude},${longitude});`,
      `node["leisure"="park"](around:${radius},${latitude},${longitude});`,
      `way["leisure"="park"](around:${radius},${latitude},${longitude});`,
      `node["amenity"="library"](around:${radius},${latitude},${longitude});`,
      `way["amenity"="library"](around:${radius},${latitude},${longitude});`,
      `node["tourism"="museum"](around:${radius},${latitude},${longitude});`,
      `way["tourism"="museum"](around:${radius},${latitude},${longitude});`,
      `node["tourism"="gallery"](around:${radius},${latitude},${longitude});`,
      `way["tourism"="gallery"](around:${radius},${latitude},${longitude});`,
      `node["amenity"="cinema"](around:${radius},${latitude},${longitude});`,
      `way["amenity"="cinema"](around:${radius},${latitude},${longitude});`,
      `node["leisure"="garden"](around:${radius},${latitude},${longitude});`,
      `way["leisure"="garden"](around:${radius},${latitude},${longitude});`,
      `node["shop"="bookstore"](around:${radius},${latitude},${longitude});`,
      `way["shop"="bookstore"](around:${radius},${latitude},${longitude});`,
      `node["tourism"="attraction"](around:${radius},${latitude},${longitude});`,
      `way["tourism"="attraction"](around:${radius},${latitude},${longitude});`,
      `node["amenity"="theatre"](around:${radius},${latitude},${longitude});`,
      `way["amenity"="theatre"](around:${radius},${latitude},${longitude});`,
      `node["amenity"="community_centre"](around:${radius},${latitude},${longitude});`,
      `way["amenity"="community_centre"](around:${radius},${latitude},${longitude});`
    ],
    "Energetic": [
      `node["leisure"="sports_centre"](around:${radius},${latitude},${longitude});`,
      `way["leisure"="sports_centre"](around:${radius},${latitude},${longitude});`,
      `node["leisure"="fitness_centre"](around:${radius},${latitude},${longitude});`,
      `way["leisure"="fitness_centre"](around:${radius},${latitude},${longitude});`,
      `node["leisure"="stadium"](around:${radius},${latitude},${longitude});`,
      `way["leisure"="stadium"](around:${radius},${latitude},${longitude});`,
      `node["leisure"="swimming_pool"](around:${radius},${latitude},${longitude});`,
      `way["leisure"="swimming_pool"](around:${radius},${latitude},${longitude});`,
      `node["leisure"="playground"](around:${radius},${latitude},${longitude});`,
      `way["leisure"="playground"](around:${radius},${latitude},${longitude});`,
      `node["sport"](around:${radius},${latitude},${longitude});`,
      `way["sport"](around:${radius},${latitude},${longitude});`
    ],
    "Nature": [
      `node["leisure"="park"](around:${radius},${latitude},${longitude});`,
      `way["leisure"="park"](around:${radius},${latitude},${longitude});`,
      `node["natural"="beach"](around:${radius},${latitude},${longitude});`,
      `way["natural"="beach"](around:${radius},${latitude},${longitude});`,
      `node["leisure"="nature_reserve"](around:${radius},${latitude},${longitude});`,
      `way["leisure"="nature_reserve"](around:${radius},${latitude},${longitude});`,
      `node["tourism"="zoo"](around:${radius},${latitude},${longitude});`,
      `way["tourism"="zoo"](around:${radius},${latitude},${longitude});`,
      `node["tourism"="picnic_site"](around:${radius},${latitude},${longitude});`,
      `way["tourism"="picnic_site"](around:${radius},${latitude},${longitude});`
    ],
    "Romantic": [
      `node["tourism"="viewpoint"](around:${radius},${latitude},${longitude});`,
      `way["tourism"="viewpoint"](around:${radius},${latitude},${longitude});`,
      `node["amenity"="restaurant"](around:${radius},${latitude},${longitude});`,
      `way["amenity"="restaurant"](around:${radius},${latitude},${longitude});`,
      `node["natural"="beach"](around:${radius},${latitude},${longitude});`,
      `way["natural"="beach"](around:${radius},${latitude},${longitude});`,
      `node["leisure"="garden"](around:${radius},${latitude},${longitude});`,
      `way["leisure"="garden"](around:${radius},${latitude},${longitude});`
    ],
    "Social": [
      `node["amenity"="pub"](around:${radius},${latitude},${longitude});`,
      `way["amenity"="pub"](around:${radius},${latitude},${longitude});`,
      `node["amenity"="bar"](around:${radius},${latitude},${longitude});`,
      `way["amenity"="bar"](around:${radius},${latitude},${longitude});`,
      `node["amenity"="cafe"](around:${radius},${latitude},${longitude});`,
      `way["amenity"="cafe"](around:${radius},${latitude},${longitude});`,
      `node["amenity"="restaurant"](around:${radius},${latitude},${longitude});`,
      `way["amenity"="restaurant"](around:${radius},${latitude},${longitude});`,
      `node["amenity"="food_court"](around:${radius},${latitude},${longitude});`,
      `way["amenity"="food_court"](around:${radius},${latitude},${longitude});`,
      `node["shop"="mall"](around:${radius},${latitude},${longitude});`,
      `way["shop"="mall"](around:${radius},${latitude},${longitude});`,
      `node["amenity"="nightclub"](around:${radius},${latitude},${longitude});`,
      `way["amenity"="nightclub"](around:${radius},${latitude},${longitude});`,
      `node["shop"="bakery"](around:${radius},${latitude},${longitude});`,
      `way["shop"="bakery"](around:${radius},${latitude},${longitude});`
    ]
  };

  let queries = [];

  // If vibes are provided, add corresponding queries
  if (vibes && vibes.length > 0) {
    vibes.forEach(vibe => {
      if (vibeMappings[vibe]) {
        queries = [...queries, ...vibeMappings[vibe]];
      }
    });
  }

  // Fallback if no vibes match or none provided
  if (queries.length === 0) {
    queries = [
      `node["leisure"="park"](around:${radius},${latitude},${longitude});`,
      `way["leisure"="park"](around:${radius},${latitude},${longitude});`,
      `node["amenity"="cafe"](around:${radius},${latitude},${longitude});`,
      `way["amenity"="cafe"](around:${radius},${latitude},${longitude});`,
      `node["tourism"="viewpoint"](around:${radius},${latitude},${longitude});`,
      `way["tourism"="viewpoint"](around:${radius},${latitude},${longitude});`,
      `node["amenity"="restaurant"](around:${radius},${latitude},${longitude});`,
      `way["amenity"="restaurant"](around:${radius},${latitude},${longitude});`
    ];
  }

  // Remove duplicates
  queries = [...new Set(queries)];

  // Build proper Overpass QL query
  const query = `
[out:json][timeout:30];
(
  ${queries.join("\n  ")}
);
out center meta;
`;

  try {
    console.log(`Fetching places for lat: ${latitude}, lng: ${longitude}, radius: ${radius}m, vibes: ${vibes.join(", ") || "default"}`);
    console.log(`Query has ${queries.length} sub-queries`);
    
    const response = await axios.post(
      "https://overpass-api.de/api/interpreter",
      query,
      { 
        headers: { "Content-Type": "text/plain" },
        timeout: 30000
      }
    );
    
    if (!response.data) {
      console.warn("Overpass API returned no data:", response);
      return [];
    }
    
    if (!response.data.elements || !Array.isArray(response.data.elements)) {
      console.warn("Overpass API returned unexpected format:", response.data);
      return [];
    }
    
    console.log(`Overpass API returned ${response.data.elements.length} elements`);
    
    // Process both nodes and ways - for ways, use center coordinates
    const places = response.data.elements
      .map(element => {
        let lat, lon;
        
        if (element.type === 'node' && element.lat !== undefined && element.lon !== undefined) {
          lat = parseFloat(element.lat);
          lon = parseFloat(element.lon);
        } else if ((element.type === 'way' || element.type === 'relation') && element.center) {
          lat = parseFloat(element.center.lat);
          lon = parseFloat(element.center.lon);
        } else {
          return null;
        }
        
        // Validate coordinates
        if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
          console.warn("Invalid coordinates in element:", element);
          return null;
        }
        
        // Only include places with tags (they have useful information)
        if (!element.tags || Object.keys(element.tags).length === 0) {
          return null;
        }
        
        return {
          ...element,
          lat: lat,
          lon: lon
        };
      })
      .filter(Boolean)
    
    console.log(`Found ${places.length} places for vibe(s): ${vibes.join(", ") || "default"}`);
    
    // If we got very few results, try a simpler query as fallback
    if (places.length < 3) {
      console.log("Few results found, trying broader search...");
      const fallbackQuery = `
[out:json][timeout:30];
(
  node["amenity"](around:${radius},${latitude},${longitude});
  way["amenity"](around:${radius},${latitude},${longitude});
  node["leisure"](around:${radius},${latitude},${longitude});
  way["leisure"](around:${radius},${latitude},${longitude});
  node["tourism"](around:${radius},${latitude},${longitude});
  way["tourism"](around:${radius},${latitude},${longitude});
  node["shop"](around:${radius},${latitude},${longitude});
  way["shop"](around:${radius},${latitude},${longitude});
);
out center meta;
`;
      
      try {
        const fallbackResponse = await axios.post(
          "https://overpass-api.de/api/interpreter",
          fallbackQuery,
          { 
            headers: { "Content-Type": "text/plain" },
            timeout: 30000
          }
        );
        
        if (fallbackResponse.data && fallbackResponse.data.elements && Array.isArray(fallbackResponse.data.elements)) {
          const fallbackPlaces = fallbackResponse.data.elements
            .map(element => {
              let lat, lon;
              
              if (element.type === 'node' && element.lat !== undefined && element.lon !== undefined) {
                lat = parseFloat(element.lat);
                lon = parseFloat(element.lon);
              } else if (element.center) {
                lat = parseFloat(element.center.lat);
                lon = parseFloat(element.center.lon);
              } else {
                return null;
              }
              
              // Validate coordinates
              if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
                return null;
              }
              
              // Only include places with tags
              if (!element.tags || Object.keys(element.tags).length === 0) {
                return null;
              }
              
              return { ...element, lat: lat, lon: lon };
            })
            .filter(Boolean)
          
          console.log(`Fallback query found ${fallbackPlaces.length} places`);
          return fallbackPlaces.length > places.length ? fallbackPlaces : places;
        }
      } catch (fallbackError) {
        console.error("Fallback query error:", fallbackError.message);
      }
    }
    
    return places;
  } catch (error) {
    console.error("Overpass API Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    return [];
  }
};

module.exports = fetchPlaces;
