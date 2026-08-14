import { createContext, useContext, useEffect, useRef, useState } from 'react';

const CursorContext = createContext(() => {});

/**
 * Wrap a section with <CustomCursor> and call useCursorLabel() inside any
 * child to control what the cursor shows on hover (e.g. "View", "3 photos").
 * Automatically disabled on touch devices, so mobile is untouched.
 */
export default function CustomCursor({ children }) {
  const dotRef = useRef(null);
  const [label, setLabel] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setEnabled(isDesktop);
    if (!isDesktop) return;

    const move = (e) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <CursorContext.Provider value={setLabel}>
      <div className={enabled ? 'cursor-none-zone' : ''}>
        {children}
      </div>
      {enabled && (
        <div
          ref={dotRef}
          aria-hidden="true"
          className="custom-cursor"
          data-active={label ? 'true' : 'false'}
        >
          {label && <span className="custom-cursor-label">{label}</span>}
        </div>
      )}
    </CursorContext.Provider>
  );
}

export const useCursorLabel = () => useContext(CursorContext);