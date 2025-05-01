"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "./Icons";

function NestedDropdown({ label, groups, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [level1Hover, setLevel1Hover] = useState(null);
  const [level2Hover, setLevel2Hover] = useState(null);
  const [level3Hover, setLevel3Hover] = useState(null);
  const [selected, setSelected] = useState("All");

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setLevel1Hover(null);
        setLevel2Hover(null);
        setLevel3Hover(null);
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
    setLevel1Hover(null);
    setLevel2Hover(null);
    setLevel3Hover(null);
    if (onSelect) {
      onSelect(item);
    }
  };

  const level1Keys = Object.keys(groups).sort();

  const level2Keys = level1Hover ? Object.keys(groups[level1Hover]).filter(k => k !== "_products").sort() : [];
  const level3Keys = level1Hover && level2Hover ? Object.keys(groups[level1Hover][level2Hover]).filter(k => k !== "_products").sort() : [];
  // Fix: level4Items should also include products directly under group4 if any
  const level4Items = level1Hover && level2Hover && level3Hover
    ? (() => {
        const group4Obj = groups[level1Hover][level2Hover][level3Hover];
        if (!group4Obj) return [];
        if (Array.isArray(group4Obj)) return group4Obj; // If group4 is array of products
        if (group4Obj._products) return group4Obj._products;
        // If group4Obj is object with keys as group4 names, flatten all products
        let products = [];
        Object.values(group4Obj).forEach(val => {
          if (Array.isArray(val)) products = products.concat(val);
          else if (val._products) products = products.concat(val._products);
        });
        return products;
      })()
    : [];

  // Also get products at each level for clicking
  const level1Products = level1Hover ? groups[level1Hover]._products || [] : [];
  const level2Products = level1Hover && level2Hover ? groups[level1Hover][level2Hover]._products || [] : [];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm min-w-[12rem]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected || label}
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-[48rem] bg-white border border-gray-200 rounded-lg shadow-md flex">
          {/* Level 1 */}
          <div className="w-1/4 border-r border-gray-200 max-h-60 overflow-auto">
            <button
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                selected === "All" ? "bg-blue-100 font-semibold" : ""
              } rounded-t-lg`}
              onClick={() => handleSelect("All")}
              onMouseEnter={() => {
                setLevel1Hover(null);
                setLevel2Hover(null);
                setLevel3Hover(null);
              }}
            >
              All
            </button>
            {level1Keys.map((key) => (
              <button
                key={key}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                  level1Hover === key ? "bg-gray-100" : ""
                }`}
                onMouseEnter={() => {
                  setLevel1Hover(key);
                  setLevel2Hover(null);
                  setLevel3Hover(null);
                }}
                onClick={() => handleSelect(key)}
              >
                {key}
              </button>
            ))}
            {/* Products at level 1 */}
            {level1Hover && level1Products.length > 0 && (
              <>
                <div className="px-3 py-1 text-xs font-semibold text-gray-500">Products</div>
                {level1Products.map((prod) => (
                  <button
                    key={prod}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleSelect(prod)}
                  >
                    {prod}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Level 2 */}
          <div className="w-1/4 border-r border-gray-200 max-h-60 overflow-auto">
            {level1Hover ? (
              <>
                {level2Keys.map((key) => (
                  <button
                    key={key}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                      level2Hover === key ? "bg-gray-100" : ""
                    }`}
                    onMouseEnter={() => {
                      setLevel2Hover(key);
                      setLevel3Hover(null);
                    }}
                    onClick={() => handleSelect(key)}
                  >
                    {key}
                  </button>
                ))}
                {/* Products at level 2 */}
                {level2Hover && level2Products.length > 0 && (
                  <>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500">Products</div>
                    {level2Products.map((prod) => (
                      <button
                        key={prod}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        onClick={() => handleSelect(prod)}
                      >
                        {prod}
                      </button>
                    ))}
                  </>
                )}
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">Hover a Group 1 item</div>
            )}
          </div>

          {/* Level 3 */}
          <div className="w-1/4 border-r border-gray-200 max-h-60 overflow-auto">
            {level2Hover ? (
              level3Keys.length > 0 ? (
                level3Keys.map((key) => (
                  <button
                    key={key}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                      level3Hover === key ? "bg-gray-100" : ""
                    }`}
                    onMouseEnter={() => setLevel3Hover(key)}
                    onClick={() => handleSelect(key)}
                  >
                    {key}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">No Group 3 items</div>
              )
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">Hover a Group 2 item</div>
            )}
          </div>

          {/* Level 4 */}
          <div className="w-1/4 max-h-60 overflow-auto">
            {level3Hover ? (
              level4Items.length > 0 ? (
                level4Items.map((item) => (
                  <button
                    key={item}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleSelect(item)}
                  >
                    {item}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">No Group 4 items</div>
              )
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">Hover a Group 3 item</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NestedDropdown;
