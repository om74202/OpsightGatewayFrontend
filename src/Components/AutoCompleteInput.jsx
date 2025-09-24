import React, { useState, useRef, useEffect } from 'react';

export default function AutocompleteInput({ label="Input Box", options = [],isCompulsary=false, defaultValue ='',name, onSelect,placeholder="Start Typing...",type="text" }) {
  const [inputValue, setInputValue] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Filtered options
  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Close dropdown on outside click
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

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev + 1 < filteredOptions.length ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev - 1 >= 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        const selected = filteredOptions[highlightedIndex];
        setInputValue(selected);
        onSelect?.(selected);
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
  };

  return (
    <div className="w-auto relative font-sans" ref={containerRef}>
      {label && <label className="block mb-1 text-gray-900 font-medium text-xs" >{label}{isCompulsary?(<span className="text-red-500">*</span>):(<span></span>)}</label>}
      <input
      name={name}
        type={type}
        value={inputValue}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
          onSelect?.(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        className="w-full border border-gray-300 rounded-md px-4 py-1 bg-white focus:outline-none focus:ring focus:border-blue-300"
        placeholder={`Enter ${label}`}
      />

      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border border-gray-300 mt-1 max-h-60 overflow-y-auto rounded shadow z-10">
          {filteredOptions.map((option, index) => (
            <li
              key={option}
              className={`px-4 py-2 cursor-pointer ${
                index === highlightedIndex ? 'bg-blue-100' : ''
              } ${option === inputValue ? 'font-semibold text-blue-600' : ''}`}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseDown={() => {
                setInputValue(option);
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
