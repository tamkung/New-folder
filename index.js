const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const jwt = require('jsonwebtoken');

const bodyParser = require('body-parser');
const Multer = require('multer');
const admin = require('firebase-admin');
const cors = require('cors');

const port = 8080;

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const serviceAccount = require('./firebase-config.json');
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
    //local DB
    // host: 'localhost',
    // port: 3307,
    // user: 'root',
    // database: 'test'

    //planetscale DB
    host: "ap-southeast.connect.psdb.cloud",
    user: "315tbrkooe37c1c3ih5b",
    password: "pscale_pw_fpzwYnqTEK38acUZFp0thOIBDTcgeKWmFOYRXIGpHUr",
    database: "test",
    ssl: { "rejectUnauthorized": true }

    //filess DB
    // host: "wl7.h.filess.io",
    // port: 3307,
    // user: "test_storebegun",
    // password: "91e5084fc48278128c391c0d69df024a486cf06a",
    // database: "test_storebegun",
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
        status: "Online",
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
                    sendVerificationEmail(email);
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


// Function for sending email verification email
function sendVerificationEmail(email) {
    const transporter = nodemailer.createTransport(smtpTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        secure: false,
        port: 465,
        auth: {
            user: "ploishare@gmail.com",
            pass: "gqvmyzfrbhyypljp"
        },
        pool: true,
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false,
        },
    }));

    const mailOptions = {
        from: '"ปล่อยShare" <noreply@example.com>',
        to: email,
        subject: 'Please confirm your account',
        // html: `<h1>Email Confirmation</h1>
        // <h2>Hello ${email}</h2>
        // <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
        // <a href="https://api-ploishare.cyclic.app/verify?email=${email}"> Click here</a>
        // </div>`,
        //html: '<p>Click <a href="https://api-ploishare.cyclic.app/verify?email=' + email + '">here</a> to verify your email</p>'
        html: `<div class="es-wrapper-color">
        <!--[if gte mso 9]>
      <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
        <v:fill type="tile" color="#fafafa"></v:fill>
      </v:background>
    <![endif]-->
        <table width="100%" cellspacing="0" cellpadding="0">
            <tbody>
                <tr>
                    <td class="esd-email-paddings" valign="top">
                        <table cellpadding="0" cellspacing="0" class="es-content esd-footer-popover" align="center">
                            <tbody>
                                <tr>
                                    <td class="esd-stripe" align="center">
                                        <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" width="600">
                                            <tbody>
                                                <tr>
                                                    <td class="esd-structure es-p30t es-p30b es-p20r es-p20l" align="left">
                                                        <table cellpadding="0" cellspacing="0" width="100%">
                                                            <tbody>
                                                                <tr>
                                                                    <td width="560" class="esd-container-frame" align="center" valign="top">
                                                                        <table cellpadding="0" cellspacing="0" width="100%">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td align="center" class="esd-block-image es-p10t es-p10b" style="font-size: 0px;"><a target="_blank"><img src="https://ayiqmq.stripocdn.email/content/guids/CABINET_67e080d830d87c17802bd9b4fe1c0912/images/55191618237638326.png" alt style="display: block;" width="100"></a></td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td align="center" class="esd-block-text es-p10b es-m-txt-c">
                                                                                        <h1 style="font-size: 46px; line-height: 100%;">Confirm Your Email</h1>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td align="center" class="esd-block-text es-p5t es-p5b es-p40r es-p40l es-m-p0r es-m-p0l">
                                                                                        <p>You’ve received this message because your email address has been registered with our site. Please click the button below to verify your email address and confirm that you are the owner of this account.</p>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td align="center" class="esd-block-text es-p10t es-p5b">
                                                                                        <p>If you did not register with us, please disregard this email.</p>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td align="center" class="esd-block-button es-p10t es-p10b"><span class="es-button-border" style="border-radius: 6px;"><a href="https://ploishare.vercel.app/confirm/${email}" class="es-button" target="_blank" style="background-color: #4CAF50; /* Green */ border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px;">CONFIRM YOUR EMAIL</a></span></td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td align="center" class="esd-block-text es-p5t es-p5b es-p40r es-p40l es-m-p0r es-m-p0l">
                                                                                        <p>Once confirmed, this email will be uniquely associated with your account.</p>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

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
