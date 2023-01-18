const connection = require("../config/db.config");

exports.addcar = async (req, res) => {
    try {
        const { license, province, brand, color, detail, image } = req.body;
        const sql = 'SELECT * FROM cars WHERE license = ?';
        const values = [license];
        connection.query(sql, values, (error, results) => {
            if (error) {
                res.status(500).json({ message: 'Error checking for duplicate license' });
            } else if (results.length > 0) {
                res.status(400).json({ message: 'license already exists' });
            } else {

                // Insert the new user into the database
                const sql = 'INSERT INTO cars (license, province, brand, color, detail, image) VALUES (?,?, ?, ?, ?, ?)';
                const values = [license, province, brand, color, detail, image];
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
    } catch (error) {
        res.status(500).json({ message: 'Error add car' });
    }
};

exports.getcar = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: 'Error get car' });
    };
};

exports.getcarbyid = async (req, res) => {
    try {
        const license = req.params.id;
        connection.query('SELECT * FROM cars WHERE license = ?',[license], (error, results) => {
            if (error) {
                // If an error occurred, send a server error response
                res.status(500).json({ error });
            } else {
                // Otherwise, send the results as a JSON array
                res.json(results.length > 0 ? results[0] : { message: 'Car not found' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error get car' });
    };
};

exports.updatecar = async (req, res) => { };

exports.deletecar = async (req, res) => { };

exports.getavailablecars = async (req, res) => {
    try {
        // Retrieve the start and end dates and times from the query string
        const { startDateTime, endDateTime } = req.query;
        // Find cars that are available for rent within the given time period
        connection.query(
            'SELECT * FROM cars WHERE license NOT IN (SELECT cLicense FROM booking WHERE startDateTime <= ? AND endDateTime >= ?)',
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
    } catch (error) {
        res.status(500).json({ message: 'Error get available cars' });
    }
};

exports.addbooking = async (req, res) => {
    try {
        const { carId, startDateTime, endDateTime, rate } = req.body;
        const day = Math.round((new Date(endDateTime) - new Date(startDateTime)) / 8.64e7) + 1;
        const query = 'INSERT INTO booking (startDateTime, endDateTime, cLicense, day) VALUES (?, ?, ?, ?, ?)';
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
    } catch (error) {
        res.status(500).json({ message: 'Error add booking' });
    };
};
exports.getbooking = async (req, res) => {
    try {
        connection.query('SELECT * FROM booking', (error, results) => {
            if (error) {
                // If an error occurred, send a server error response
                res.status(500).json({ error });
            } else {
                // Otherwise, send the results as a JSON array
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error get booking' });
    };
};

