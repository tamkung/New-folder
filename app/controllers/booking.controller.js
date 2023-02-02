const connection = require("../config/db.config");
const request = require('request');

const url_line_notify = "https://notify-api.line.me/api/notify";
//const TOKEN = "3gyNVnhIk7bJOOAXNCqsCyl5Y4skkf3fz0HmSFknJff" 
const TOKEN = "VDjb3kVwPw1el08RIMeUYafc7sZKaMLYoXmjnvliBvF" 

exports.addbooking = async (req, res) => {
    try {
        const { id, province, uName, empoyeeNo, uEmail, uPhone, uSect, uPart, note, startDateTime, endDateTime, bookingDate, cLicense } = req.body;
        const day = Math.round((new Date(endDateTime) - new Date(startDateTime)) / 8.64e7) + 1;
        const query = 'INSERT INTO booking (id, province, uName, empoyeeNo, uEmail, uPhone, uSect, uPart, note, startDateTime, endDateTime, bookingDate, cLicense, day) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [id, province, uName, empoyeeNo, uEmail, uPhone, uSect, uPart, note, startDateTime, endDateTime, bookingDate, cLicense, day];
        connection.query(query, values, (error, results) => {
            if (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    res.status(400).json({ error: 'Duplicate booking' });
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
                        message: `เลขที่ใบจอง: ${id} \nชื่อผู้จอง: ${uName} \nเบอร์โทร: ${uPhone} \nวันที่ใช้รถ: ${startDateTime} \nวันที่คืนรถ: ${endDateTime} \nทะเบียนรถ: ${cLicense} \nจังหวัด: ${province} \nหมายเหตุ: ${note}`,
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

exports.getbookingbyemail = async (req, res) => {
    try {
        const uEmail = req.params.id;
        connection.query('SELECT * FROM booking WHERE uEmail = ?', [uEmail], (error, results) => {
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