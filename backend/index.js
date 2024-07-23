const express = require("express");
const multer = require("multer");
const cors = require("cors");
const docxToPDF = require("docx-pdf");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['POST', 'GET'],
    credentials: true
}));

// Create necessary directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const filesDir = path.join(__dirname, 'files');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir);
}

// Define a route for the root URL
app.get("/", (req, res) => {
    res.send("Welcome to the File Conversion API");
});

// Setting up the file storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB limit
});

app.post("/convertFile", upload.single("file"), (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
            });
        }
        // Defining output file path
        let outputPath = path.join(
            filesDir,
            `${req.file.originalname}.pdf`
        );
        docxToPDF(req.file.path, outputPath, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Error converting docx to pdf",
                });
            }
            res.download(outputPath, () => {
                // Delete the file after download
                fs.unlinkSync(outputPath);
                console.log("File downloaded and deleted");
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
