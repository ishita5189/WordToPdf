// api/index.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const docxToPDF = require("docx-pdf");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

// Ensure necessary directories exist
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

ensureDirectoryExists(path.join(__dirname, "../uploads"));
ensureDirectoryExists(path.join(__dirname, "../files"));

app.use(cors({
    origin: 'https://wordtopdf-converter.vercel.app',
    methods: ['POST', 'GET'],
    credentials: true
}));

app.get("/", (req, res) => {
    res.send("Welcome to the File Conversion API");
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

app.post("/convertFile", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        let outputPath = path.join(__dirname, "../files", `${req.file.originalname}.pdf`);
        docxToPDF(req.file.path, outputPath, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Error converting docx to pdf" });
            }
            res.download(outputPath, () => {
                fs.unlinkSync(outputPath);
                console.log("File downloaded and deleted");
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Export the Express app
module.exports = app;
