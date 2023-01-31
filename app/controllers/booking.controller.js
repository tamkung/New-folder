const connection = require("../config/db.config");

exports.addbooking = async (req, res) => {
    try {
        const { id, uName, empoyeeNo, uPhone, uSect, uPart, note, startDateTime, endDateTime, cLicense } = req.body;
        const day = Math.round((new Date(endDateTime) - new Date(startDateTime)) / 8.64e7) + 1;
        const query = 'INSERT INTO booking (id, uName, empoyeeNo, uPhone, uSect, uPart, note, startDateTime, endDateTime, cLicense, day) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [id, uName, empoyeeNo, uPhone, uSect, uPart, note, startDateTime, endDateTime, cLicense, day];
        connection.query(query, values, (error, results) => {
            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    res.status(400).json({ error: 'Duplicate booking' });
                } else {
                    res.status(500).json({ error });
                }
            } else {
                res.json({
                    status: "OK",
                    message: 'Booking added successfully'
                });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
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
        res.status(500).json({ message: 'Server Error!!!' });
    };
};