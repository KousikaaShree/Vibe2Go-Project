import { useState } from "react";
import API from "../api/api";
import { FaDice, FaFilm, FaUtensils } from "react-icons/fa";
import { 
  Tabs, Tab, Box, TextField, Select, MenuItem, InputLabel, FormControl, 
  Slider, Typography, Card, CardContent, Chip, Button, Grid, CircularProgress
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

export default function Indoor() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Forms
  const [bgForm, setBgForm] = useState({ vibe: "social", energy: "medium", people: 4 });
  const [movieForm, setMovieForm] = useState({ genre: "action" });
  const [fridgeForm, setFridgeForm] = useState({ ingredients: "", time: "30 mins", health: "Medium", spice: "Medium", cuisine: "Italian" });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setResults(null);
  };

  const fetchBoardGames = async () => {
    setLoading(true);
    try {
      const res = await API.post("/indoor/boardgames", bgForm);
      setResults(res.data);
    } catch (err) {
      alert("Error fetching games");
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await API.post("/indoor/movies", movieForm);
      setResults(res.data);
    } catch (err) {
      alert("Error fetching movies");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    if (!fridgeForm.ingredients || !fridgeForm.ingredients.trim()) {
      alert("Please enter at least one ingredient!");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Fetching recipes with:", fridgeForm);
      const res = await API.post("/indoor/recipes", fridgeForm);
      console.log("Received recipes:", res.data);
      
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setResults(res.data);
      } else {
        alert("No recipes found. Try different ingredients or preferences.");
        setResults(null);
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
      alert("Error fetching recipes: " + (err.response?.data?.error || err.message || "Unknown error"));
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-5"
      >
        <h1 className="fw-bold display-5 mb-3">Indoor <span className="text-gradient">Vibes</span> 🏠</h1>
        <p className="text-muted lead">Discover the perfect way to spend your time inside.</p>
      </motion.div>

      <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 4, boxShadow: 3, overflow: 'hidden' }} className="mb-5 glass-card p-0">
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          centered 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.5)' }}
        >
          <Tab icon={<FaDice size={24} />} label="Board Games" sx={{ py: 3, textTransform: 'none', fontWeight: 'bold', fontSize: '1.1rem' }} />
          <Tab icon={<FaFilm size={24} />} label="Movies" sx={{ py: 3, textTransform: 'none', fontWeight: 'bold', fontSize: '1.1rem' }} />
          <Tab icon={<FaUtensils size={24} />} label="Chef AI" sx={{ py: 3, textTransform: 'none', fontWeight: 'bold', fontSize: '1.1rem' }} />
        </Tabs>

        <Box sx={{ p: 4, minHeight: 400 }}>
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div 
                key="games"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {!results ? (
                  <div className="row justify-content-center">
                    <div className="col-md-8">
                      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4 }}>
                        Find the perfect game for your crew 🎲
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth>
                            <InputLabel>Vibe</InputLabel>
                            <Select 
                              value={bgForm.vibe} 
                              label="Vibe" 
                              onChange={e => setBgForm({...bgForm, vibe: e.target.value})}
                            >
                              <MenuItem value="social">Social 🎉</MenuItem>
                              <MenuItem value="chill">Chill 😌</MenuItem>
                              <MenuItem value="competitive">Competitive 🔥</MenuItem>
                              <MenuItem value="cooperative">Cooperative 🤝</MenuItem>
                              <MenuItem value="funny">Funny 😂</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                           <FormControl fullWidth>
                            <InputLabel>Energy</InputLabel>
                            <Select 
                              value={bgForm.energy} 
                              label="Energy" 
                              onChange={e => setBgForm({...bgForm, energy: e.target.value})}
                            >
                              <MenuItem value="high">High Energy ⚡</MenuItem>
                              <MenuItem value="medium">Medium ⚖️</MenuItem>
                              <MenuItem value="low">Low Key 🧘</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography gutterBottom>Number of People: {bgForm.people}</Typography>
                          <Slider
                            value={bgForm.people}
                            onChange={(e, val) => setBgForm({...bgForm, people: val})}
                            step={1}
                            marks
                            min={1}
                            max={10}
                            valueLabelDisplay="auto"
                          />
                        </Grid>
                        <Grid item xs={12} align="center">
                          <Button 
                            variant="contained" 
                            size="large" 
                            onClick={fetchBoardGames} 
                            disabled={loading}
                            sx={{ borderRadius: 50, px: 5, py: 1.5, fontSize: '1.1rem', background: 'var(--primary)' }}
                          >
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Find Games"}
                          </Button>
                        </Grid>
                      </Grid>
                    </div>
                  </div>
                ) : (
                  <Grid container spacing={3}>
                    {results.map((game, i) => (
                      <Grid item xs={12} md={6} lg={4} key={i}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                          <Card sx={{ height: '100%', borderRadius: 4, transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                            <CardContent>
                              <Typography variant="h5" component="div" gutterBottom sx={{ color: 'var(--primary)', fontWeight: 'bold' }}>
                                {game.name}
                              </Typography>
                              <Chip label={`${game.players} Players`} size="small" sx={{ mb: 2, mr: 1 }} />
                              <Chip label={game.time} size="small" color="secondary" sx={{ mb: 2 }} />
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {game.description}
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>How to play:</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {game.instructions}
                              </Typography>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    ))}
                     <Grid item xs={12} align="center" sx={{ mt: 3 }}>
                       <Button variant="outlined" onClick={() => setResults(null)}>Search Again</Button>
                     </Grid>
                  </Grid>
                )}
              </motion.div>
            )}

            {activeTab === 1 && (
              <motion.div 
                key="movies"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {!results ? (
                   <div className="row justify-content-center">
                    <div className="col-md-6 text-center">
                      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
                        Pick a Genre & Chill 🍿
                      </Typography>
                      <FormControl fullWidth sx={{ mb: 4 }}>
                        <InputLabel>Genre</InputLabel>
                        <Select 
                          value={movieForm.genre} 
                          label="Genre" 
                          onChange={e => setMovieForm({...movieForm, genre: e.target.value})}
                        >
                          <MenuItem value="action">Action 💥</MenuItem>
                          <MenuItem value="comedy">Comedy 😂</MenuItem>
                          <MenuItem value="drama">Drama 🎭</MenuItem>
                          <MenuItem value="horror">Horror 👻</MenuItem>
                          <MenuItem value="scifi">Sci-Fi 👽</MenuItem>
                          <MenuItem value="romance">Romance ❤️</MenuItem>
                          <MenuItem value="documentary">Documentary 🧠</MenuItem>
                        </Select>
                      </FormControl>
                      <Button 
                        variant="contained" 
                        size="large" 
                        onClick={fetchMovies}
                        disabled={loading}
                        sx={{ borderRadius: 50, px: 5, py: 1.5, fontSize: '1.1rem', background: 'var(--primary)' }}
                      >
                         {loading ? <CircularProgress size={24} color="inherit" /> : "Suggest Movies"}
                      </Button>
                    </div>
                   </div>
                ) : (
                   <Grid container spacing={3}>
                    {results.map((movie, i) => (
                      <Grid item xs={12} md={4} key={i}>
                         <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                           <Card sx={{ height: '100%', borderRadius: 4, overflow: 'visible', '&:hover': { transform: 'scale(1.02)' } }}>
                              <Box sx={{ height: 10, bgcolor: 'var(--secondary)' }} />
                              <CardContent>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>{movie.title}</Typography>
                                <Chip label={movie.year} size="small" sx={{ mb: 2, mr: 1 }} />
                                <Chip label={`⭐ ${movie.rating}`} size="small" color="warning" sx={{ mb: 2 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {movie.plot}
                                </Typography>
                              </CardContent>
                           </Card>
                         </motion.div>
                      </Grid>
                    ))}
                    <Grid item xs={12} align="center" sx={{ mt: 3 }}>
                       <Button variant="outlined" onClick={() => setResults(null)}>Search Again</Button>
                     </Grid>
                   </Grid>
                )}
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div 
                key="fridge"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {!results ? (
                   <div className="row justify-content-center">
                     <div className="col-md-8">
                        <Typography variant="h5" align="center" gutterBottom sx={{ mb: 4 }}>
                          What's in your fridge? 🥦
                        </Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <TextField 
                              fullWidth 
                              label="Ingredients (e.g. Eggs, Tomato, Cheese)" 
                              variant="outlined" 
                              value={fridgeForm.ingredients}
                              onChange={e => setFridgeForm({...fridgeForm, ingredients: e.target.value})}
                            />
                          </Grid>
                          <Grid item xs={6}>
                             <FormControl fullWidth>
                                <InputLabel>Time</InputLabel>
                                <Select 
                                  value={fridgeForm.time} 
                                  label="Time" 
                                  onChange={e => setFridgeForm({...fridgeForm, time: e.target.value})}
                                >
                                  <MenuItem value="10 mins">Quick (10m) ⚡</MenuItem>
                                  <MenuItem value="30 mins">Medium (30m) 🕒</MenuItem>
                                  <MenuItem value="1 hour">Long (1h+) 🥘</MenuItem>
                                </Select>
                             </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                             <FormControl fullWidth>
                                <InputLabel>Cuisine</InputLabel>
                                <Select 
                                  value={fridgeForm.cuisine} 
                                  label="Cuisine" 
                                  onChange={e => setFridgeForm({...fridgeForm, cuisine: e.target.value})}
                                >
                                  <MenuItem value="Italian">Italian 🍝</MenuItem>
                                  <MenuItem value="Indian">Indian 🍛</MenuItem>
                                  <MenuItem value="Mexican">Mexican 🌮</MenuItem>
                                  <MenuItem value="Asian">Asian 🍜</MenuItem>
                                  <MenuItem value="American">American 🍔</MenuItem>
                                </Select>
                             </FormControl>
                          </Grid>
                           <Grid item xs={6}>
                             <FormControl fullWidth>
                                <InputLabel>Health</InputLabel>
                                <Select 
                                  value={fridgeForm.health} 
                                  label="Health" 
                                  onChange={e => setFridgeForm({...fridgeForm, health: e.target.value})}
                                >
                                  <MenuItem value="Healthy">Healthy 🥗</MenuItem>
                                  <MenuItem value="Medium">Balanced ⚖️</MenuItem>
                                  <MenuItem value="Indulgent">Indulgent 🍰</MenuItem>
                                </Select>
                             </FormControl>
                          </Grid>
                          <Grid item xs={6}>
                             <FormControl fullWidth>
                                <InputLabel>Spice</InputLabel>
                                <Select 
                                  value={fridgeForm.spice} 
                                  label="Spice" 
                                  onChange={e => setFridgeForm({...fridgeForm, spice: e.target.value})}
                                >
                                  <MenuItem value="Low">Mild 🌶️</MenuItem>
                                  <MenuItem value="Medium">Medium 🌶️🌶️</MenuItem>
                                  <MenuItem value="High">Hot 🌶️🌶️🌶️</MenuItem>
                                </Select>
                             </FormControl>
                          </Grid>
                          <Grid item xs={12} align="center">
                            <Button 
                              variant="contained" 
                              size="large" 
                              onClick={fetchRecipes}
                              disabled={loading}
                              sx={{ borderRadius: 50, px: 5, py: 1.5, fontSize: '1.1rem', background: 'var(--primary)' }}
                            >
                               {loading ? <CircularProgress size={24} color="inherit" /> : "Cook Something!"}
                            </Button>
                          </Grid>
                        </Grid>
                     </div>
                   </div>
                ) : (
                   <Grid container spacing={3}>
                    {results.map((recipe, i) => (
                      <Grid item xs={12} md={6} key={i}>
                         <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                           <Card sx={{ height: '100%', borderRadius: 4, '&:hover': { boxShadow: 6 } }}>
                              <CardContent>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'var(--primary)' }}>{recipe.name}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                   <Chip label={`⏱️ ${recipe.prepTime || recipe.time || "30 mins"}`} size="small" />
                                   <Chip label={`🔥 ${recipe.calories || "~300"} kcal`} size="small" variant="outlined" />
                                   {recipe.cuisine && <Chip label={recipe.cuisine} size="small" color="primary" />}
                                   {recipe.spice && <Chip label={`🌶️ ${recipe.spice}`} size="small" />}
                                </Box>
                                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Ingredients:</Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                  {Array.isArray(recipe.ingredients) 
                                    ? recipe.ingredients.join(", ")
                                    : (typeof recipe.ingredients === 'string' ? recipe.ingredients : "Not specified")}
                                </Typography>
                                <Typography variant="subtitle2" gutterBottom>Instructions:</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {recipe.instructions}
                                </Typography>
                              </CardContent>
                           </Card>
                         </motion.div>
                      </Grid>
                    ))}
                    <Grid item xs={12} align="center" sx={{ mt: 3 }}>
                       <Button variant="outlined" onClick={() => setResults(null)}>Cook Again</Button>
                     </Grid>
                   </Grid>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </div>
  );
}
