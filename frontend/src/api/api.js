// src/api.js
import axios from 'axios';

const API_URL = 'https://wordtopdf-converter.vercel.app/';

export const convertWordToPDF = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/convert`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error converting file:', error);
    throw error;
  }
};
