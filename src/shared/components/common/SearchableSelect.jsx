import React, { useState, useRef, useEffect } from 'react';

// Lightweight searchable dropdown. Styles are inline so it drops into any
// panel without needing that panel's CSS module.
//
// Props:
//   options      - [{ value, label, meta }]
//   value        - currently selected `value`
//   onChange     - (value, option) => void
//   placeholder  - text shown when nothing is selected
//   disabled     - blocks interaction
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
    const wrapRef = useRef(null);

    const selected = options.find(o => String(o.value) === String(value));

    useEffect(() => {
        const onClickOutside = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const filtered = query.trim()
        ? options.filter(o =>
            String(o.label).toLowerCase().includes(query.toLowerCase()) ||
            String(o.meta || '').toLowerCase().includes(query.toLowerCase()))
        : options;

    const box = {
        position: 'relative',
        width: '100%'
    };

    const control = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #CBD5E1',
        borderRadius: '8px',
        background: disabled ? '#F1F5F9' : '#fff',
        fontSize: '0.85rem',
        color: selected ? '#0F172A' : '#94A3B8',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
    };

    const menu = {
        position: 'absolute',
        top: 'calc(100% + 4px)',
        left: 0,
        right: 0,
        zIndex: 10050,
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(15,23,42,0.12)',
        maxHeight: '260px',
        overflowY: 'auto'
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
        background: '#fff'
    };

    return (
        <div style={box} ref={wrapRef}>
            <div
                style={control}
                onClick={() => { if (!disabled) setOpen(o => !o); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' && !disabled) setOpen(o => !o); }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selected ? selected.label : placeholder}
                </span>
                <span style={{ color: '#64748B', fontSize: '0.7rem' }}>▼</span>
            </div>

            {/* Keeps native form validation working for `required` fields. */}
            {required && (
                <input
                    tabIndex={-1}
                    required
                    value={value || ''}
                    onChange={() => {}}
                    style={{ opacity: 0, height: 0, width: 0, position: 'absolute', pointerEvents: 'none' }}
                />
            )}

            {open && !disabled && (
                <div style={menu}>
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
                            key={opt.value}
                            onClick={() => {
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
                                borderBottom: '1px solid #F1F5F9'
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
            )}
        </div>
    );
};

export default SearchableSelect;
