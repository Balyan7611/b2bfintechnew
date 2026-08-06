import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

// Lightweight searchable dropdown — uses a fixed-position portal so the menu
// always renders on top of any parent with overflow:hidden or z-index stacking.
//
// Props:
//   options      - [{ value, label, meta }]
//   value        - currently selected `value`
//   onChange     - (value, option) => void
//   placeholder  - text shown when nothing is selected
//   disabled     - blocks interaction
//   required     - native form validation
const SearchableSelect = ({
    options = [],
    value = '',
    onChange,
    placeholder = 'Select...',
    disabled = false,
    required = false
}) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [menuStyle, setMenuStyle] = useState({});
    const wrapRef = useRef(null);
    const menuRef = useRef(null);

    const selected = options.find(o => String(o.value) === String(value));

    // Calculate fixed position based on trigger rect
    const calcMenuStyle = useCallback(() => {
        if (!wrapRef.current) return;
        const rect = wrapRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const menuH = 280;
        const openUpward = spaceBelow < menuH + 8 && rect.top > menuH;
        setMenuStyle({
            position: 'fixed',
            left: rect.left,
            width: rect.width,
            zIndex: 99999,
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(15,23,42,0.15)',
            maxHeight: '260px',
            overflowY: 'auto',
            ...(openUpward
                ? { bottom: window.innerHeight - rect.top + 4 }
                : { top: rect.bottom + 4 })
        });
    }, []);

    const handleOpen = () => {
        if (disabled) return;
        if (!open) calcMenuStyle();
        setOpen(o => !o);
    };

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (
                wrapRef.current && !wrapRef.current.contains(e.target) &&
                menuRef.current && !menuRef.current.contains(e.target)
            ) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Recalc on scroll/resize so menu tracks the trigger
    useEffect(() => {
        if (!open) return;
        const update = () => calcMenuStyle();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [open, calcMenuStyle]);

    const filtered = query.trim()
        ? options.filter(o =>
            String(o.label).toLowerCase().includes(query.toLowerCase()) ||
            String(o.meta || '').toLowerCase().includes(query.toLowerCase()))
        : options;

    const control = {
        width: '100%',
        height: '38px',
        padding: '0 12px',
        border: open ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1',
        borderRadius: '8px',
        background: disabled ? '#F1F5F9' : '#FCFDFE',
        fontSize: '0.825rem',
        color: selected ? '#0F172A' : '#94A3B8',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        boxShadow: open ? '0 0 0 3px rgba(23,86,170,0.06)' : 'none',
        transition: 'border 0.2s, box-shadow 0.2s',
        boxSizing: 'border-box',
        fontWeight: 500,
    };

    const searchInput = {
        width: '100%',
        padding: '9px 12px',
        border: 'none',
        borderBottom: '1px solid #E2E8F0',
        outline: 'none',
        fontSize: '0.82rem',
        position: 'sticky',
        top: 0,
        background: '#fff',
        boxSizing: 'border-box',
    };

    const menu = (
        <div style={menuStyle} ref={menuRef}>
            <input
                autoFocus
                style={searchInput}
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
            />
            {filtered.length === 0 ? (
                <div style={{ padding: '14px 12px', color: '#94A3B8', fontSize: '0.82rem' }}>
                    No match found
                </div>
            ) : filtered.map(opt => (
                <div
                    key={String(opt.value)}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        onChange?.(opt.value, opt);
                        setOpen(false);
                        setQuery('');
                    }}
                    style={{
                        padding: '10px 12px',
                        fontSize: '0.83rem',
                        cursor: 'pointer',
                        background: String(opt.value) === String(value) ? '#EFF6FF' : 'transparent',
                        color: '#0F172A',
                        borderBottom: '1px solid #F1F5F9',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                            String(opt.value) === String(value) ? '#EFF6FF' : 'transparent';
                    }}
                >
                    <div style={{ fontWeight: 600 }}>{opt.label}</div>
                    {opt.meta && (
                        <div style={{ fontSize: '0.73rem', color: '#64748B', marginTop: '2px' }}>{opt.meta}</div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ position: 'relative', width: '100%' }} ref={wrapRef}>
            <div
                style={control}
                onClick={handleOpen}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleOpen(); }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {selected ? selected.label : placeholder}
                </span>
                <span style={{ color: '#64748B', fontSize: '0.65rem', flexShrink: 0 }}>
                    {open ? '▲' : '▼'}
                </span>
            </div>

            {required && (
                <input
                    tabIndex={-1}
                    required
                    value={value || ''}
                    onChange={() => {}}
                    style={{ opacity: 0, height: 0, width: 0, position: 'absolute', pointerEvents: 'none' }}
                />
            )}

            {open && !disabled && ReactDOM.createPortal(menu, document.body)}
        </div>
    );
};

export default SearchableSelect;
