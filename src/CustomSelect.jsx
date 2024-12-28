/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Loader, Search, X } from 'lucide-react';

const CustomSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select...", 
  loading = false, 
  disabled = false,
  className = "",
  error = false,
  onBlur = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsListRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset state when options change
  useEffect(() => {
    setSearchTerm('');
    setHighlightedIndex(-1);
  }, [options]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        onBlur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionsListRef.current) {
      const highlightedElement = optionsListRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      default:
        break;
    }
  };

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const getUniqueKey = (option, index) => {
    if (option.coordinates) {
      return `${option.name}-${option.coordinates}`;
    }
    if (option.id) {
      return option.id;
    }
    return `${option.name}-${index}`;
  };

  const renderOption = (option, index) => {
    const isHighlighted = index === highlightedIndex;
    
    return (
      <div
        key={getUniqueKey(option, index)}
        className={`px-4 py-2 cursor-pointer transition-colors duration-150
          ${isHighlighted ? 'bg-blue-600' : 'hover:bg-gray-700'}
          ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !option.disabled && handleSelect(option)}
        onMouseEnter={() => setHighlightedIndex(index)}
        role="option"
        aria-selected={isHighlighted}
      >
        <div className="flex items-center justify-between">
          <span className="text-white">{option.name}</span>
          {option.coordinates && (
            <span className="text-gray-400 text-sm ml-2">
              ({option.coordinates})
            </span>
          )}
        </div>
        {option.description && (
          <span className="text-sm text-gray-400 block">
            {option.description}
          </span>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`relative ${className}`} 
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`
          w-full p-4 bg-gray-800 text-white rounded-lg border 
          transition-colors duration-200 flex items-center justify-between 
          cursor-pointer select-none
          ${error ? 'border-red-500' : 'border-gray-700'}
          ${!disabled && 'hover:border-gray-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="options-listbox"
      >
        <div className="flex-1 truncate">
          {value ? value.name : placeholder}
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader className="w-4 h-4 animate-spin text-blue-500" />}
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          />
        </div>
      </div>

      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl"
          role="listbox"
          id="options-listbox"
        >
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full pl-9 pr-4 py-2 bg-gray-700 text-white rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0);
                }}
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <X
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 
                    text-gray-400 w-4 h-4 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSearchTerm('');
                    searchInputRef.current?.focus();
                  }}
                />
              )}
            </div>
          </div>

          <div 
            ref={optionsListRef}
            className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
          >
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No results found
              </div>
            ) : (
              filteredOptions.map((option, index) => renderOption(option, index))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;