import React from "react";
import NoData from "../../assets/react.svg";
const EmptyTableRecord = () => {
  return (
    <div className="text-center space-y-4 py-6">
      <img src={NoData} alt="Bereload Nodata" className="mx-auto" />
      <span className="text-gray-700 font-medium text-sm ">
        No data to display.
      </span>
    </div>
  );
};

export default EmptyTableRecord;
