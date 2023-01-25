const Multer = require('multer');
const express = require('express');
const router = express.Router();

const {
    uploadFile,
    getFile,
    deleteFile,
    deleteFileWithUrl
} = require('../controllers/firebase.controller');

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

router.post('/upload-file', multer.single('img'), uploadFile);

router.get('/get-files', getFile);

router.delete('/delete-file/:fileId', deleteFile);

router.delete('/delete-files-url', deleteFileWithUrl);

module.exports = router;