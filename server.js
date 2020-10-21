'use strict';

require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const app = express();
const cors = require('cors');
const { response } = require('express');
const PORT = process.env.PORT || 3030;
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));


//include ejs usage
app.set('view engine', 'ejs');

// do not forget to add this line
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());

app.get('/', (req, res) => {
  let sql = `SELECT * FROM books;`;
  client.query(sql)
    .then ( results => {
      res.render('pages/index', {seedBooks: results.rows});
    })
    .catch(err => console.error('returned error:', err));
});

app.get('/books/:id', (req, res) => {
  
  let searchId = req.params.id;

  let sql = `SELECT * FROM books where id=${searchId}`

  client.query(sql)
    .then(results => {
      res.render('pages/books/detail', {book: results.rows[0]});
    })
    .catch(err => console.error('returned error:', err));

});

//render the HTML page at ./pages/index.ejs
app.get('/search', (req, res) => {
  res.render('pages/searches/new');
});

//post the searches folder
app.post('/searches', createSearch);
app.post('/books', saveBook);

function Book(obj) {
  let thumbnail = obj.volumeInfo.imageLinks ? obj.volumeInfo.imageLinks.thumbnail ? obj.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg' : 'https://i.imgur.com/J5LVHEL.jpg';
  if (thumbnail[4] !== 's') {
    thumbnail = thumbnail.slice(0, 4) + 's' + thumbnail.slice(4);
  }
  this.image = thumbnail;
  this.title = obj.volumeInfo.title ? obj.volumeInfo.title : 'Unknown';
  this.authors = obj.volumeInfo.authors ? obj.volumeInfo.authors : 'Unknown';
  this.description = obj.volumeInfo.description ? obj.volumeInfo.description : 'No Description';
  this.isbn = obj.volumeInfo.industryIdentifiers ? obj.volumeInfo.industryIdentifiers[0].type.includes('ISBN') ? obj.volumeInfo.industryIdentifiers[0].identifier : obj.volumeInfo.industryIdentifiers[0].identifier.replace(/\b[A-Z]*?\b\:/, '') : 'unknown';
}

function createSearch(req, res) {
  let searchType = 'in' + req.body.search[1];
  let searchQuery = req.body.search[0];
  let url = `https://www.googleapis.com/books/v1/volumes?q=${searchType}:${searchQuery}`;
  console.log(url);

  superagent.get(url)
    .then(data => {
      let bookShelf = data.body.items.map(books => new Book(books));
      res.render('pages/searches/show', {searchBooks: bookShelf} );
      // res.json(data.text);
    })
    .catch(err => res.render('pages/error', { error: err}));
  // another hint!
  // you aren't going to send json, you are going to send
  // a page with json data already mapped into it
  // ie: res.render('bookresults', { searchResults: data })
}

function saveBook(req, res){
  let savedBook = {
    title: req.body.title,
    image: req.body.image,
    authors: req.body.authors,
    description: req.body.description,
    isbn: req.body.isbn
  };
  let sql = 'INSERT INTO books (authors, title, image, description, isbn) VALUES($1, $2, $3, $4, $5) RETURNING id';
  let values = [savedBook.authors, savedBook.title, savedBook.image, savedBook.description, savedBook.isbn]
  client.query(sql, values)
    .then(results => {
      res.redirect(`/books/${results.rows[0].id}`);
    })
    .catch(err => res.render('pages/error', { error: err}));
}

app.get('*', (req, res) => res.render('pages/error', { error: '404'}));

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
