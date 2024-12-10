const request = require('supertest');
const { app, books } = require('../src/2-books/app');

describe('Book Management API', () => {
    beforeEach(() => {
        books.length = 0;
    });

    it('should add a new book with valid data', async () => {
        const newBook = { title: 'The Secret History', publisher: 'Penguin Books' };

        const response = await request(app)
            .post('/books')
            .send(newBook)
            .expect(201)
            .expect('Content-Type', /json/);

        expect(response.body).toMatchObject({ ...newBook, loaned: false });
        expect(response.body).toHaveProperty('id', 1);
        expect(books).toHaveLength(1);
    });

    it('should return an error when adding a book with invalid data', async () => {
        const invalidBook = { publisher: 'Penguin Books' };

        const response = await request(app)
            .post('/books')
            .send(invalidBook)
            .expect(400)
            .expect('Content-Type', /json/);

        expect(response.body).toEqual({ error: 'Title and publisher are required' });
        expect(books).toHaveLength(0);
    });

    it('should list all books', async () => {
        books.push({ id: 1, title: 'The Secret History', publisher: 'Penguin Books', loaned: false });

        const response = await request(app)
            .get('/books')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({ title: 'The Secret History', publisher: 'Penguin Books', loaned: false });
    });

    it('should update an existing book', async () => {
        books.push({ id: 1, title: 'Old Title', publisher: 'Old Publisher', loaned: false });

        const updatedBook = { title: 'New Title', publisher: 'New Publisher' };

        const response = await request(app)
            .put('/books/1')
            .send(updatedBook)
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body).toMatchObject({ ...updatedBook, id: 1, loaned: false });
    });

    it('should delete a book and confirm it no longer exists', async () => {
        books.push({ id: 1, title: 'The Secret History', publisher: 'Penguin Books', loaned: false });

        await request(app)
            .delete('/books/1')
            .expect(200)
            .expect('Content-Type', /json/);

        expect(books).toHaveLength(0);
    });

    it('should loan a book and mark it as unavailable', async () => {
        books.push({ id: 1, title: 'The Secret History', publisher: 'Penguin Books', loaned: false });

        const response = await request(app)
            .post('/loans')
            .send({ title: 'The Secret History' })
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body.message).toBe('Book loaned successfully!');
        expect(books[0].loaned).toBe(true);
    });

    it('should return a book and make it available again', async () => {
        books.push({ id: 1, title: 'The Secret History', publisher: 'Penguin Books', loaned: true });

        const response = await request(app)
            .post('/returns')
            .send({ title: 'The Secret History' })
            .expect(200)
            .expect('Content-Type', /json/);

        expect(response.body.message).toBe('Book returned successfully!');
        expect(books[0].loaned).toBe(false);
    });

    it('should not loan an unavailable book', async () => {
        books.push({ id: 1, title: 'The Secret History', publisher: 'Penguin Books', loaned: true });

        const response = await request(app)
            .post('/loans')
            .send({ title: 'The Secret History' })
            .expect(400)
            .expect('Content-Type', /json/);

        expect(response.body.error).toBe('This book is already loaned');
    });

    it('should return an error when loaning a non-existent book', async () => {
        const response = await request(app)
            .post('/loans')
            .send({ title: 'Non-existent Book' })
            .expect(404)
            .expect('Content-Type', /json/);

        expect(response.body.error).toBe('Book not found');
    });
});
