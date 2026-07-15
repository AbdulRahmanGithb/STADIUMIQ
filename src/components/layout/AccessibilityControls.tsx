import React from 'react';
import { Type, Moon, Sun } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export function AccessibilityControls() {
  const { textSizeLevel, setTextSizeLevel, highContrast, toggleHighContrast } = useAppStore();

  const handleTextSize = () => {
    setTextSizeLevel(((textSizeLevel + 1) % 3) as 0 | 1 | 2);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      {/* High Contrast Toggle (NFR-3.6) */}
      <button 
        className="btn btn-ghost btn-sm" 
        onClick={toggleHighContrast}
        title={highContrast ? "Disable High Contrast" : "Enable High Contrast"}
        aria-pressed={highContrast}
        aria-label="Toggle High Contrast Mode"
        style={{ padding: '4px 8px' }}
      >
        {highContrast ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
      </button>

      {/* Text Size Toggle (NFR-3.3) */}
      <button 
        className="btn btn-ghost btn-sm" 
        onClick={handleTextSize}
        title={`Text Size: ${textSizeLevel === 0 ? 'Normal' : textSizeLevel === 1 ? 'Large' : 'Extra Large'}`}
        aria-label="Toggle Text Size"
        style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
      >
        <Type size={14} aria-hidden />
        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>
          {textSizeLevel === 0 ? '' : textSizeLevel === 1 ? '+' : '++'}
        </span>
      </button>
    </div>
  );
}
