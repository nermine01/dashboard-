"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "./Icons";

function Dropdown({ label, items, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const dropdownRef = useRef(null);

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
    if (onSelect) onSelect(item);
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
          {items.map((item, index) => (
            <button
              key={index}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                index === 0 ? "rounded-t-lg" : ""
              } ${index === items.length - 1 ? "rounded-b-lg" : ""}`}
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
