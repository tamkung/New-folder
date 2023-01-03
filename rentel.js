const express = require('express');
const mysql = require('mysql');

// Create a connection to the database
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    database: 'test'
});

// Connect to the database
connection.connect();

// Create an express app
const app = express();

// Parse request bodies as JSON
app.use(express.json());

// Create a new rental
// app.post('/rentals', (req, res) => {
//     const { carId, startDateTime, endDateTime, rate } = req.body;
//     const day = Math.round((new Date(endDateTime) - new Date(startDateTime)) / 8.64e7) + 1;
//     const query = 'INSERT INTO rentals (car_id, start_date_time, end_date_time, rate, day) VALUES (?, ?, ?, ?, ?)';
//     const values = [carId, startDateTime, endDateTime, rate, day];
//     connection.query(query, values, (error, results) => {
//         if (error) {
//             if (error.code === 'ER_DUP_ENTRY') {
//                 res.status(400).json({ error: 'Duplicate rental' });
//             } else {
//                 res.status(500).json({ error });
//             }
//         } else {
//             res.status(201).json({ results });
//         }
//     });
// });
app.post('/rentals', (req, res) => {
    const { carId, startDateTime, endDateTime, rate } = req.body;
    const day = Math.round((new Date(endDateTime) - new Date(startDateTime)) / 8.64e7) + 1;
    const query = 'SELECT * FROM rentals WHERE car_id = ? AND (start_date_time <= ? AND end_date_time >= ?) AND (start_date_time <= ? AND end_date_time >= ?)';
    //const query = 'SELECT * FROM cars WHERE id NOT IN (SELECT car_id FROM rentals WHERE start_date_time <= ? AND end_date_time >= ?)';
    const values = [carId, startDateTime, endDateTime, startDateTime, endDateTime];
    connection.query(query, values, (error, results) => {
        if (error) {
            res.status(500).json({ error });
        } else {
            if (results.length > 0) {
                res.status(400).json({ error: 'Rental overlaps with existing rentals' });
            } else {
                // Insert the rental into the database
                const result = 'INSERT INTO rentals (car_id, start_date_time, end_date_time, rate, day) VALUES (?, ?, ?, ?, ?)';
                const values2 = [carId, startDateTime, endDateTime, rate, day];
                connection.query(result, values2, (error, results) => {
                    if (error) {
                        if (error.code === 'ER_DUP_ENTRY') {
                            res.status(400).json({ error: 'Duplicate rental' });
                        } else {
                            res.status(500).json({ error });
                        }
                    } else {
                        res.status(201).json({ results });
                    }
                });
            }
        }
    });
});


// Set up the routes for the app
app.get('/cars', (req, res) => {
    // Retrieve a list of all cars from the database
    connection.query('SELECT * FROM cars', (error, results) => {
        if (error) {
            // If an error occurred, send a server error response
            res.status(500).json({ error });
        } else {
            // Otherwise, send the results as a JSON array
            res.json(results);
        }
    });
});

app.get('/available-cars', (req, res) => {
    // Retrieve the start and end dates and times from the query string
    const { startDateTime, endDateTime } = req.query;

    // Find cars that are available for rent within the given time period
    connection.query(
        'SELECT * FROM cars WHERE id NOT IN (SELECT car_id FROM rentals WHERE start_date_time <= ? AND end_date_time >= ?)',
        [endDateTime, startDateTime],
        (error, results) => {
            if (error) {
                // If an error occurred, send a server error response
                res.status(500).json({ error });
            } else {
                // Otherwise, send the results as a JSON array
                res.json(results);
            }
        }
    );
});

// Start the server
app.listen(3000, () => {
    console.log('Server listening on port 3000');
});