import React from "react";

export const ScrollArea = ({ children, className }) => (
    <div className={`overflow-y-auto ${className}`} style={{ maxHeight: "150px" }}>
        {children}
    </div>
);
