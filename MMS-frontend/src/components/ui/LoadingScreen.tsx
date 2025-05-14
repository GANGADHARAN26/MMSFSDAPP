import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-military-navy-dark"></div>
        <h2 className="mt-4 text-xl font-semibold text-military-navy-dark">Loading...</h2>
      </div>
    </div>
  );
};

export default LoadingScreen;