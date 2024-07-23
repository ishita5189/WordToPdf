# Overview
This application provides a user-friendly interface for converting Word documents to PDF format. Built with React, it features a sleek design, efficient file handling, and an integrated backend API. Users can convert files, view file history, and download files in bulk.

# Website Link:

# Screenshot:

![Application Screenshot](/WordToPDF.png)


# Features
1. File Conversion: Convert .doc and .docx files to PDF format.
2. Dark Mode: Toggle between light and dark modes for better user experience.
3. Progress Indicator: Display upload progress during file conversion.
4. File History: Keep track of converted files and manage them.
5. Download All Files: Download all converted files as a ZIP archive.
6. Error Handling: Inform users about errors such as file size limits and upload issues.

# Technologies Used
Frontend
React: For building the user interface.
React Bootstrap: For progress indicators and responsive design.
Tailwind CSS: For minimalist and premium styling.
JSZip & file-saver: For handling ZIP file generation and downloads.

---
Backend
Express.js: To handle file conversion requests.
Axios: For sending files to the backend API.

# Usage
1. Select a File: Click on the file input to choose a .doc or .docx file.
2. Convert File: Click the "Convert File" button to start the conversion process.
3. View Progress: A progress bar will indicate the conversion progress.
4. Download File: Once the conversion is complete, the PDF file will be automatically downloaded.
5. File History: View and manage your file history, including re-downloading and deleting files.
6. Download All Files: Use the "Download All Files" button to download a ZIP archive of all converted files.
7. Toggle Dark Mode: Switch between dark and light modes using the provided button.

# Error Handling
File Size Exceeded: The application will notify you if the file size exceeds 20MB.
Upload Errors: Errors during file upload are displayed with descriptive messages.

# Libraries & Integrations
JSZip: For generating ZIP archives of multiple files.
FileSaver.js: For saving files on the client-side.
Axios: For making HTTP requests to the backend API.
---
# Contributing
Contributions are welcome! Please submit issues and pull requests.

Feel free to modify this template as needed based on your specific requirements and project setup!
