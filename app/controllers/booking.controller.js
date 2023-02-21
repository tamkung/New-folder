const connection = require("../config/db.config");
const request = require('request');
const nodemailer = require("../config/nodemailer.config");

const url_line_notify = "https://notify-api.line.me/api/notify";
//const TOKEN = "3gyNVnhIk7bJOOAXNCqsCyl5Y4skkf3fz0HmSFknJff" 
const TOKEN = "VDjb3kVwPw1el08RIMeUYafc7sZKaMLYoXmjnvliBvF"

exports.addBooking = async (req, res) => {
    try {
        const { id, province, uName, empoyeeNo, uEmail, uPhone, uSectNo, uSectName, note, startDateTime, endDateTime, bookingDate, cLicense, cName, image, status } = req.body;
        const day = Math.round((new Date(endDateTime) - new Date(startDateTime)) / 8.64e7) + 1;
        const query = 'INSERT INTO booking (id, province, uName, empoyeeNo, uEmail, uPhone, uSectNo, uSectName, note, startDateTime, endDateTime, bookingDate, cLicense, cName, day, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [id, province, uName, empoyeeNo, uEmail, uPhone, uSectNo, uSectName, note, startDateTime, endDateTime, bookingDate, cLicense, cName, day, image, status];
        connection.query(query, values, (error, results) => {
            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    res.status(400).json({ error });
                } else {
                    res.status(500).json({ error });
                }
            } else {
                request({
                    method: 'POST',
                    uri: url_line_notify,
                    header: {
                        'Content-Type': 'multipart/form-data',
                    },
                    auth: {
                        bearer: TOKEN,
                    },
                    form: {
                        message: `เลขที่ใบจอง: ${id} \nชื่อผู้จอง: ${uName} \nรหัสพนักงาน: ${empoyeeNo} \nเบอร์โทร: ${uPhone} \nวันที่ใช้รถ: ${startDateTime} \nวันที่คืนรถ: ${endDateTime} \nทะเบียนรถ: ${cLicense} \nชื่อรถ: ${cName} \nจังหวัด: ${province} \nหมายเหตุ: ${note}`,
                    },
                }, (err, httpResponse, body) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(body)
                    }
                });
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

exports.getBooking = async (req, res) => {
    try {
        connection.query('SELECT * FROM booking ORDER BY id DESC', (error, results) => {
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

exports.getBookingByEmail = async (req, res) => {
    try {
        const uEmail = req.params.id;
        connection.query('SELECT * FROM booking WHERE uEmail = ? ORDER BY id DESC', [uEmail], (error, results) => {
            if (error) {
                // If an error occurred, send a server error response
                res.json(results.length > 0 ? results[0] : { message: 'Booking not found' });
            } else {
                // Otherwise, send the results as a JSON array
                res.json(results);
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    };
};

exports.sendNotify = async (req, res) => {
    try {
        const { email, license } = req.body;
        console.log(email + license);
        nodemailer.sendEmailNotify(email, license);
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    };
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        console.log(id, status);
        connection.query('UPDATE booking SET status = ? WHERE id = ?', [status, id], (error, results) => {
            if (error) {
                // If an error occurred, send a server error response
                res.status(500).json({ error });
            } else {
                // Otherwise, send the results as a JSON array
                res.send({ message: 'Update Status Success.' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    };
};

exports.updateBookingStartMile = async (req, res) => {
    try {
        const { id, startMile } = req.body;
        console.log(id, startMile);
        console.log('asdasd');
        connection.query('UPDATE booking SET startMile = ? WHERE id = ?', [startMile, id], (error, results) => {
            if (error) {
                // If an error occurred, send a server error response
                res.status(500).json({ error });
            } else {
                // Otherwise, send the results as a JSON array
                res.send({ message: 'Update StartMile Success.' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    };
};

exports.updateBookingEndMile = async (req, res) => {
    try {
        const { id, endDateTime, endMile } = req.body;
        console.log(id, endDateTime, endMile);
        // const distance = endMile - startMile;
        connection.query('UPDATE booking SET endDateTime = ?, endMile = ?, distance = endMile - startMile  WHERE id = ?', [endDateTime, endMile, id], (error, results) => {
            if (error) {
                // If an error occurred, send a server error response
                res.status(500).json({ error });
            } else {
                // Otherwise, send the results as a JSON array
                res.send({ message: 'Update EndMile Success.' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    };
};

exports.updateBookingImage = async (req, res) => {
    try {
        const { id, image } = req.body;
        console.log(id, image);
        // const distance = endMile - startMile;
        connection.query('UPDATE booking SET image = ? WHERE id = ?', [image, id], (error, results) => {
            if (error) {
                // If an error occurred, send a server error response
                res.status(500).json({ error });
            } else {
                // Otherwise, send the results as a JSON array
                res.send({ message: 'Update Image Success.' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!!!' });
    };
};


exports.searchBookingByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        connection.query('SELECT * FROM booking WHERE bookingDate BETWEEN ? AND ?', [startDate, endDate], (error, results) => {
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
}

exports.searchBookingByEmail = async (req, res) => {
    try {
        const { uEmail } = req.body;
        connection.query('SELECT * FROM booking WHERE uEmail = ?', [uEmail], (error, results) => {
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
}