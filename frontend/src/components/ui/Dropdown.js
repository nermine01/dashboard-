"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "./Icons";

function Dropdown({ label, items }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm min-w-[8rem]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md">
          {items.map((item, index) => (
            <button
              key={index}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
              onClick={() => setIsOpen(false)}
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
