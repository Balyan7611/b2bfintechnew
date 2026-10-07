import React from 'react';
import { FiGrid, FiCheck, FiInfo } from 'react-icons/fi';

const ServiceSelectionGrid = ({ 
  services = [], 
  onToggleService, 
  categoryFilter = "all", 
  onSelectAllToggle 
}) => {

  const filteredServices = services.filter(srv => {
    if (categoryFilter === "all") return true;
    return srv.sectionType?.toString() === categoryFilter.toString();
  });

  const allFilteredChecked = filteredServices.length > 0 && filteredServices.every(srv => srv.checked);

  return (
    <>
            <style>{`
        @media (max-width: 640px) {
          .ssg-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; padding: 14px !important; }
          .ssg-grid > div { padding: 10px 8px !important; gap: 8px !important; }
          .ssg-grid > div span { font-size: 0.72rem !important; }
          .ssg-header-title { font-size: 0.85rem !important; }
          .ssg-enable-btn { padding: 5px 10px !important; font-size: 0.68rem !important; }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #F1F5F9' }}>
        <h4 className="ssg-header-title" style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1756AA', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiGrid /> Available Services ({filteredServices.length})
        </h4>
        {onSelectAllToggle && (
          <button
            className="ssg-enable-btn"
            type="button"
            onClick={onSelectAllToggle}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: allFilteredChecked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(23, 86, 170, 0.1)', 
              color: allFilteredChecked ? '#EF4444' : '#1756AA', 
              border: 'none', borderRadius: '8px', 
              padding: '6px 16px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '4px',
              border: allFilteredChecked ? 'none' : '2px solid #CBD5E1',
              background: allFilteredChecked ? '#1756AA' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}>
              {allFilteredChecked && <FiCheck style={{ color: '#fff', fontSize: '0.7rem', strokeWidth: 4 }} />}
            </div>
            <span>{allFilteredChecked ? 'Disable All' : 'Enable All'}</span>
          </button>
        )}
      </div>

            <div className="ssg-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 260px))',
        gap: '16px', 
        alignItems: 'start',
        background: '#F8FAFC', 
        padding: '24px', 
        borderRadius: '12px', 
        border: '1px solid #E2E8F0',
        marginBottom: '30px',
        minHeight: '120px'
      }}>
        {filteredServices.map((srv) => (
          <div 
            key={srv.id} 
            onClick={() => onToggleService && onToggleService(srv.id)}
            style={{ 
              display: 'flex', 
              flexDirection: 'row',
              alignItems: 'center', 
              gap: '12px', 
              padding: '14px 18px', 
              borderRadius: '10px', 
              background: srv.checked ? '#F0F7FF' : '#ffffff', 
              border: srv.checked ? '1.5px solid #1756AA' : '1.5px solid #E2E8F0', 
              boxShadow: srv.checked ? '0 4px 10px rgba(23, 86, 170, 0.05)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxSizing: 'border-box'
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              border: srv.checked ? 'none' : '2px solid #CBD5E1',
              background: srv.checked ? '#1756AA' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}>
              {srv.checked && (
                <FiCheck style={{ color: '#fff', fontSize: '0.85rem', strokeWidth: 4 }} />
              )}
            </div>

            <span style={{ 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: srv.checked ? '#0D1B3E' : '#4E6080', 
              transition: 'all 0.2s',
              wordBreak: 'break-word',
              lineHeight: '1.3'
            }}>
              {srv.name}
            </span>
          </div>
        ))}
        {filteredServices.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748B' }}>
            <FiInfo style={{ fontSize: '1.5rem', marginBottom: '8px' }} />
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>No services match the selected filter.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ServiceSelectionGrid;
