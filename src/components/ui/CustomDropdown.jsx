import React, { useState, useRef, useEffect } from 'react';
import { CaretDown } from '@phosphor-icons/react';

export const CustomDropdown = ({ options, value, onChange, placeholder, disabled, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const [hoverImage, setHoverImage] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setHoverImage(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <input type="text" className="absolute opacity-0 w-0 h-0" required={required} value={value || ''} onChange={() => {}} />
      
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-3 bg-brand-light/20 border border-brand-pink/50 rounded-xl focus:outline-none focus:border-brand-magenta focus:ring-1 focus:ring-brand-magenta transition-all text-sm text-brand-dark"
      >
        <span className="flex items-center gap-2">
          {selectedOption?.image && <img src={`${selectedOption.image}?w=50&auto=format&fit=crop`} alt="" className="w-5 h-5 rounded-full object-cover" />}
          {selectedOption ? selectedOption.label || selectedOption.value : placeholder}
        </span>
        <CaretDown size={16} />
      </button>

      {isOpen && (
        <ul className="absolute z-[60] w-full mt-1 bg-white border border-brand-pink/50 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.map((opt, idx) => (
            <li 
              key={idx}
              className={`px-4 py-3 hover:bg-brand-light/40 cursor-pointer text-sm text-brand-dark flex items-center gap-3 transition-colors ${value === opt.value ? 'bg-brand-light/20 font-medium' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
                setHoverImage(null);
              }}
              onMouseEnter={() => setHoverImage(opt.image)}
              onMouseLeave={() => setHoverImage(null)}
              onMouseMove={handleMouseMove}
            >
              {opt.image && <img src={`${opt.image}?w=50&auto=format&fit=crop`} alt="" className="w-6 h-6 rounded-full object-cover shadow-sm border border-brand-pink/20" />}
              <span>{opt.label || opt.value}</span>
            </li>
          ))}
        </ul>
      )}

      {hoverImage && (
        <div 
          className="fixed z-[100] pointer-events-none bg-white p-2 rounded-xl shadow-2xl border border-brand-pink/30 animate-fade-in"
          style={{
            left: mousePos.x + 20,
            top: mousePos.y - 60
          }}
        >
          <img src={`${hoverImage}?w=300&auto=format&fit=crop`} alt="Preview" className="w-48 h-48 object-cover rounded-lg" />
        </div>
      )}
    </div>
  );
}
