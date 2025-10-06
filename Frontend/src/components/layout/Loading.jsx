import React from "react";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-full pt-4">
      <div className="w-10 h-10 border-4 border-t-primary border-gray-300 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loading;
