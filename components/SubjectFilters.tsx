'use client';

import { useState, useEffect, useRef } from 'react';
import { SUBJECTS } from '@/lib/utils';

interface SubjectFiltersProps {
  selectedSubject: string;
  setSelectedSubject: (val: string) => void;
}

export default function SubjectFilters({ selectedSubject, setSelectedSubject }: SubjectFiltersProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (filtersRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = filtersRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const currentScroll = Math.abs(scrollLeft);
      const threshold = 60; // Disappear before hitting the absolute edge (approx 1.5 - 2 arrow widths)
      setShowLeftArrow(scrollWidth > clientWidth && currentScroll < maxScroll - threshold);
      setShowRightArrow(scrollWidth > clientWidth && currentScroll > threshold);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return (
    <div className="filters-wrapper">
      <button 
        className="scroll-arrow-btn left-arrow"
        onClick={() => filtersRef.current?.scrollBy({ left: -250, behavior: 'smooth' })}
        title="التمرير لليسار"
        style={{ 
          visibility: showLeftArrow ? 'visible' : 'hidden',
          opacity: showLeftArrow ? 1 : 0,
          pointerEvents: showLeftArrow ? 'auto' : 'none',
          transition: 'opacity 0.2s ease, visibility 0.2s ease'
        }}
      >
        ❯
      </button>

      <button 
        className="scroll-arrow-btn right-arrow"
        onClick={() => filtersRef.current?.scrollBy({ left: 250, behavior: 'smooth' })}
        title="التمرير لليمين"
        style={{ 
          visibility: showRightArrow ? 'visible' : 'hidden',
          opacity: showRightArrow ? 1 : 0, 
          pointerEvents: showRightArrow ? 'auto' : 'none',
          transition: 'opacity 0.2s ease, visibility 0.2s ease'
        }}
      >
        ❮
      </button>

      <div 
        className="filters-container" 
        ref={filtersRef}
        onScroll={checkScroll}
      >
        <button
          onClick={() => setSelectedSubject('')}
          className="filter-btn"
          style={{
            background: !selectedSubject ? 'var(--primary)' : 'var(--feature-card-bg, #F3F4F6)',
            color: !selectedSubject ? 'white' : 'var(--text, #374151)',
          }}
        >
          الكل
        </button>
        {SUBJECTS.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedSubject(s.id)}
            className="filter-btn"
            style={{
              background: selectedSubject === s.id ? 'var(--primary)' : 'var(--feature-card-bg, #F3F4F6)',
              color: selectedSubject === s.id ? 'white' : 'var(--text, #374151)',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
