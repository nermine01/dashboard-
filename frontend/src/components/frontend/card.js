import React from "react";

export const Card = ({ children }) => (
  <div className="border border-gray-700 rounded-lg p-4 bg-gray-800 shadow-md">
    {children}
  </div>
);

export const CardContent = ({ children }) => (
  <div className="p-2">{children}</div>
);
