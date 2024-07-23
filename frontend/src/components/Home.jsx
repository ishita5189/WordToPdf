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
        "https://wordtopdf-converter.vercel.app/convertFile",
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
    setIsDarkMode(!isDarkMode);
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
            {uploadProgress > 0 && uploadProgress < 100 && (
              <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} className="mt-3 w-full" />
            )}
            {convert && (
              <p className={`text-center ${convert.includes('Error') ? 'text-red-500' : 'text-green-500'} font-semibold`}>
                {convert}
              </p>
            )}
            {downloadError && (
              <p className="text-red-500 font-semibold">
                {downloadError}
              </p>
            )}
          </div>

          {fileHistory.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-3">File History ({fileCount})</h2>
              <ul className="space-y-2">
                {fileHistory.map((file, index) => (
                  <li key={index} className="flex items-center justify-between border-b pb-2">
                    <span>{file.name}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReDownload(file)}
                        className="text-blue-500 hover:underline"
                      >
                        Re-download
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={handleClearHistory}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Clear History
                </button>
                <button
                  onClick={handleDownloadAll}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Download All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
    </div>
  );
}

export default Home;
