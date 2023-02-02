const connection = require("../config/db.config");

exports.getUser = async (req, res) => {
    try {
        connection.query('SELECT email FROM users WHERE type <> "admin"', (error, results) => {
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