const express = require('express');
const { readdirSync } = require("fs");

const bodyParser = require('body-parser');
const Multer = require('multer');
const admin = require('firebase-admin');
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

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const serviceAccount = require('./app/config/firebase-config.json');
const FirebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://ploishare.appspot.com"
});
const storage = FirebaseApp.storage();
const bucket = storage.bucket();

readdirSync("./app/routes").map((r) => app.use("/api", require("./app/routes/" + r)));

app.get('/', (req, res) => {
    return res.send({
        status: "OK",
        message: "Hello Ploishare",
        written_by: "TWT",
        published_on: "01/01/2023",
    })
})

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


app.get('/get-files', async (req, res) => {
    try {
        const [files] = await bucket.getFiles({ prefix: "uploads/" });

        const fileData = await Promise.all(
            files.map(async (file) => {
                return {
                    name: file.name.replace("uploads/", ""),
                    type: file.metadata.contentType,
                    url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`,
                };
            })
        );
        res.send(fileData);
        console.log(fileData.length);
    } catch (error) {
        console.error(error); // log the error
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.delete('/file/:fileId', async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const storage = admin.storage();
        const file = storage.bucket().file(`uploads/${fileId}`);
        await file.delete();
        res.send({ message: "File deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});