const express = require("express");
const auth = require("../middleware/authMiddleware");
const fetchPlaces = require("../utils/overpass");

const router = express.Router();

/* OUTDOOR SUGGESTIONS */
router.post("/suggestions", auth, async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      vibes,
      timeOfDay,
      energyLevel,
      distance
    } = req.body;

    console.log("Received request:", { latitude, longitude, vibes, timeOfDay, energyLevel, distance });

    // Validate required fields
    if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
      console.error("Missing coordinates:", { latitude, longitude });
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    // Convert to numbers and validate ranges
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      console.error("Invalid coordinates (not numbers):", { latitude, longitude });
      return res.status(400).json({ error: "Latitude and longitude must be valid numbers" });
    }
    
    if (lat < -90 || lat > 90) {
      console.error("Invalid latitude range:", lat);
      return res.status(400).json({ error: "Latitude must be between -90 and 90" });
    }
    
    if (lng < -180 || lng > 180) {
      console.error("Invalid longitude range:", lng);
      return res.status(400).json({ error: "Longitude must be between -180 and 180" });
    }

    if (!distance || distance <= 0) {
      console.error("Invalid distance:", distance);
      return res.status(400).json({ error: "Distance must be greater than 0" });
    }

    const radius = Math.min(distance * 1000, 50000); // Cap at 50km for performance
    console.log(`Fetching places for coordinates: ${lat}, ${lng}, radius: ${radius}m`);

    const places = await fetchPlaces(
      lat,
      lng,
      radius,
      vibes || ["Chill"]
    );

    console.log(`Fetched ${places.length} places from Overpass API`);

    if (!places || places.length === 0) {
      return res.json({ 
        activities: [], 
        food: [],
        message: "No places found in this area. Try increasing the radius or selecting a different location."
      });
    }

    const getPlaceType = (tags) => {
      if (!tags) return "Spot";
      if (tags.amenity) return tags.amenity.replace(/_/g, " ");
      if (tags.leisure) return tags.leisure.replace(/_/g, " ");
      if (tags.tourism) return tags.tourism.replace(/_/g, " ");
      if (tags.shop) return tags.shop.replace(/_/g, " ");
      if (tags.natural) return tags.natural.replace(/_/g, " ");
      if (tags.historic) return tags.historic.replace(/_/g, " ");
      if (tags.landuse) return tags.landuse.replace(/_/g, " ");
      if (tags.sport) return tags.sport.replace(/_/g, " ");
      return "Spot";
    };

    const getExperience = (type, vibe) => {
      const experiences = {
        cafe: "Quiet coffee time ☕",
        park: "Relaxing nature walk 🌿",
        beach: "Sunset walk & sea breeze 🌅",
        museum: "Slow cultural discovery 🏛️",
        gallery: "Art & photo-friendly corners 🎨",
        restaurant: "Sit-down meal & conversation 🍽️",
        bar: "Loud social drinks & music 🥂",
        pub: "Casual hangout & games 🍻",
        library: "Deep focus & solo recharge 📖",
        viewpoint: "Scenic viewpoints & photos 📸",
        cinema: "Cozy movie time 🍿",
        mall: "Indoor roaming & people-watching 🛍️",
        theatre: "Live performance experience 🎭",
        "community centre": "Workshops & local events 🤝"
      };

      const key = Object.keys(experiences).find((k) =>
        type.toLowerCase().includes(k)
      );

      if (!key) {
        return `Experience a ${vibe?.toLowerCase() || "nice"} vibe at this ${type} ✨`;
      }

      return experiences[key];
    };

    const foodKeywords = [
      "restaurant",
      "cafe",
      "bar",
      "pub",
      "fast_food",
      "ice_cream",
      "bakery",
      "food_court"
    ];

    // Simple season + crowd awareness (no external API needed)
    const now = new Date();
    const month = now.getMonth(); // 0 = Jan
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    const isSummerMonth = [3, 4, 5].includes(month); // Apr–Jun (example)
    const isPeakTouristSeason = [10, 11, 0].includes(month); // Nov–Jan (example)

    const processedPlaces = places.map((place) => {
      const typeRaw = getPlaceType(place.tags);
      const type = typeRaw.charAt(0).toUpperCase() + typeRaw.slice(1);
      const lowerType = type.toLowerCase();

      const isFood = foodKeywords.some((k) => lowerType.includes(k));

      // Heuristic crowd score: malls/markets/tourist attractions get higher crowd in evenings/weekends
      let crowdScore = 1; // 1 = relaxed, 5 = very crowded
      if (
        lowerType.includes("mall") ||
        lowerType.includes("market") ||
        lowerType.includes("attraction") ||
        lowerType.includes("viewpoint")
      ) {
        crowdScore += 2;
      }
      if (isFood && (timeOfDay === "evening" || timeOfDay === "night")) {
        crowdScore += 1;
      }
      if (isWeekend) {
        crowdScore += 1;
      }
      if (isPeakTouristSeason) {
        crowdScore += 1;
      }
      // Clamp
      if (crowdScore < 1) crowdScore = 1;
      if (crowdScore > 5) crowdScore = 5;

      // Suggest offbeat alternatives by slightly favoring non-malls/parks/nature when places are likely packed
      const isOffbeat =
        !lowerType.includes("mall") &&
        !lowerType.includes("market") &&
        !lowerType.includes("theme park") &&
        !lowerType.includes("stadium") &&
        !lowerType.includes("nightclub") &&
        (lowerType.includes("park") ||
          lowerType.includes("garden") ||
          lowerType.includes("viewpoint") ||
          lowerType.includes("library") ||
          lowerType.includes("community"));

      const selectedVibe = vibes && vibes.length ? vibes[0] : "Chill";

      let explanation = `Perfect for ${vibes?.join(", ") || selectedVibe} vibes during ${timeOfDay}.`;
      if (crowdScore >= 4) {
        explanation +=
          " Likely to be busy at this time – great if you enjoy a lively crowd.";
      } else if (crowdScore <= 2) {
        explanation +=
          " Usually on the calmer side – good if you want to avoid crowds.";
      }
      if (isOffbeat) {
        explanation += " This is a slightly offbeat option, away from usual tourist rush.";
      }

      // Build address from tags
      const addressParts = [];
      if (place.tags?.["addr:street"]) addressParts.push(place.tags["addr:street"]);
      if (place.tags?.["addr:housenumber"]) addressParts.push(place.tags["addr:housenumber"]);
      if (place.tags?.["addr:city"]) addressParts.push(place.tags["addr:city"]);
      if (place.tags?.["addr:state"]) addressParts.push(place.tags["addr:state"]);
      const address = addressParts.length > 0 ? addressParts.join(", ") : null;

      return {
        name: place.tags?.name || place.tags?.["name:en"] || place.tags?.["name:local"] || type,
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        type: type,
        experience: getExperience(type, selectedVibe),
        category: isFood ? "food" : "activity",
        explanation,
        crowdLevel: crowdScore,
        address: address || place.tags?.["addr:full"] || null
      };
    });

    // Prefer low-crowd places when user energy is low or vibe is Calm/Solo
    const wantsCalm =
      energyLevel?.toLowerCase() === "low" ||
      (vibes || []).some((v) =>
        ["Chill", "Solo Recharge", "Calm"].includes(v)
      );

    const calmSort = (a, b) =>
      wantsCalm ? a.crowdLevel - b.crowdLevel : b.crowdLevel - a.crowdLevel;

    const activities = processedPlaces
      .filter((p) => p.category === "activity")
      .sort(calmSort)
      .slice(0, 10);

    const food = processedPlaces
      .filter((p) => p.category === "food")
      .sort(calmSort)
      .slice(0, 10);

    res.json({ activities, food });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
