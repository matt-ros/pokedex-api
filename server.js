require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const POKEDEX = require('./pokedex.json');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');
  
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  next();
});

app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000;

app.listen(PORT)

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`];

function handleGetTypes(req, res) {
  res.json(validTypes);
}

app.get('/types', handleGetTypes);

function handleGetPokemon(req, res) {
  const { name = '', type = '' } = req.query;

  if (type) {
    if (!validTypes.includes(type)) {
      return res.status(400).send('Type must be one of the provided types');
    }
  }

  const results = POKEDEX.pokemon.filter(entry => (
    entry.name.toLowerCase().includes(name.toLowerCase())
  ));

  if (type) {
    const filtered = results.filter(entry => (
      entry.type.includes(type)
    ));
    return res.json(filtered);
  }
  
  return res.json(results);
}

app.get('/pokemon', handleGetPokemon);

