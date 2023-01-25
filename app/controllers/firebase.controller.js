const admin = require('firebase-admin');

const serviceAccount = require('../config/firebase-config.json');
const FirebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://ploishare.appspot.com"
});
const storage = FirebaseApp.storage();
const bucket = storage.bucket();

exports.uploadFile = async (req, res) => {
    try {
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
    } catch (error) {
        console.error(error); // log the error
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

exports.getFile = async (req, res) => {
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
}

exports.deleteFile = async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const file = bucket.file(`uploads/${fileId}`);
        await file.delete();
        res.send({ message: "File deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

exports.deleteFileWithUrl = async (req, res) => {
    try {
        const { url } = req.body;
        const replaceUrl = url.replace(`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/uploads%2F`, "").replace("?alt=media", "");
        const file = bucket.file(`uploads/${replaceUrl}`);
        await file.delete();
        res.send({ message: "File deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}