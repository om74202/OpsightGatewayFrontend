import { ChevronDown } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

export default function Dropdown({ label="Dropdown", options = [],name, defaultValue = '', onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selected, setSelected] = useState(defaultValue);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        const value = options[highlightedIndex];
        setSelected(value);
        onSelect?.(value);
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
  };

  return (
    <div className="w-auto relative font-sans" ref={containerRef} onKeyDown={handleKeyDown} tabIndex={0}>
      {label && <label className="block mb-1 text-xs font-medium">{label}</label>}

      <div
        className="border border-gray-300 rounded-md px-4 py-1 cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className='flex justify-between'>
            <span className=''>{selected || `Select ${label}`}</span>
        <ChevronDown size={18} className="ml-2" />
        </div>
      </div>

      {isOpen && (
        <ul className="absolute left-0 right-0 bg-white border border-gray-300 mt-1 max-h-60 overflow-y-auto rounded shadow z-10">
          {options.map((option, index) => (
            <li
            
              key={option}
              className={`px-4 py-1 cursor-pointer ${
                index === highlightedIndex ? 'bg-blue-100' : ''
              } ${option === selected ? 'font-semibold text-blue-600' : ''}`}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => {
                setSelected(option);
                onSelect?.(option);
                setIsOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
