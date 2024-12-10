const express = require('express');
const app = express();

app.use(express.json());

let books = [];

// Helper functions:
// const findBookById = (id) => books.find((book) => book.id === id);
// const findBookByTitle = (title) => books.find((book) => book.title === title);


app.use((req, res, next) => {
    if (req.headers['content-type'] !== 'application/json') {
        return res.status(400).json({ error: 'Content-Type must be application/json' });
    }
    next();
});


app.post('/books', (req, res) => {
    const { title, publisher } = req.body;

    if (!title || !publisher) {
        return res.status(400).json({ error: 'Title and publisher are required' });
    }

    const book = {
        id: books.length + 1,
        title,
        publisher,
        loaned: false,
    };

    books.push(book);
    res.status(201).json(book);
});


app.get('/books', (req, res) => {
    res.json(books);
});


app.put('/books/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { title, publisher } = req.body;

    if (!title || !publisher) {
        return res.status(400).json({ error: 'Title and publisher are required' });
    }

    const bookIndex = books.findIndex((book) => book.id === id);

    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }

    books[bookIndex] = { ...books[bookIndex], title, publisher };
    res.status(200).json(books[bookIndex]);
});


app.delete('/books/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const bookIndex = books.findIndex((book) => book.id === id);

    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }

    books.splice(bookIndex, 1);
    res.status(200).json({ message: 'Book deleted successfully' });
});


app.post('/loans', (req, res) => {
    const { title } = req.body;

    const bookIndex = books.findIndex((book) => book.title === title);

    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }

    if (books[bookIndex].loaned) {
        return res.status(400).json({ error: 'This book is already loaned' });
    }

    books[bookIndex].loaned = true;
    res.status(200).json({ message: 'Book loaned successfully!', book: books[bookIndex] });
});


app.post('/returns', (req, res) => {
    const { title } = req.body;

    const bookIndex = books.findIndex((book) => book.title === title);

    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }

    if (!books[bookIndex].loaned) {
        return res.status(400).json({ error: 'This book is not currently loaned' });
    }

    books[bookIndex].loaned = false;
    res.status(200).json({ message: 'Book returned successfully!', book: books[bookIndex] });
});


module.exports = { app, books };
