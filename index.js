const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
// const nodemailer = require('nodemailer');
//const smtpTransport = require('nodemailer-smtp-transport');
const jwt = require('jsonwebtoken');

const bodyParser = require('body-parser');
const Multer = require('multer');
const admin = require('firebase-admin');
const cors = require('cors');

const nodemailer = require("./config/nodemailer.config");
const DB = require("./config/db.config");

const port = 8080;

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const serviceAccount = require('./config/firebase-config.json');
const FirebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://ploishare.appspot.com"
});
const storage = FirebaseApp.storage();
const bucket = storage.bucket();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
    origin: '*',
    credentials: true,
};
app.use(cors(corsOptions));

// Parse request body as JSON
app.use(express.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*'); //หรือใส่แค่เฉพาะ domain ที่ต้องการได้
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Connect to MySQL database
const connection = mysql.createConnection({
    host: DB.HOST,
    port: DB.PORT,
    user: DB.USER,
    password: DB.PASSWORD,
    database: DB.DB,
    ssl: DB.SSL
});

connection.connect((error) => {
    if (error) {
        console.error('Error connecting to database:', error.stack);
    } else {
        console.log('Connected to database');
    }
});

app.get('/', (req, res) => {
    return res.send({
        status: "OK",
        message: "Hello Ploishare",
        written_by: "TWT",
        published_on: "01/01/2023",
    })
})
// Create route for registering a new user
app.post('/signup', (req, res) => {
    const { email, password } = req.body;
    // sendVerificationEmail(email);
    // res.json({
    //     status: "OK",
    //     message: 'User registered successfully'
    // });
    // Check if the email already exists in the database
    const sql = 'SELECT * FROM users WHERE email = ?';
    const values = [email];
    connection.query(sql, values, (error, results) => {
        if (error) {
            res.status(500).json({ message: 'Error checking for duplicate email' });
        } else if (results.length > 0) {
            res.status(400).json({ message: 'Email already exists' });
        } else {
            // Hash the password
            const hashedPassword = bcrypt.hashSync(password, 8);

            // Insert the new user into the database
            const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
            const values = [email, hashedPassword];
            connection.query(sql, values, (error) => {
                if (error) {
                    res.status(500).json({ message: 'Error registering user' });

                } else {
                    // Send email verification email
                    nodemailer.sendVerificationEmail(email);
                    res.json({
                        status: "OK",
                        message: 'User registered successfully'
                    });
                }
            });
        }
    });
});


// Create route for verifying an email
app.get('/verify', (req, res) => {
    const { email } = req.query;

    // Update the "verified" field in the database
    const sql = 'UPDATE users SET verified = 1 WHERE email = ?';
    const values = [email];
    connection.query(sql, values, (error) => {
        if (error) {
            res.status(500).json({ message: 'Error verifying email' });
        } else {
            res.json({ message: 'Email verified successfully' });
        }
    });
});

app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    // Query the database for the user with the given email
    const sql = 'SELECT * FROM users WHERE email = ?';
    const values = [email];
    connection.query(sql, values, (error, results) => {
        if (error) {
            res.status(500).json({ message: 'Error logging in' });
        } else if (results.length === 0) {
            res.status(400).json({ message: 'Invalid email or password' });
        } else {
            // Check if the email has been verified
            const verified = results[0].verified;
            if (!verified) {
                res.status(400).json({ message: 'Email has not been verified' });
            } else {
                // Compare the hashed password with the provided password
                const hashedPassword = results[0].password;
                if (bcrypt.compareSync(password, hashedPassword)) {
                    //res.json({ message: 'Logged in successfully' });
                    const token = jwt.sign({ email: results[0].email }, 'secretkey');
                    res.json({
                        status: "OK",
                        message: 'Logged in successfully',
                        token: token,
                        email: results[0].email,
                        type: results[0].type,
                    });
                } else {
                    res.status(400).json({ message: 'Invalid email or password' });
                }
            }
        }
    });
});

// Create route for protected data
app.get('/protected', (req, res) => {
    // Get the JWT from the request header
    const token = req.headers['x-access-token'];

    // Verify the JWT
    jwt.verify(token, 'secretkey', (error, decoded) => {
        if (error) {
            res.status(401).json({ message: 'Not authorized' });
        } else {
            // The JWT is valid, so send the protected data
            res.json({ data: 'protected data' });
        }
    });
});

app.post('/signout', (req, res) => {
    // Clear the JWT from the request header
    req.headers['x-access-token'] = null;
    res.json({ message: 'Logged out successfully' });
});

//=======================================================
// Create a new rental
app.post('/rentals', (req, res) => {
    const { carId, startDateTime, endDateTime, rate } = req.body;
    const day = Math.round((new Date(endDateTime) - new Date(startDateTime)) / 8.64e7) + 1;
    const query = 'INSERT INTO rentals (car_id, start_date_time, end_date_time, rate, day) VALUES (?, ?, ?, ?, ?)';
    const values = [carId, startDateTime, endDateTime, rate, day];
    connection.query(query, values, (error, results) => {
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
});
// app.post('/rentals', (req, res) => {
//     const { carId, startDateTime, endDateTime, rate } = req.body;
//     const day = Math.round((new Date(endDateTime) - new Date(startDateTime)) / 8.64e7) + 1;
//     const query = 'SELECT * FROM rentals WHERE car_id = ? AND (start_date_time <= ? AND end_date_time >= ?) AND (start_date_time <= ? AND end_date_time >= ?)';
//     //const query = 'SELECT * FROM cars WHERE id NOT IN (SELECT car_id FROM rentals WHERE start_date_time <= ? AND end_date_time >= ?)';
//     const values = [carId, startDateTime, endDateTime, startDateTime, endDateTime];
//     connection.query(query, values, (error, results) => {
//         if (error) {
//             res.status(500).json({ error });
//         } else {
//             if (results.length > 0) {
//                 res.status(400).json({ error: 'Rental overlaps with existing rentals' });
//             } else {
//                 // Insert the rental into the database
//                 const result = 'INSERT INTO rentals (car_id, start_date_time, end_date_time, rate, day) VALUES (?, ?, ?, ?, ?)';
//                 const values2 = [carId, startDateTime, endDateTime, rate, day];
//                 connection.query(result, values2, (error, results) => {
//                     if (error) {
//                         if (error.code === 'ER_DUP_ENTRY') {
//                             res.status(400).json({ error: 'Duplicate rental' });
//                         } else {
//                             res.status(500).json({ error });
//                         }
//                     } else {
//                         res.status(201).json({ results });
//                     }
//                 });
//             }
//         }
//     });
// });
// Rental List
app.get('/list/users', (req, res) => {
    connection.query('SELECT * FROM users', (error, results) => {
        if (error) {
            // If an error occurred, send a server error response
            res.status(500).json({ error });
        } else {
            // Otherwise, send the results as a JSON array
            res.json(results);
        }
    });
});

// Rental List
app.get('/list/rentals', (req, res) => {
    connection.query('SELECT * FROM rentals', (error, results) => {
        if (error) {
            // If an error occurred, send a server error response
            res.status(500).json({ error });
        } else {
            // Otherwise, send the results as a JSON array
            res.json(results);
        }
    });
});

// Set up the routes for the app
app.get('/list/cars', (req, res) => {
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


app.post('/add/car', (req, res) => {
    const { id, make, model, year, color, rental_rate, image } = req.body;
    const sql = 'SELECT * FROM cars WHERE id = ?';
    const values = [id];
    connection.query(sql, values, (error, results) => {
        if (error) {
            res.status(500).json({ message: 'Error checking for duplicate id' });
        } else if (results.length > 0) {
            res.status(400).json({ message: 'id already exists' });
        } else {

            // Insert the new user into the database
            const sql = 'INSERT INTO cars (id, make, model, year, color, rental_rate, image) VALUES (?, ?,?, ?, ?, ?, ?)';
            const values = [id, make, model, year, color, rental_rate, image];
            connection.query(sql, values, (error) => {
                if (error) {
                    res.status(500).json({ message: 'Error add car' });

                } else {
                    res.json({
                        status: "OK",
                        message: 'Car added successfully'
                    });
                }
            });
        }
    });
});
//upload car
// app.post("/add/car", jsonParser, function (req, res, next) {
//     sqlConnect.query(
//         "INSERT INTO cars (RiceID,RiceDepositor,RiceCategory,RiceQuantity,RiceReturn,RiceEntryDate,RiceIssueDate) VALUES (?,?,?,?,?,?,?)",
//         [
//             req.body.RiceID,
//             req.body.RiceDepositor,
//             req.body.RiceCategory,
//             req.body.RiceQuantity,
//             req.body.RiceReturn,
//             req.body.RiceEntryDate,
//             null,
//         ],
//         (err, result, fields) => {
//             if (err) {
//                 return res.json({ status: "error", message: err });
//             } else {
//                 res.json({ status: "add ok" });
//             }
//         }
//     );
// });
//upload file
app.post('/upload/firebase', multer.single('img'), (req, res) => {
    var publicUrl
    const folder = 'uploads'
    const fileName = `${folder}/${Date.now()}`
    const fileUpload = bucket.file(fileName);
    const blobStream = fileUpload.createWriteStream({
        metadata: {
            contentType: "image/png",
        }
    });
    blobStream.on('error', (err) => {
        res.status(405).json(err);
    });
    blobStream.on('finish', () => {
        publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileUpload.name)}?alt=media`;
        res.status(200).send(publicUrl);
    });
    blobStream.end(req.file.buffer);
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
// Start
