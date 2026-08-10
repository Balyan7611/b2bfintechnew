import React, { useState, useEffect } from 'react';
import { FiDatabase } from 'react-icons/fi';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaSearch, FaFileExcel, FaFilePdf, FaPrint, FaCopy, FaFileCsv,
  FaChevronLeft, FaChevronRight, FaRupeeSign, FaCommentAlt, FaShieldAlt, FaPlus
} from 'react-icons/fa';
import { updateCreditLimitForm, addCreditLimit } from '../../../store/slices/memberSlice';
import { API } from '../../../api/endpoints';
import styles from './MemberPages.module.css';

const CreditLimit = () => {
  const dispatch = useDispatch();
  const { creditLimitState } = useSelector((s) => s.member);
  const { form, list } = creditLimitState;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [membersList, setMembersList] = useState([]);

  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        const res = await API.member.search('');
        const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setMembersList(items);
      } catch (err) {
        console.error("Error loading members in CreditLimit:", err);
      }
    };
    fetchAllMembers();
  }, []);

  const handleInputChange = (e) => {
    setErrorMsg('');
    const { name, value } = e.target;
    dispatch(updateCreditLimitForm({ [name]: value }));
  };

  const handleSave = () => {
    setErrorMsg('');
    const numAmt = Number(form.amount);
    if (numAmt < 0 || form.amount.includes('-')) {
      setErrorMsg("Amount cannot be negative");
      return;
    }
    if (!form.memberId || !form.amount || !form.mode) {
      setErrorMsg("Please select member, amount, and mode.");
      return;
    }
    
    const selected = membersList.find(m => String(m.id || m.msrno) === String(form.memberId));
    const memberName = selected ? `${selected.name || ''} (${selected.memberId || selected.loginId || selected.id || selected.msrno})` : form.memberId;
    
    dispatch(addCreditLimit({
      member: memberName,
      amount: form.amount,
      narration: form.narration,
      factor: form.mode === 'Add' ? 'Cr.' : 'Dr.'
    }));
    setIsDrawerOpen(false);
  };

  const ExportButton = ({ icon: Icon, type, title }) => (
    <button 
      className={`${styles.exportBtnColored} ${styles[`bg_${type}`]}`} 
      title={title}
    >
      <Icon />
    </button>
  );

  return (
    <div className={styles.container} style={{ padding: '15px 15px 0px 15px', maxWidth: '100%' }}>
            <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #F1F5F9' }}>
          <div className={styles.directoryTitleGroup} style={{ marginBottom: '20px' }}>
            <h2 className={styles.directoryTitle} style={{ fontSize: 'min(1.3rem, 5.5vw)', margin: 0 }}>Manage Credit Limit</h2>
            <p className={styles.directorySubtitle} style={{ fontSize: 'min(0.8rem, 4vw)', margin: '4px 0 0' }}>Add or revert member credit directly below</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', alignItems: 'end' }}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Member ID</label>
              <select name="memberId" className={styles.inputControl} value={form.memberId} onChange={handleInputChange}>
                <option value="">Select Member</option>
                {membersList.map((m) => {
                  const label = `${m.name || m.userName || ''} (${m.memberId || m.loginId || m.id || m.msrno})`;
                  return (
                    <option key={m.id || m.msrno} value={m.id || m.msrno}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Amount (₹)</label>
              <input type="number" name="amount" className={styles.inputControl} style={{ borderColor: (errorMsg && errorMsg.includes('Amount cannot be negative')) ? '#E53E3E' : '' }} value={form.amount} onChange={handleInputChange} placeholder="0.00" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Select Mode</label>
              <select name="mode" className={styles.inputControl} value={form.mode} onChange={handleInputChange}>
                <option value="">Select Mode</option>
                <option value="Add">Add Credit</option>
                <option value="Revert">Revert Credit</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Narration</label>
              <input 
                type="text"
                name="narration" 
                className={styles.inputControl} 
                value={form.narration} 
                onChange={handleInputChange}
                placeholder="Enter remarks..."
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
              <button style={{ padding: '0 25px', borderRadius: '10px', background: '#1756AA', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px', boxShadow: 'none', transition: 'all 0.2s', outline: 'none' }} onClick={handleSave} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                Add
              </button>
            </div>
          </div>

          {errorMsg && (
            <div style={{ color: '#E53E3E', fontSize: '0.8rem', fontWeight: 600, background: '#FFF5F5', padding: '10px', borderRadius: '8px', marginTop: '16px' }}>
              {errorMsg}
            </div>
          )}
        </div>
        <div className={styles.directoryHeader} style={{ background: '#F8FAFF', padding: '15px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <ExportButton icon={FaCopy} type="copy" title="Copy Table" />
            <ExportButton icon={FaFileCsv} type="csv" title="Download CSV" />
            <ExportButton icon={FaFileExcel} type="excel" title="Download Excel" />
            <ExportButton icon={FaFilePdf} type="pdf" title="Download PDF" />
            <ExportButton icon={FaPrint} type="print" title="Print" />
          </div>

          <div className={styles.tableSearch} style={{ background: '#fff', minWidth: '240px' }}>
            <FaSearch />
            <input type="text" placeholder="Search history..." />
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.tableFull} style={{ minWidth: '800px', width: '100%', marginBottom: 0 }}>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>S.No</th>
                <th style={{ width: '30%' }}>MEMBER NAME</th>
                <th style={{ width: '15%' }}>AMOUNT</th>
                <th style={{ width: '25%' }}>NARRATION</th>
                <th style={{ width: '10%', textAlign: 'center' }}>FACTOR</th>
                <th style={{ width: '15%' }}>ADD DATE</th>
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? list.map((item, i) => (
                <tr key={item.id}>
                  <td style={{ color: '#A0AEC0', fontWeight: 700 }}>{i + 1}</td>
                  <td className={styles.fwBold}>{item.member}</td>
                  <td className={styles.fwBold} style={{ color: '#1756AA' }}>₹ {item.amount}</td>
                  <td>{item.narration || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`${styles.badge} ${item.factor === 'Cr.' ? styles.badge_green : styles.badge_red}`}>
                      {item.factor}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#718096' }}>{item.date}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ padding: 0, background: '#fff' }}>
                    <div style={{ position: 'sticky', left: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: '#A0AEC0' }}>
                      No history found
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', padding: '15px 20px', borderTop: '1px solid #F1F5F9', background: '#fff' }}>
          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 500 }}>
            Showing 1 to {list.length} of {list.length} entries
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className={styles.pageBtn} style={{ width: '36px', height: '36px' }}>
              <FaChevronLeft />
            </button>
            <span className={styles.pageActive} style={{ 
              width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '8px', background: '#1756AA', color: '#fff', fontSize: '0.9rem', fontWeight: 600
            }}>1</span>
            <button className={styles.pageBtn} style={{ width: '36px', height: '36px' }}>
              <FaChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditLimit;
