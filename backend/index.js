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
    console.log("Received file:", req.file); // Log received file information
    try {
        if (!req.file) {
            console.log("No file uploaded");
            return res.status(400).json({
                message: "No file uploaded",
            });
        }

        let outputPath = path.join(__dirname, "files", `${req.file.originalname}.pdf`);
        console.log("Output path:", outputPath); // Log the output path

        docxToPDF(req.file.path, outputPath, (err, result) => {
            if (err) {
                console.error("Error converting file:", err); // Log conversion errors
                return res.status(500).json({
                    message: "Error converting docx to pdf",
                });
            }

            res.download(outputPath, () => {
                fs.unlinkSync(outputPath); // Clean up the file
                console.log("File downloaded and deleted");
            });
        });
    } catch (error) {
        console.error("Internal server error:", error); // Log internal errors
        res.status(500).json({
            message: "Internal server error",
        });
    }
});


app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
