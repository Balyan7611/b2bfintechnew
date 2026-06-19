import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { API } from '../../../api/endpoints';
import { 
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight, FiChevronDown, FiDatabase, FiX, FiCheck, FiZap, FiSettings, FiActivity, FiArrowRight, FiInfo
} from 'react-icons/fi';
import { 
  FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint 
} from 'react-icons/fa';
import ExportButtons from '../../../shared/components/common/ExportButtons';
import styles from '../MemberPages/MemberPages.module.css';

// ── CUSTOM SEARCHABLE DROPDOWN COMPONENT ──
const CustomSearchSelect = ({ options, placeholder, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
      <div ref={dropdownRef} style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          padding: '12px 16px', border: '1px solid #CBD5E1', borderRadius: '10px', 
          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          background: '#fff', height: '45px', boxSizing: 'border-box'
        }}>
        <span style={{ color: value ? '#1E293B' : '#94A3B8', fontSize: '0.9rem', fontWeight: 600 }}>{value || placeholder}</span>
        <FiChevronDown style={{ color: '#94A3B8', transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
      </div>
      {isOpen && (
        <div style={{ 
          position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, background: '#fff', 
          border: '1px solid #E2E8F0', borderRadius: '10px', zIndex: 150, 
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' 
        }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
            <input 
              autoFocus
              type="text" 
              placeholder="Search service..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
             {filtered.map((opt, i) => (
               <div 
                 key={i} 
                 onClick={() => { onChange(opt); setIsOpen(false); setSearch(""); }}
                 style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #F1F5F9', fontSize: '0.85rem', color: '#1E293B', fontWeight: 600 }}
                 onMouseEnter={(e) => e.target.style.background = '#F8FAFC'}
                 onMouseLeave={(e) => e.target.style.background = 'transparent'}
               >
                 {opt}
               </div>
             ))}
             {filtered.length === 0 && <div style={{ padding: '15px', color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center' }}>No services found</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const ListOperator = () => {
  const dispatch = useDispatch();

  // Selected Service (On/Off list)
  const [selectedService, setSelectedService] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Custom Modal State
  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "confirm" // 'alert' | 'confirm'
  });

  // Add/Edit Form State
  const [formModal, setFormModal] = useState({
    show: false,
    mode: "add", // "add" | "edit"
    id: null,
    name: "",
    opCode: "",
    status: true
  });

  const showCustomAlert = (title, message) => {
    setModal({
      show: true,
      title,
      message,
      onConfirm: null,
      type: "alert"
    });
  };

  const showCustomConfirm = (title, message, onConfirm) => {
    setModal({
      show: true,
      title,
      message,
      onConfirm,
      type: "confirm"
    });
  };

  // Service Options (Matching On/Off Services page)
  const [serviceOptions, setServiceOptions] = useState([
    "Recharge", "MOBILE POSTPAID", "DTH", "Electricity", "Water", "GAS",
    "LPG Gas", "Insurance", "Internet", "Landline Postpaid", "EMI", "FasTag",
    "Education", "Cable Tv", "Municipal Tax", "AEPS", "Aadhar Pay", "Payment Gateway",
    "Scan & Pay", "NSDL PAN", "mATM", "Settlement", "Fund Transfer", "My Services",
    "mATM OnBoard", "Credit Card", "Money Transfer", "Broadband", "DataCard", "BroadBand",
    "Digital Voucher", "Prepaid DataCard", "Metro", "Prebooking", "WiFi", "E-Challan",
    "Broadband Postpaid", "Pay Credit Card Bills", "Account Verification", "DMT PPI",
    "Account Opening", "Loan", "Mobile Prepaid", "Hospital", "Hospital Pathology",
    "Donation", "Health Insurance", "Housing Society", "Life Insurance", "Loan Repay",
    "Muncipal Service", "Recurring Deposit", "Clubs Association", "Rental", "Subscription",
    "NPMC", "NPS", "Prepaid Meter", "Neeraj Bar"
  ]);

  // Operator Registry State List (Mapped to actual Member Panel services data)
  const [operatorRegistry, setOperatorRegistry] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await API.service.getAll();
        if (res && res.status === true && Array.isArray(res.data)) {
          setServiceOptions(res.data.map(item => item.name));
          setErrorMsg('');
        } else {
          setErrorMsg('Failed to load services from API.');
        }
      } catch (err) {
        console.error("Error loading service options:", err);
        setErrorMsg('Failed to connect to service API.');
      }
    };
    
    const fetchOperators = async () => {
      try {
        const res = await API.operator.getAll();
        if (res && Array.isArray(res)) {
          setOperatorRegistry(res.map(item => ({
            id: item.id,
            name: item.name,
            type: item.serviceId === 1 ? 'Recharge' : item.serviceId === 2 ? 'MOBILE POSTPAID' : 'DTH',
            opCode: item.operatorCode,
            status: item.isActive,
            ...item
          })));
          setErrorMsg('');
        } else {
          setErrorMsg('Failed to load operators from API.');
        }
      } catch (err) {
        console.error("Error loading operators registry:", err);
        setErrorMsg('Failed to connect to operator API.');
      }
    };
    
    fetchServices();
    fetchOperators();
  }, []);

  // Fetch Operators for Selected Service
  let serviceOperators = [];
  if (selectedService) {
    serviceOperators = operatorRegistry.filter(op => 
      op.type.toLowerCase() === selectedService.toLowerCase()
    );
  }

  // Filter list by table search input
  const filteredOperators = serviceOperators.filter(op => 
    op.name.toLowerCase().includes(tableSearch.toLowerCase()) || 
    op.opCode.toLowerCase().includes(tableSearch.toLowerCase())
  );

  // Pagination Logic
  const totalEntries = filteredOperators.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedOperators = filteredOperators.slice(startIndex, startIndex + entriesPerPage);

  // Toggle Operator Status
  const handleToggleStatus = (id) => {
    // If it's a generated ID, update state dynamically
    if (typeof id === 'string' && id.startsWith('gen-')) {
      showCustomAlert("Demo Mode", "Generated demo operators cannot toggle status.");
      return;
    }
    setOperatorRegistry(prev => prev.map(op => 
      op.id === id ? { ...op, status: !op.status } : op
    ));
  };

  // Delete Registry Entry
  const handleDeleteOperator = (id, name) => {
    if (typeof id === 'string' && id.startsWith('gen-')) {
      showCustomAlert("Demo Mode", "Generated demo operators cannot be deleted.");
      return;
    }
    showCustomConfirm(
      "Delete Registry Entry",
      `Are you sure you want to remove ${name} from the operator registry?`,
      () => {
        setOperatorRegistry(prev => prev.filter(op => op.id !== id));
        showCustomAlert("Success", "Operator entry deleted successfully.");
      }
    );
  };

  // Submit Add / Edit Form
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formModal.name || !formModal.opCode) {
      showCustomAlert("Validation Warning", "Please fill in all required fields.");
      return;
    }

    if (formModal.mode === "add") {
      const newEntry = {
        id: Date.now(),
        name: formModal.name,
        type: selectedService,
        opCode: formModal.opCode.toUpperCase(),
        status: formModal.status
      };
      setOperatorRegistry(prev => [...prev, newEntry]);
      setFormModal({ ...formModal, show: false });
      showCustomAlert("Success", "New operator registry added successfully!");
    } else {
      if (typeof formModal.id === 'string' && formModal.id.startsWith('gen-')) {
        showCustomAlert("Demo Mode", "Generated demo operators cannot be edited.");
        return;
      }
      setOperatorRegistry(prev => prev.map(op => 
        op.id === formModal.id 
          ? { ...op, name: formModal.name, opCode: formModal.opCode.toUpperCase(), status: formModal.status } 
          : op
      ));
      setFormModal({ ...formModal, show: false });
      showCustomAlert("Success", "Operator entry updated successfully!");
    }
  };

  return (
    <>
      <div className={styles.container} style={{ padding: '15px 12px', maxWidth: '100%' }}>
      {/* ── MAIN CARD ── */}
      <div className={styles.cardFullMobile} style={{ marginTop: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: '16px', overflow: 'hidden', background: '#fff' }}>
        
        {/* CARD INTERNAL HEADER (Polished & height decreased) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0D1B3E' }}>Operator Registry</h3>
          </div>
          <button 
            onClick={() => setFormModal({ show: true, mode: "add", id: null, name: "", opCode: "", status: true })}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              background: '#1756AA', 
              color: '#fff', border: 'none', borderRadius: '8px', 
              padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(23, 86, 170, 0.15)'
            }}
          >
            <FiPlus /> <span>Add Operator</span>
          </button>
        </div>

        {errorMsg && (
          <div style={{ margin: '15px 24px 0 24px', padding: '12px 16px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '8px', border: '1px solid #FEB2B2', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {/* CONTENT VIEW AREA */}
        <div style={{ padding: '24px' }}>
           
           {/* SINGLE SEARCHABLE DROPDOWN FILTER (Aligned to a single row) */}
           <div style={{ background: '#F8FAFC', padding: '12px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '15px' }}>
             <label style={{ fontWeight: 800, color: '#4E6080', fontSize: '0.9rem', whiteSpace: 'nowrap', margin: 0 }}>
               Service:
             </label>
             <CustomSearchSelect 
               options={serviceOptions} 
               placeholder="Search & Select Service..." 
               value={selectedService} 
               onChange={(val) => { setSelectedService(val); setCurrentPage(1); }} 
             />
           </div>

           {/* ── TOOLBAR ── */}
           <div className="global-table-toolbar" style={{ padding: '10px 0px 20px 0px', flexWrap: 'wrap', gap: '15px', borderBottom: 'none' }}>
             <div className={styles.pillRow} style={{ alignItems: 'center' }}>
               <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
               <select 
                 value={entriesPerPage}
                 onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                 className={styles.selectEntries} 
                 style={{ borderRadius: '8px', border: '1px solid #CBD5E1', height: '35px', padding: '0 5px' }}
               >
                 <option value={10}>10</option>
                 <option value={25}>25</option>
                 <option value={50}>50</option>
               </select>
               <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
             </div>

             <ExportButtons 
               headers={['ID', 'Operator Name', 'Operator Code', 'ServiceName']}
               rows={paginatedOperators.map((item, idx) => [
                 startIndex + idx + 1, item.name, item.opCode, selectedService
               ])}
               fileNamePrefix="list_operator_report"
               sheetName="Operators List"
             />

             <div className="global-search-box" style={{ maxWidth: '300px', margin: 0 }}>
               <FiSearch />
               <input 
                 type="text" 
                 value={tableSearch}
                 onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
                 placeholder="Search operators..." 
                 style={{ borderRadius: '10px', height: '40px', boxSizing: 'border-box' }}
               />
             </div>
           </div>

           {/* ── TABLE (Configured columns to match user screenshot) ── */}
           <div className={styles.tableWrapper} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
             <table className={styles.table} style={{ width: '100%', minWidth: '900px', tableLayout: 'auto' }}>
               <thead>
                 <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                   <th style={{ width: '80px', textAlign: 'center' }}>ID</th>
                   <th style={{ width: '180px', textAlign: 'center' }}>Active/DeActive</th>
                   <th style={{ width: '320px', textAlign: 'left' }}>Operator Name</th>
                   <th style={{ width: '180px', textAlign: 'left' }}>Operator Code</th>
                   <th style={{ width: '180px', textAlign: 'left' }}>ServiceName</th>
                 </tr>
               </thead>
               <tbody>
                 {paginatedOperators.map((item, idx) => (
                   <tr key={item.id} className={styles.hoverRow}>
                     <td style={{ fontWeight: 700, color: '#A0AEC0', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                     <td style={{ textAlign: 'center' }}>
                        {/* Custom switch slider matching Active/DeActive styling */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <div 
                            onClick={() => handleToggleStatus(item.id)}
                            style={{
                              width: '38px',
                              height: '20px',
                              borderRadius: '10px',
                              background: item.status ? '#1756AA' : '#CBD5E1',
                              position: 'relative',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <div style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              background: '#fff',
                              position: 'absolute',
                              left: item.status ? '21px' : '3px',
                              transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                            }} />
                          </div></div></td>
                     <td>
                       <span style={{ color: '#1756AA', fontSize: '0.95rem', fontWeight: 800 }}>{item.name}</span>
                     </td>
                     <td style={{ textAlign: 'left', fontWeight: 800, color: '#1E293B' }}>{item.opCode}</td>
                     <td style={{ textAlign: 'left' }}>
                        <span style={{ background: '#F0F7FF', color: '#1756AA', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 }}>
                          {selectedService}
                        </span>
                     </td>
                   </tr>
                 ))}
                 {paginatedOperators.length === 0 ? (
                   <tr>
                     <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                       <FiInfo style={{ fontSize: '1.5rem', marginBottom: '8px' }} />
                       <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{selectedService ? "No data available in table" : "Please select a service from the dropdown to view operator registry."}</p>
                     </td>
                   </tr>
                 ) : null}
               </tbody>
             </table>
           </div>

           {/* ── PAGINATION ── */}
           {totalPages > 1 && (
             <div className="global-pagination" style={{ padding: '25px 0px 0px 0px', borderTop: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
                 Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, totalEntries)} of {totalEntries} records
               </div>
               <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                 <button 
                   onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                   disabled={currentPage === 1}
                   className="global-page-btn" 
                   style={{ borderRadius: '8px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                 >
                   <FiChevronLeft />
                 </button>
                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', background: '#1756AA', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem' }}>
                   {currentPage}
                 </div>
                 <button 
                   onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                   disabled={currentPage === totalPages}
                   className="global-page-btn" 
                   style={{ borderRadius: '8px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                 >
                   <FiChevronRight />
                 </button>
               </div>
             </div>
           )}
        </div>

      {/* ── ADD/EDIT OPERATOR FORM OVERLAY MODAL ── */}
      {formModal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999
        }}>
          <form onSubmit={handleFormSubmit} style={{
            background: '#ffffff', borderRadius: '16px', width: '400px', maxWidth: '90%',
            padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>
                {formModal.mode === "add" ? "Add Operator" : "Edit Operator"}
              </h4>
              <FiX style={{ cursor: 'pointer', color: '#94A3B8', fontSize: '1.2rem' }} onClick={() => setFormModal({ ...formModal, show: false })} />
            </div>

            <div className={styles.formGroup} style={{ margin: 0 }}>
               <label className={styles.label} style={{ fontWeight: 700, color: '#4E6080', marginBottom: '6px' }}>Service Category</label>
               <input 
                 type="text" 
                 value={selectedService} 
                 disabled 
                 style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F1F5F9', color: '#64748B', fontWeight: 600 }} 
               />
            </div>

            <div className={styles.formGroup} style={{ margin: 0 }}>
               <label className={styles.label} style={{ fontWeight: 700, color: '#4E6080', marginBottom: '6px' }}>Operator Name *</label>
               <input 
                 type="text" 
                 value={formModal.name} 
                 onChange={(e) => setFormModal({ ...formModal, name: e.target.value })}
                 placeholder="e.g. Airtel Prepaid" 
                 style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', color: '#1E293B', fontWeight: 600, boxSizing: 'border-box' }} 
               />
            </div>

            <div className={styles.formGroup} style={{ margin: 0 }}>
               <label className={styles.label} style={{ fontWeight: 700, color: '#4E6080', marginBottom: '6px' }}>Operator Code *</label>
               <input 
                 type="text" 
                 value={formModal.opCode} 
                 onChange={(e) => setFormModal({ ...formModal, opCode: e.target.value })}
                 placeholder="e.g. AT" 
                 style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', color: '#1E293B', fontWeight: 600, boxSizing: 'border-box' }} 
               />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
               <span style={{ fontWeight: 700, color: '#4E6080', fontSize: '0.9rem' }}>Operator Status</span>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div 
                   onClick={() => setFormModal({ ...formModal, status: !formModal.status })}
                   style={{
                     width: '38px',
                     height: '20px',
                     borderRadius: '10px',
                     background: formModal.status ? '#1756AA' : '#CBD5E1',
                     position: 'relative',
                     cursor: 'pointer',
                     transition: 'background-color 0.2s',
                     display: 'flex',
                     alignItems: 'center'
                   }}
                 >
                   <div style={{
                     width: '14px',
                     height: '14px',
                     borderRadius: '50%',
                     background: '#fff',
                     position: 'absolute',
                     left: formModal.status ? '21px' : '3px',
                     transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                     boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                   }} />
                 </div>
                 <span style={{ fontSize: '0.8rem', fontWeight: 800, color: formModal.status ? '#1756AA' : '#64748B' }}>
                   {formModal.status ? 'ONLINE' : 'OFFLINE'}
                 </span>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                type="button"
                onClick={() => setFormModal({ ...formModal, show: false })}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff', color: '#64748B', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#1756AA', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── CUSTOM ALERT/CONFIRM MODAL ── */}
      {modal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '14px', width: '360px', maxWidth: '90%',
            padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            textAlign: 'center', border: '1px solid #E2E8F0'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: modal.type === 'confirm' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(23, 86, 170, 0.1)',
              color: modal.type === 'confirm' ? '#EF4444' : '#1756AA',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', margin: '0 auto 16px auto'
            }}>
              <FiInfo />
            </div>
            
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 800, color: '#0D1B3E' }}>
              {modal.title}
            </h4>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#64748B', fontWeight: 600, lineHeight: '1.4' }}>
              {modal.message}
            </p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {modal.type === 'confirm' ? (
                <>
                  <button 
                    onClick={() => setModal({ ...modal, show: false })}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0',
                      background: '#fff', color: '#64748B', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      modal.onConfirm();
                      setModal({ ...modal, show: false });
                    }}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                      background: '#1756AA', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                    }}
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setModal({ ...modal, show: false })}
                  style={{
                    padding: '10px 24px', borderRadius: '8px', border: 'none',
                    background: '#1756AA', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Okay
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default ListOperator;
