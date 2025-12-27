// AI utilities for indoor experiences.
// Uses OpenAI via ./llmClient when available, with a strong JSON contract,
// and falls back to deterministic local logic when no key / on any error.
const openai = require("./llmClient");

/* ----------------------------- LOCAL FALLBACKS ----------------------------- */

const localGetBoardGames = (vibe, energy, people) => {
  const games = [
    {
      name: "Catan",
      vibe: "social",
      energy: "medium",
      min: 3,
      max: 4,
      desc: "Trade, build, and settle. A classic strategy game.",
      howToPlayCore:
        "1. Lay out the hex tiles and numbers.\n2. Each player places two settlements and roads.\n3. On your turn roll dice, collect resources, trade and build.\n4. First to 10 victory points wins."
    },
    {
      name: "Ticket to Ride",
      vibe: "chill",
      energy: "low",
      min: 2,
      max: 5,
      desc: "Build train routes across countries. Relaxing yet strategic.",
      howToPlayCore:
        "1. Draw Destination Tickets and keep your routes secret.\n2. On your turn either draw train cards, claim a route, or draw more tickets.\n3. Connect cities before others and score long continuous routes."
    },
    {
      name: "Codenames",
      vibe: "social",
      energy: "high",
      min: 4,
      max: 8,
      desc: "Word association game for teams. Great for parties.",
      howToPlayCore:
        "1. Split into two teams with a spymaster each.\n2. Spymaster gives a one-word clue + number.\n3. Team guesses words on the grid, avoiding the assassin.\n4. First team to find all their agents wins."
    },
    {
      name: "Pandemic",
      vibe: "cooperative",
      energy: "high",
      min: 2,
      max: 4,
      desc: "Save the world from diseases together.",
      howToPlayCore:
        "1. Each player gets a role with special powers.\n2. On your turn move, treat disease cubes, share knowledge, and build research stations.\n3. Work together to discover 4 cures before outbreaks spiral."
    },
    {
      name: "Exploding Kittens",
      vibe: "funny",
      energy: "medium",
      min: 2,
      max: 5,
      desc: "Russian roulette with cats. Fast and funny.",
      howToPlayCore:
        "1. Take turns drawing cards from the deck.\n2. If you draw an Exploding Kitten, play a Defuse or you are out.\n3. Use action cards to skip, attack, see the future, or reshuffle."
    },
    {
      name: "Monopoly",
      vibe: "competitive",
      energy: "high",
      min: 2,
      max: 6,
      desc: "The classic property trading game. Ruins friendships.",
      howToPlayCore:
        "1. Roll and move around the board, buying properties you land on.\n2. Collect rent, trade, and build houses/hotels.\n3. Last player not bankrupt wins."
    },
    {
      name: "Scrabble",
      vibe: "chill",
      energy: "low",
      min: 2,
      max: 4,
      desc: "Word building game. Good for quiet evenings.",
      howToPlayCore:
        "1. Draw 7 letter tiles.\n2. Form words on the board crossword-style.\n3. Use premium squares (double/triple letter/word) to maximize points."
    },
    {
      name: "Twister",
      vibe: "energetic",
      energy: "high",
      min: 2,
      max: 4,
      desc: "Get tied in knots. Very physical.",
      howToPlayCore:
        "1. Spread out the mat and spin the wheel.\n2. Place hands/feet on the called color.\n3. The last player still standing without falling wins."
    },
    {
      name: "Dixit",
      vibe: "creative",
      energy: "low",
      min: 3,
      max: 6,
      desc: "Storytelling through abstract cards.",
      howToPlayCore:
        "1. Active player gives a clue for one of their cards.\n2. Others submit cards that also fit the clue.\n3. Guess which card was the storyteller’s; score for good clues and guesses."
    },
    {
      name: "The Resistance",
      vibe: "social",
      energy: "high",
      min: 5,
      max: 10,
      desc: "Social deduction and bluffing.",
      howToPlayCore:
        "1. Secretly deal roles (spies vs resistance).\n2. Propose mission teams; players vote.\n3. Mission cards determine success or failure; deduce who is lying."
    }
  ];

  // Filter by player count first
  let filtered = games.filter((g) => people >= g.min && people <= g.max);

  const v = vibe.toLowerCase();
  if (v.includes("chill")) {
    filtered = filtered.filter((g) =>
      ["chill", "creative", "funny"].includes(g.vibe)
    );
  }
  if (v.includes("social") || v.includes("party")) {
    filtered = filtered.filter((g) =>
      ["social", "energetic", "funny", "cooperative"].includes(g.vibe)
    );
  }
  if (v.includes("competitive")) {
    filtered = filtered.filter((g) =>
      ["competitive", "social"].includes(g.vibe)
    );
  }

  if (energy === "high") {
    filtered = filtered.filter(
      (g) => g.energy === "high" || g.energy === "medium"
    );
  } else if (energy === "low") {
    filtered = filtered.filter((g) => g.energy === "low");
  }

  // Fallback if filters are too strict
  if (filtered.length === 0) {
    filtered = games.filter((g) => people >= g.min);
  }

  return filtered.slice(0, 5).map((g) => ({
    ...g,
    howToPlay: g.howToPlayCore
  }));
};

const localGetMovies = (genre) => {
  const db = {
    "action": ["Mad Max: Fury Road", "John Wick", "The Dark Knight", "Inception", "Gladiator"],
    "comedy": ["Superbad", "The Grand Budapest Hotel", "Palm Springs", "Game Night", "Step Brothers"],
    "drama": ["The Shawshank Redemption", "Parasite", "The Godfather", "La La Land", "Forrest Gump"],
    "horror": ["Hereditary", "Get Out", "The Shining", "A Quiet Place", "It"],
    "romance": ["The Notebook", "Pride & Prejudice", "Before Sunrise", "About Time", "La La Land"],
    "sci-fi": ["Interstellar", "Blade Runner 2049", "Arrival", "The Matrix", "Dune"]
  };
  
  const list = db[genre.toLowerCase()] || ["The Truman Show", "Spirited Away", "Pulp Fiction"];
  return list.map(title => ({ title, genre }));
};

const localGenerateRecipes = (ingredients, time, health, spice, cuisine) => {
  // Mock "AI" recipe generation that respects time, health, spice and cuisine.
  // This stays deterministic and offline, but structures data the way a real LLM-backed API would.
  if (!ingredients || !ingredients.trim()) {
    return [];
  }

  const rawList = ingredients
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);

  const mainIngredient = rawList[0] || "Chef’s Choice";
  const readableIngredients = rawList.join(", ");

  const timeLabel = time || "30 mins";
  const healthLabel = health || "Comfort Food";
  const spiceLabel = spice || "Medium";
  const cuisineLabel = cuisine || "Fusion";

  const quick = timeLabel.toLowerCase().includes("10");
  const long = timeLabel.toLowerCase().includes("1 hour");

  const isHealthy = healthLabel.toLowerCase().includes("healthy");
  const isIndulgent = healthLabel.toLowerCase().includes("indulgent");

  const spiceWord =
    spiceLabel.toLowerCase() === "mild"
      ? "very gently spiced"
      : spiceLabel.toLowerCase() === "hot"
      ? "bold and fiery"
      : "moderately spiced";

  const baseIntro = `Using only: ${readableIngredients}.`;

  const recipes = [
    {
      name: `${cuisineLabel} ${mainIngredient} One-Pan Skillet`,
      time: timeLabel,
      health: healthLabel,
      spice: spiceLabel,
      cuisine: cuisineLabel,
      ingredients: readableIngredients,
      instructions:
        `${baseIntro}\n` +
        `1. Prep: Finely chop all the vegetables and aromatics you have.\n` +
        `2. Heat: Warm a pan on medium heat with a teaspoon of oil or butter.\n` +
        `3. Sauté: Start with firmer ingredients first, then softer ones, keeping it ${spiceWord}.\n` +
        `4. Simmer: Let everything cook together until tender${quick ? " (keep it slightly crunchy for a quick bite)." : " and flavors have blended deeply."}\n` +
        `5. Finish: Taste, adjust salt and spice, and serve hot with whatever carbs you have on hand (bread, rice, etc.).`
    },
    {
      name: `Comfort-Style ${mainIngredient} Bowl`,
      time: quick ? "10 mins" : "30 mins",
      health: isHealthy ? "Balanced" : "Comfort Food",
      spice: spiceLabel,
      cuisine: "Home-Style",
      ingredients: readableIngredients,
      instructions:
        `${baseIntro}\n` +
        `1. Base: If you have rice, noodles or bread, warm them up as a base.\n` +
        `2. Topper: Lightly pan-fry ${mainIngredient} with just salt, pepper and your preferred spices.\n` +
        `3. Mix-ins: Add remaining chopped ingredients on top, either raw (for crunch) or quickly sautéed.\n` +
        `4. Serve: Layer base + ${mainIngredient} + veggies, drizzle with any available sauce (soy, ketchup, yogurt) for a quick, filling bowl.`
    },
    {
      name: `Spiced ${mainIngredient} Stuffed Pockets / Toast`,
      time: "20 mins",
      health: isIndulgent ? "Indulgent" : "Medium",
      spice: spiceLabel,
      cuisine: cuisineLabel,
      ingredients: readableIngredients,
      instructions:
        `${baseIntro}\n` +
        `1. Filling: Finely chop ${readableIngredients} and mix with salt, herbs, and your ${spiceWord} seasoning.\n` +
        `2. Stuff: Use bread slices, wraps, or dough to enclose the filling.\n` +
        `3. Cook: Toast on a pan with a little oil/butter until golden on both sides.\n` +
        `4. Cut & Serve: Slice into triangles/strips for easy snacking or a light meal.`
    },
    {
      name: `${cuisineLabel} ${mainIngredient} Salad / Cold Plate`,
      time: quick ? "10 mins" : "15 mins",
      health: isHealthy ? "Healthy" : "Light",
      spice: spiceLabel,
      cuisine: cuisineLabel,
      ingredients: readableIngredients,
      instructions:
        `${baseIntro}\n` +
        `1. Prep: Keep crunchy items (like cucumbers, carrots, onions) raw and chop them small.\n` +
        `2. Protein: If ${mainIngredient} is protein (eggs, paneer, chicken), cook or boil it quickly.\n` +
        `3. Dressing: Whisk a simple dressing with lemon/vinegar, a bit of oil, salt and your chosen spice level.\n` +
        `4. Toss: Combine everything in a bowl and toss right before serving for maximum freshness.`
    },
    {
      name: `${mainIngredient} One-Pot Comfort Stew`,
      time: long ? "1 hour" : "30 mins",
      health: isHealthy ? "Balanced" : "Comfort Food",
      spice: spiceLabel,
      cuisine: "Global Comfort",
      ingredients: readableIngredients,
      instructions:
        `${baseIntro}\n` +
        `1. Base: Start by sautéing any onions/garlic/strong aromatics in a deep pot.\n` +
        `2. Bulk: Add the rest of the ingredients and enough water/broth to just cover them.\n` +
        `3. Simmer: Cook on low heat until the hardest ingredient is tender.\n` +
        `4. Adjust: Thicken with mashed veggies or a bit of starch if you like a thicker stew.\n` +
        `5. Serve: Ideal for days when you want something warm, filling, and hands-off.`
    },
    {
      name: `Quick ${mainIngredient} Snack Bites`,
      time: "10–15 mins",
      health: isIndulgent ? "Indulgent" : "Medium",
      spice: spiceLabel,
      cuisine: "Snack",
      ingredients: readableIngredients,
      instructions:
        `${baseIntro}\n` +
        `1. Chop everything into small, bite-sized pieces.\n` +
        `2. If you have skewers, toothpicks, or just a plate, arrange items as small finger-food combos.\n` +
        `3. Sprinkle with your preferred spice level and a squeeze of lemon/yogurt dip if available.\n` +
        `4. Perfect for a movie night at home with exactly what’s in your fridge.`
    }
  ];

  return recipes.slice(0, 6);
};

/* ------------------------------ OPENAI HELPERS ----------------------------- */

const safeParseJSON = (text) => {
  try {
    const cleaned = text.trim().replace(/```json/gi, "```").replace(/```/g, "");
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
};

/* ------------------------------ PUBLIC EXPORTS ----------------------------- */

// Keep the same signatures, but make them async so they can use OpenAI.

const getBoardGames = async (vibe, energy, people) => {
  // No OpenAI configured – use local logic.
  if (!openai) {
    return localGetBoardGames(vibe, energy, people);
  }

  const prompt = `
You are a board game curator.
The user has:
- vibe: ${vibe}
- energy level: ${energy}
- number of people: ${people}

Return a JSON array (no extra text, no markdown). Each item MUST be an object:
{
  "name": string,
  "vibe": string, // e.g. "social", "chill", "competitive"
  "energy": "low" | "medium" | "high",
  "min": number,  // min players
  "max": number,  // max players
  "desc": string, // short description
  "howToPlay": string // 3–5 clear steps
}

Only output valid JSON.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const content = completion.choices[0]?.message?.content || "";
    const parsed = safeParseJSON(content);
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      return localGetBoardGames(vibe, energy, people);
    }
    // Trust LLM but keep shape consistent
    return parsed.slice(0, 5);
  } catch (err) {
    console.error("OpenAI getBoardGames error:", err.message);
    return localGetBoardGames(vibe, energy, people);
  }
};

const getMovies = async (genre) => {
  if (!openai) {
    return localGetMovies(genre);
  }

  const prompt = `
Recommend 6 movies for the given genre: ${genre}.
Return a JSON array (no extra text). Each item:
{
  "title": string,
  "genre": string
}
Only output JSON.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8
    });
    const content = completion.choices[0]?.message?.content || "";
    const parsed = safeParseJSON(content);
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      return localGetMovies(genre);
    }
    return parsed.slice(0, 6);
  } catch (err) {
    console.error("OpenAI getMovies error:", err.message);
    return localGetMovies(genre);
  }
};

const generateRecipes = async (ingredients, time, health, spice, cuisine) => {
  // Transform local recipes to match frontend format
  const transformLocalRecipes = (recipes) => {
    return recipes.map(recipe => ({
      name: recipe.name,
      prepTime: recipe.time,
      calories: Math.floor(Math.random() * 300) + 200, // Estimate 200-500 calories
      ingredients: recipe.ingredients.split(",").map(i => i.trim()), // Convert to array
      instructions: recipe.instructions,
      cuisine: recipe.cuisine,
      health: recipe.health,
      spice: recipe.spice
    }));
  };

  if (!openai) {
    const localRecipes = localGenerateRecipes(ingredients, time, health, spice, cuisine);
    return transformLocalRecipes(localRecipes);
  }

  const prompt = `
You are a smart home cook assistant.
The user ONLY has these ingredients: ${ingredients}
Do NOT introduce ingredients that aren't in this list.

User preferences:
- Time available: ${time}
- Health preference: ${health}
- Spice level: ${spice}
- Cuisine type: ${cuisine}

Return 5–6 dish ideas as a JSON array (no extra text, no markdown).
Each item MUST be:
{
  "name": string,
  "prepTime": string,          // e.g. "10 mins", "30 mins", "1 hour"
  "calories": number,           // estimated calories (200-600 range)
  "ingredients": array,         // array of strings, ONLY the given ingredients
  "instructions": string,       // multi-step, human friendly prep steps
  "cuisine": string,           // cuisine type
  "health": string,            // health preference
  "spice": string              // spice level
}

IMPORTANT: 
- Only use ingredients from: ${ingredients}
- Return ingredients as an array, not a string
- Make instructions detailed and step-by-step
- Estimate realistic calories based on ingredients

Only output valid JSON, nothing else.
  `;

  try {
    console.log("Generating recipes with OpenAI for ingredients:", ingredients);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85
    });
    const content = completion.choices[0]?.message?.content || "";
    console.log("OpenAI response:", content.substring(0, 200));
    
    const parsed = safeParseJSON(content);
    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      console.log("OpenAI parsing failed, using local recipes");
      const localRecipes = localGenerateRecipes(ingredients, time, health, spice, cuisine);
      return transformLocalRecipes(localRecipes);
    }
    
    // Ensure ingredients is an array and validate format
    const validatedRecipes = parsed.map(recipe => ({
      name: recipe.name || "Recipe",
      prepTime: recipe.prepTime || recipe.time || time || "30 mins",
      calories: recipe.calories || Math.floor(Math.random() * 300) + 200,
      ingredients: Array.isArray(recipe.ingredients) 
        ? recipe.ingredients 
        : (typeof recipe.ingredients === 'string' 
            ? recipe.ingredients.split(",").map(i => i.trim())
            : []),
      instructions: recipe.instructions || "Follow your favorite cooking method.",
      cuisine: recipe.cuisine || cuisine,
      health: recipe.health || health,
      spice: recipe.spice || spice
    }));
    
    console.log(`Generated ${validatedRecipes.length} recipes`);
    return validatedRecipes.slice(0, 6);
  } catch (err) {
    console.error("OpenAI generateRecipes error:", err.message);
    const localRecipes = localGenerateRecipes(ingredients, time, health, spice, cuisine);
    return transformLocalRecipes(localRecipes);
  }
};

module.exports = {
  getBoardGames,
  getMovies,
  generateRecipes,
  // Export locals in case you want to unit-test them directly
  localGetBoardGames,
  localGetMovies,
  localGenerateRecipes
};
