import React from 'react';

interface LoadingScreenProps {
  isVisible: boolean;
}

const LoadingScreen = ({ isVisible }: LoadingScreenProps) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-all duration-1000 ease-out ${
        isVisible
          ? 'opacity-100 visible'
          : 'opacity-0 invisible'
      }`}
    >
      <div
        className="w-8 h-8 border-4 border-black/30 border-t-black rounded-full"
        style={{
          animation: 'spin 1s linear infinite'
        }}
      ></div>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;