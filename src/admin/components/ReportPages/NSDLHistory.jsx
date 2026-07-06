import React, { useState, useEffect } from 'react';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { API } from '../../../api/endpoints';
import { 
  FiSearch, FiChevronLeft, FiChevronRight, FiCheckCircle,
  FiDatabase, FiAlertCircle, FiXCircle, FiCreditCard
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint
} from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

const NSDLHistory = () => {
  const [focusedField, setFocusedField] = useState(null);

  const [serviceList, setServiceList] = useState([]);
  const [memberList, setMemberList] = useState([]);

  const [selectedService, setSelectedService] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await API.service.getAll();
        if (res && Array.isArray(res.data)) setServiceList(res.data);
        else if (Array.isArray(res)) setServiceList(res);
        else setServiceList([]);
      } catch (err) { console.error("Error fetching services:", err); }
    };
    const fetchMembers = async () => {
      try {
        const res = await API.member.search('');
        if (res && Array.isArray(res.data)) setMemberList(res.data);
        else if (Array.isArray(res)) setMemberList(res);
        else setMemberList([]);
      } catch (err) { console.error("Error fetching members:", err); }
    };
    fetchServices();
    fetchMembers();
  }, []);

  return (
    <div className={styles.container} style={{ padding: '20px' }}>
      {/* Dynamic Keyframe Animations */}
      <style>{`
        @keyframes successGlow {
          0% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(39, 174, 96, 0); }
          100% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); }
        }
        @keyframes pendingGlow {
          0% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(243, 156, 18, 0); }
          100% { box-shadow: 0 0 0 0 rgba(243, 156, 18, 0); }
        }
        @keyframes failedGlow {
          0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(231, 76, 60, 0); }
          100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
        }
      `}</style>

      {/* ── PREMIUM FILTER CARD ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(23, 86, 170, 0.02), 0 1px 4px rgba(0, 0, 0, 0.01)',
        border: '1px solid #E2E8F0',
        padding: '12px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '20px'
      }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.3px' }}>NSDL History</h3>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Success Pill */}
            <div
              style={{ display: 'flex', alignItems: 'center', background: '#eafaf1', color: '#27AE60', padding: '6px 16px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 700, border: '1.5px solid #27AE60', gap: '8px', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', animation: 'successGlow 2s infinite' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = '#dcf7e7'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#eafaf1'; }}
            >
              <FiCheckCircle size={15} />
              <span>Success</span>
              <span style={{ background: '#27AE60', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>0</span>
            </div>

            {/* Pending Pill */}
            <div
              style={{ display: 'flex', alignItems: 'center', background: '#fef5e7', color: '#F39C12', padding: '6px 16px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 700, border: '1.5px solid #F39C12', gap: '8px', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', animation: 'pendingGlow 2s infinite' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = '#fdedd3'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#fef5e7'; }}
            >
              <FiAlertCircle size={15} />
              <span>Pending</span>
              <span style={{ background: '#F39C12', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>0</span>
            </div>

            {/* Failed Pill */}
            <div
              style={{ display: 'flex', alignItems: 'center', background: '#fdeaea', color: '#E74C3C', padding: '6px 16px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 700, border: '1.5px solid #E74C3C', gap: '8px', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', animation: 'failedGlow 2s infinite' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = '#fcdada'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#fdeaea'; }}
            >
              <FiXCircle size={15} />
              <span>Failed</span>
              <span style={{ background: '#E74C3C', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>0</span>
            </div>
          </div>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>From Date</label>
              <input type="date" className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'fromDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'fromDate' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} onFocus={() => setFocusedField('fromDate')} onBlur={() => setFocusedField(null)} />
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>To Date</label>
              <input type="date" className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'toDate' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'toDate' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} onFocus={() => setFocusedField('toDate')} onBlur={() => setFocusedField(null)} />
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Service</label>
              <select className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'service' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'service' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} onFocus={() => setFocusedField('service')} onBlur={() => setFocusedField(null)} value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                <option value="">All Services</option>
                {Array.isArray(serviceList) && serviceList.map((srv) => (
                  <option key={srv.id} value={srv.id}>{srv.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Select Member</label>
              <select className={styles.inputControl} style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'member' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'member' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} onFocus={() => setFocusedField('member')} onBlur={() => setFocusedField(null)} value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
                <option value="">All Members</option>
                {Array.isArray(memberList) && memberList.map((m) => (
                  <option key={m.id || m.memberId} value={m.id || m.memberId}>
                    {m.name || m.memberId} ({m.mobile})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Transaction Status</label>
              <select
                className={styles.inputControl}
                style={{ paddingLeft: '12px', paddingRight: '12px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'status' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'status' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }}
                onFocus={() => setFocusedField('status')} onBlur={() => setFocusedField(null)}
                value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          
            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', color: '#64748B', textTransform: 'uppercase', marginBottom: '2px', display: 'block' }}>Search Anything (Name, Number, Op ID)</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                  <FiSearch size={14} />
                </div>
                <input type="text" placeholder="Enter keyword..." className={styles.inputControl} style={{ paddingLeft: '32px', height: '38px', borderRadius: '10px', fontSize: '0.825rem', border: focusedField === 'search' ? '1.5px solid #1756AA' : '1.5px solid #CBD5E1', boxShadow: focusedField === 'search' ? '0 0 0 3px rgba(23, 86, 170, 0.06)' : 'none', transition: 'all 0.25s', width: '100%', background: '#FCFDFE', color: '#334155', fontWeight: 500 }} onFocus={() => setFocusedField('search')} onBlur={() => setFocusedField(null)} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', height: '38px', fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', width: '100%', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #24D366 0%, #17b350 100%)'; e.currentTarget.style.transform = 'translateY(-1.5px)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(34, 197, 94, 0.25), inset 0 -2px 0 rgba(0, 0, 0, 0.12)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.15), inset 0 -2px 0 rgba(0, 0, 0, 0.12)'; }}
              >
                <FiSearch size={15} />
                Search
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── DATA TABLE CARD ── */}
      <div className={styles.cardFullMobile} style={{ padding: 0, marginBottom: '100px', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
        {/* CARD INTERNAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>NSDL History List</h3>
        </div>
        {/* TOOLBAR */}
        <div className="global-table-toolbar" style={{ padding: '10px 15px' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <ExportButtons headers={[]} rows={[]} fileNamePrefix="nsdlhistory_report" sheetName="Report" />

          <div className="global-search-box">
            <FiSearch />
            <input type="text" placeholder="Search NSDL logs..." />
          </div>
        </div>

        <div className={styles.tableWrapper} style={{ borderRadius: '16px', border: '1px solid #E2E8F0', overflowX: 'auto', overflowY: 'hidden', minHeight: 'auto' }}>
          <table className={styles.table} style={{ minWidth: '1800px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '60px' }}>#</th>
                <th style={{ width: '100px', textAlign: 'center' }}>ACTION</th>
                <th>DATE & TIME</th>
                <th>MEMBER NAME</th>
                <th>NUMBER</th>
                <th>OPERATOR</th>
                <th>OP BAL</th>
                <th>AMOUNT</th>
                <th>TDS</th>
                <th>CL BAL</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th>OPERATOR ID</th>
                <th>REMARK</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="13" style={{ padding: '40px 0', textAlign: 'center', color: '#A0AEC0', position: 'relative' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                     <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '50%', border: '1px solid #E2E8F0' }}>
                       <FiDatabase size={24} color="#94A3B8" />
                     </div>
                     <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#718096' }}>No NSDL records found</span>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="global-pagination" style={{ padding: '10px 15px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>Showing 0 to 0 of 0 entries</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="global-page-btn" disabled><FiChevronLeft /></button>
            <button className="global-page-btn global-page-active">1</button>
            <button className="global-page-btn" disabled><FiChevronRight /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NSDLHistory;
