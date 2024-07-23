const express = require("express");
const multer = require("multer");
const cors = require("cors");
const docxToPDF = require("docx-pdf");
const path = require("path");
const fs = require("fs");

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
}));

// Middleware to ensure uploads and files directories exist
const ensureDirectoriesExist = () => {
    const uploadDir = path.join(__dirname, "uploads");
    const filesDir = path.join(__dirname, "files");

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir);
    }
};

ensureDirectoriesExist();

// Route for root URL
app.get("/", (req, res) => {
    res.send("Welcome to the File Conversion API");
});

// Configure multer storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

// Route for file conversion
app.post("/convertFile", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // Define output file path
    const outputPath = path.join(__dirname, "files", `${path.parse(req.file.originalname).name}.pdf`);

    docxToPDF(req.file.path, outputPath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error converting docx to pdf" });
        }

        // Send file and delete after download
        res.download(outputPath, () => {
            fs.unlinkSync(outputPath);
            console.log("File downloaded and deleted");
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
