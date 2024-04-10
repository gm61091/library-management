const express = require('express');
const pgp = require('pg-promise')();
const db = pgp('postgres://qonnxkqn:yAamuth4AZ0bhZEGuoBLeR6tfHO-wXYC@raja.db.elephantsql.com/qonnxkqn');
const PORT = 3000;

const app = express();
app.use(express.json());

// Update the price of all books in the Fantasy genre by increasing it by 10%.
app.put('/books/updatePrice', async (req, res) => {
    await db.none('UPDATE books SET price = price * 1.1 WHERE genre = $1', ['Fantasy']);
    res.send('Prices updated by 10% for all books in the Fantasy genre.');
});

// Delete the book with the lowest price from the table.
app.delete('/books/:id', async (req, res) => {
    await db.none('DELETE FROM books WHERE id = (SELECT id FROM books ORDER BY price ASC LIMIT 1)');
    res.send('Deleted book with the lowest price.');
});

// Show all books that are in_stock.
app.get('/books', async (req, res) => {
    const inStockBooks = await db.many('SELECT * FROM books WHERE in_stock = true');
    res.json(inStockBooks);
});

// Show the average price of all books in the Mystery genre.
app.get('/books/averagePriceMystery', async (req, res) => {
    const avgPriceMystery = await db.one('SELECT AVG(price) AS average_price FROM books WHERE genre = $1', ['Mystery']);
    res.json(avgPriceMystery);
});

// Add a column page_count to your table.
app.put('/books', async (req, res) => {
    await db.none('ALTER TABLE books ADD COLUMN page_count INT');
    res.send('Column added');
});

// Update the table so that all books published before 2010 have their in_stock status set to false.
app.put('/books', async (req, res) => {
    await db.none("UPDATE books SET in_stock = false WHERE publication_date < '2010-01-01'");
    res.send('Updated books before 2010');
});

// Show the titles of books that have more than 300 pages.
app.get('/books/moreThan300Pages', async (req, res) => {
    const booksMoreThan300Pages = await db.any('SELECT title FROM books WHERE page_count > 300');
    res.json(booksMoreThan300Pages);
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}.`);
});
