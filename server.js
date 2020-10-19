'use strict';

const express = require('express');
const superagent = require('superagent');
const app = express();
const PORT = process.env.PORT || 3000;

// do not forget to add this line
app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('pages/index');
});

app.post('/searches', createSearch);

function createSearch(req, res) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  console.log('request body:', req.body);
  console.log('form data:', req.body.search);

  if (req.body.search[1] === 'title') { url += `+intitle:${req.body.search[0]}`; }
  if (req.body.search[1] === 'author') { url += `+inauthor:${req.body.search[0]}`; }

  superagent.get(url)
    .then(data => {
      console.log('google books data:', data);
      res.json(data.text);
      // res.render('results', { results: data }) <--- hint!
    })
    .catch(err => console.error(err))
    // another hint!
    // you aren't going to send json, you are going to send
    // a page with json data already mapped into it
    // ie: res.render('bookresults', { searchResults: data })
}

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});