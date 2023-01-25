const express = require('express');
const { readdirSync } = require("fs");
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const corsOptions = {
    origin: '*',
    credentials: true,
};

app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// Parse request body as JSON
app.use(express.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

readdirSync("./app/routes").map((r) => app.use("/api", require("./app/routes/" + r)));

app.get('/', (req, res) => {
    return res.send({
        status: "OK",
        message: "Hello Ploishare",
        written_by: "TWT",
        published_on: "01/01/2023",
    })
})

// Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});