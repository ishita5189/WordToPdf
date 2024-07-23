import React, { useState, useEffect } from "react";
import { FaFileWord } from "react-icons/fa";
import axios from "axios";
import { ProgressBar } from 'react-bootstrap';
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Footer from "./Footer";

function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [convert, setConvert] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode")) || false);
  const [fileHistory, setFileHistory] = useState([]);
  const [fileCount, setFileCount] = useState(0);

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("fileHistory")) || [];
    setFileHistory(savedHistory);
    setFileCount(savedHistory.length);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size <= MAX_FILE_SIZE) {
        setSelectedFile(file);
        setUploadProgress(0);
        setConvert("");
      } else {
        setConvert("File size exceeds the 20MB limit");
        setSelectedFile(null);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setConvert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/convertFile`,
        formData,
        {
          responseType: "blob",
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const percentage = Math.floor((loaded * 100) / total);
            setUploadProgress(percentage);
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, "") + ".pdf";
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setSelectedFile(null);
      setDownloadError("");
      setConvert("File Converted Successfully");

      const newFile = { name: fileName, url };
      const updatedHistory = [...fileHistory, newFile];
      setFileHistory(updatedHistory);
      setFileCount(updatedHistory.length);

      localStorage.setItem("fileHistory", JSON.stringify(updatedHistory));
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setDownloadError("Error occurred: " + error.response.data.message);
      } else {
        setConvert("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleReDownload = (file) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.setAttribute("download", file.name);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  };

  const handleDelete = (index) => {
    const updatedHistory = fileHistory.filter((_, i) => i !== index);
    setFileHistory(updatedHistory);
    setFileCount(updatedHistory.length);
    localStorage.setItem("fileHistory", JSON.stringify(updatedHistory));
  };

  const handleClearHistory = () => {
    setFileHistory([]);
    setFileCount(0);
    localStorage.removeItem("fileHistory");
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    for (const file of fileHistory) {
      const response = await fetch(file.url);
      const blob = await response.blob();
      zip.file(file.name, blob);
    }
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "file-history.zip");
    });
  };

  return (
    <div className={`max-w-screen-xl mx-auto container px-6 py-5 md:px-40 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-black'}`}>
      <div className="flex h-screen items-center justify-center">
        <div className={`relative border-2 border-dashed px-4 py-2 md:px-8 md:py-6 border-indigo-400 rounded-lg shadow-lg ${isDarkMode ? 'border-blue-600' : ''}`}>
          <h1 className="text-3xl font-bold text-center mb-4">
            Convert Word to PDF Online
          </h1>
          <p className="text-sm text-center mb-5">
            Convert any Word documents to PDF format online in just one click!
          </p>

          <div className="flex flex-col items-center space-y-4">
            <input
              type="file"
              accept=".doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              id="FileInput"
            />
            <label
              htmlFor="FileInput"
              className={`w-full flex items-center justify-center px-4 py-3 bg-blue-100 text-gray-700 rounded-lg shadow-lg cursor-pointer hover:bg-blue-700 hover:text-white transition duration-300 ${isDarkMode ? 'bg-blue-400' : ''}`}
            >
              <FaFileWord className="text-2xl mr-3" />
              <span className="text-xl font-bold">
                {selectedFile ? selectedFile.name : "CHOOSE A FILE"}
              </span>
            </label>
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || isLoading}
              className="text-white bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 disabled:pointer-events-none transition duration-300 font-bold px-4 py-1 rounded-lg"
            >
              {isLoading ? "Converting..." : "Convert File"}
            </button>
            {isLoading && (
              <ProgressBar
                animated
                now={uploadProgress}
                label={`${uploadProgress}%`}
                className="w-full mt-2"
              />
            )}
            {convert && (
              <div className="text-green-500 text-center">{convert}</div>
            )}
            {downloadError && (
              <div className="text-red-500 text-center">{downloadError}</div>
            )}

            <button
              onClick={toggleDarkMode}
              className="text-white bg-gray-700 hover:bg-gray-900 transition duration-300 font-bold px-4 py-1 rounded-lg mt-4"
            >
              {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </button>
            
            <button
              onClick={handleClearHistory}
              className="text-white bg-red-500 hover:bg-red-700 transition duration-300 font-bold px-4 py-1 rounded-lg mt-4"
            >
              Clear History
            </button>

            {fileCount > 1 && (
              <button
                onClick={handleDownloadAll}
                className="text-white bg-green-500 hover:bg-green-700 transition duration-300 font-bold px-4 py-1 rounded-lg mt-4"
              >
                Download All Files
              </button>
            )}
          </div>

          <div className="mt-8 w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                File History
              </h2>
              {fileCount > 0 && (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isDarkMode ? 'bg-blue-500 text-white' : 'bg-blue-200 text-black'}`}>
                  {fileCount}
                </div>
              )}
            </div>
            <ul className="flex flex-col items-center space-y-2">
              {fileHistory.length > 0 ? fileHistory.map((file, index) => (
                <li key={index} className={`flex justify-between w-full px-4 py-2 bg-gray-100 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}>
                  <span>{file.name}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReDownload(file)}
                      className="text-white bg-blue-500 hover:bg-blue-700 transition duration-300 font-bold px-2 py-1 rounded-lg"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-white bg-red-500 hover:bg-red-700 transition duration-300 font-bold px-2 py-1 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              )) : (
                <li className="text-center">No files converted yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

export default Home;
