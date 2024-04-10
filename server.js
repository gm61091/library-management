const express = require('express');
const pgp = require('pg-promise')();
const db = pgp('postgres://qonnxkqn:yAamuth4AZ0bhZEGuoBLeR6tfHO-wXYC@raja.db.elephantsql.com/qonnxkqn');
const PORT = 3000;

const app = express();
app.use(express.json());

// Update the fines_due of all members with more than 5 books borrowed by adding a $2 fine for each extra book
app.put('/members/updateFines', async (req, res) => {
    await db.none(`
    UPDATE members 
    SET fines_due = (books_borrowed - 5) * 2 
    WHERE books_borrowed > 5
`);
res.send('Fines updated successfully');
});

// Delete the member with the highest fines_due
app.delete('/members/deleteHighestFines', async (req, res) => {
    await db.none('DELETE FROM members WHERE fines_due = (SELECT MAX(fines_due) FROM members)');
    res.send('Deleted member with the highest fines.');
});

// Show all members with a membership_type of "Premium"
app.get('/members/premium', async (req, res) => {
    const premiumMembers = await db.any("SELECT * FROM members WHERE membership_type = 'Premium'");
    res.json(premiumMembers);
});

// Show the total number of books borrowed by all members
app.get('/members/totalBooksBorrowed', async (req, res) => {
    const totalBooksBorrowed = await db.one('SELECT SUM(books_borrowed) AS total FROM members');
    res.json(totalBooksBorrowed);
});

// Add a column email to your table
app.put('/members/addEmailColumn', async (req, res) => {
    await db.none('ALTER TABLE members ADD COLUMN email VARCHAR(255)');
    res.send('Column "email" added to table "members"');
});

// Update the table so that all members with a membership_start_date before 2018 have their membership_type upgraded to "Gold"
app.put('/members/upgradeMembership', async (req, res) => {
    await db.none("UPDATE members SET membership_type = 'Gold' WHERE membership_start_date < '2018-01-01'");
    res.send('Membership upgraded for members joined before 2018.');
});

// Show the names and membership types of members with no fines_due
app.get('/members/noFinesDue', async (req, res) => {
    const membersNoFinesDue = await db.any("SELECT name, membership_type FROM members WHERE fines_due = 0");
    res.json(membersNoFinesDue);
});


app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}.`);
});
