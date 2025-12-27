const express = require("express");
const auth = require("../middleware/authMiddleware");
const {
  getBoardGames,
  getMovies,
  generateRecipes
} = require("../utils/aiService");

const router = express.Router();

router.post("/boardgames", auth, async (req, res) => {
  const { vibe, energy, people } = req.body;
  try {
    const games = await getBoardGames(vibe, energy, people);
    res.json(games);
  } catch (err) {
    console.error("Boardgames route error:", err.message);
    res.status(500).json({ error: "Failed to get board game suggestions" });
  }
});

router.post("/movies", auth, async (req, res) => {
  const { genre } = req.body;
  try {
    const movies = await getMovies(genre);
    res.json(movies);
  } catch (err) {
    console.error("Movies route error:", err.message);
    res.status(500).json({ error: "Failed to get movie suggestions" });
  }
});

router.post("/recipes", auth, async (req, res) => {
  const { ingredients, time, health, spice, cuisine } = req.body;
  
  console.log("Recipe request received:", { ingredients, time, health, spice, cuisine });
  
  if (!ingredients || !ingredients.trim()) {
    return res.status(400).json({ error: "Ingredients are required" });
  }
  
  try {
    const recipes = await generateRecipes(
      ingredients,
      time,
      health,
      spice,
      cuisine
    );
    
    console.log(`Generated ${recipes.length} recipes`);
    
    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ error: "No recipes found. Try different ingredients." });
    }
    
    res.json(recipes);
  } catch (err) {
    console.error("Recipes route error:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: "Failed to generate recipes: " + err.message });
  }
});

module.exports = router;
