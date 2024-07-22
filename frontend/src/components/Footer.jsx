import React from "react";

function Footer({ isDarkMode }) {
  // Function to scroll to the top of the page
  
  return (
    <div className={`items-center justify-center ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-black'} p-4`}>
      <hr className={`border-t-2 ${isDarkMode ? 'border-gray-600' : 'border-black'}`} />
      <h1 className="text-center py-3 text-sm">
        Copyright © 2024
      </h1>
      
    </div>
  );
}

export default Footer;
