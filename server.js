'use strict';

const express = require('express');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3000;

// first route - simple array management -> /list
let list = ['apples', 'celery', 'butter', 'milk', 'eggs'];

let quantities = [
  { name: 'apples', quantity: 4 },
  { name: 'celery', quantity: 2 },
  { name: 'butter', quantity: 100 },
  { name: 'milk', quantity: 1 },
  { name: 'eggs', quantity: 12 }
]

app.get('/', (req, res) => {
  // when we hit this route, send the user back
  // a file -> that file is the associated ejs template
  // you can omit the .ejs from it
  res.render('index');
});

app.get('/list', (req, res) => {
  res.render('list', { arrayOfItems: list })
});

app.get('/quantities', (req, res) => {
  res.render('quantities', { groceryObjects: quantities })
});

app.listen(PORT, () => {
  console.log(`server up! :::${PORT}:::`)
});