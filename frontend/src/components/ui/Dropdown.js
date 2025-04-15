"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "./Icons";


function Dropdown({ label, items, onSelect, resetKey }) {

  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("All");

useEffect(() => {
  setSelected("All");
}, [resetKey]);

  const dropdownRef = useRef(null);

  // Prepend "All" to items (without duplicates)
  const fullItems = ["All", ...items.filter((item) => item !== "All")];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (item) => {
    setSelected(item);
    setIsOpen(false);
    if (onSelect) {
      if (item === "All") {
        onSelect(null); // Signal: show all alerts
      } else {
        onSelect(item); // Signal: show filtered alerts
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm min-w-[8rem]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected || label}
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md">
          {fullItems.map((item, index) => (
            <button
              key={index}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                index === 0 ? "rounded-t-lg" : ""
              } ${index === fullItems.length - 1 ? "rounded-b-lg" : ""}`}
              onClick={() => handleSelect(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
