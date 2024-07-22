import React from "react";

function Navbar() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-screen-2xl mx-auto container px-6 py-3 md:px-40 shadow-lg h-16 fixed top-0 left-0 right-0 z-50 bg-slate-200">
      <div className="flex justify-between">
        <h1 className="text-2xl cursor-pointer font-bold text-pink-600">
          Word<span className="text-3xl text-blue-600">To</span>PDF
        </h1>
        <button
        onClick={scrollToTop}
        className={`text-white ${'bg-blue-600 hover:bg-blue-800'} font-bold px-4 py-2 rounded-lg transition duration-300`}
      >
        Scroll to Top
      </button>
          </div>
    </div>
  );
}

export default Navbar;