import React, { useState, useRef, useEffect } from 'react';
import { FaTrash, FaExclamationCircle, FaPlus, FaTimes, FaSearch, FaCopy, FaFileExcel, FaFilePdf, FaFileCsv, FaPrint } from 'react-icons/fa';
import { apiService } from '../../../api/httpClient';
import { API } from '../../../api/endpoints';
import styles from './Commission.module.css';

const SetCommission = () => {
  const topFormRef = useRef(null);

  // ---- Dropdown Data State ----
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [operators, setOperators] = useState([]);
  const [activeRoles, setActiveRoles] = useState([]);

  // ---- Dynamic Matrix Selection State ----
  const [dynPackage, setDynPackage] = useState('');
  const [dynService, setDynService] = useState('');
  const [dynOperator, setDynOperator] = useState('');

  // ---- Matrix Grid Slabs & Level Columns ----
  const [dynLevels, setDynLevels] = useState(['slabCharges']);
  const [dynSlabs, setDynSlabs] = useState([]);
  const [showAddColumnSelect, setShowAddColumnSelect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ---- Live Bottom Table State ----
  const [list, setList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', id: null, title: '', desc: '' });

  // Fetch Packages, Services, Operators, and Roles on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch packages
        const pkgRes = await API.package.getAll();
        let pkgs = [];
        if (pkgRes && pkgRes.status === true && pkgRes.data) {
          pkgs = Array.isArray(pkgRes.data.items)
            ? pkgRes.data.items
            : (Array.isArray(pkgRes.data) ? pkgRes.data : []);
        }
        setPackages(pkgs);

        // Fetch services
        const svcRes = await API.service.getAll();
        let svcs = [];
        if (svcRes && svcRes.status === true && Array.isArray(svcRes.data)) {
          svcs = svcRes.data;
        }
        setServices(svcs);

        // Fetch operators
        const opRes = await API.operator.getAll({ pageNumber: 1, pageSize: 10000 });
        let ops = [];
        if (opRes && opRes.status === true && opRes.data && Array.isArray(opRes.data.items)) {
          ops = opRes.data.items;
        }
        setOperators(ops);

        // Fetch active roles (levels) from Commission API
        const rolesRes = await apiService.get('/Commission/GetRoles');
        if (rolesRes && rolesRes.status === true && Array.isArray(rolesRes.data)) {
          setActiveRoles(rolesRes.data);
          // Initialize columns: slabCharges + fetched roles
          const roleIds = rolesRes.data.map(r => r.id);
          setDynLevels(['slabCharges', ...roleIds]);
        }
      } catch (err) {
        console.error("Error fetching dropdown options dynamically:", err);
      }
    };
    fetchDropdownData();
  }, []);

  // Fetch Live Table Data from DB
  const fetchList = async () => {
    try {
      const payload = {
        pageNumber,
        pageSize,
        packageId: Number(dynPackage) || 0,
        serviceId: Number(dynService) || 0,
        opId: Number(dynOperator) || 0,
        searchQuery: searchQuery || ""
      };
      const res = await apiService.post('/Commission/GetCommissionReport', payload);
      if (res && res.status === true && res.data) {
        setList(res.data.items || []);
        setTotalItems(res.data.totalItems || 0);
      }
    } catch (err) {
      console.error("Error loading commission list from database:", err);
    }
  };

  // Reload report list on pagination/search changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchList();
  }, [pageNumber, pageSize, searchQuery, dynPackage, dynService, dynOperator]);

  // Filter operators dynamically based on selected service ID (handles all casings)
  const filteredOperators = operators.filter(o => {
    if (!dynService) return true;
    const opSvcId = o.serviceId || o.serviceID || o.ServiceID;
    return String(opSvcId) === String(dynService);
  });

  // Auto reset operator selection if service changes and it doesn't match
  useEffect(() => {
    if (dynOperator && dynService) {
      const match = filteredOperators.find(o => String(o.id || o.ID) === String(dynOperator));
      if (!match) {
        setDynOperator('');
      }
    }
  }, [dynService, dynOperator, filteredOperators]);

  // Load slabs when Package, Service, or Operator selection changes
  const handleLoadMatrix = async () => {
    if (!dynPackage || !dynService || !dynOperator) {
      setDynSlabs([]);
      return;
    }
    setIsLoading(true);
    try {
      const url = `/Commission/GetDynamicMatrix?packageId=${dynPackage}&serviceId=${dynService}&opId=${dynOperator}`;
      const res = await apiService.get(url);
      if (res && res.status === true && res.data) {
        const levels = res.data.levels || [];
        const slabs = res.data.slabs || [];

        // Update active column headers dynamically
        setDynLevels(['slabCharges', ...levels]);

        if (slabs.length > 0) {
          const mappedSlabs = slabs.map(s => {
            const slabsObj = {
              slabCharges: {
                id: s.slabSurcharge?.id || 0,
                general: s.slabSurcharge?.sc || 0,
                amountType: s.slabSurcharge?.isComSur ? 'COM' : 'SUR',
                valueType: s.slabSurcharge?.isPF ? 'PER' : 'FIX'
              }
            };

            levels.forEach((lvlId, idx) => {
              const valDto = s.values[idx] || { id: 0, sc: 0, isComSur: true, isPF: true };
              slabsObj[lvlId] = {
                id: valDto.id || 0,
                general: valDto.sc || 0,
                amountType: valDto.isComSur ? 'COM' : 'SUR',
                valueType: valDto.isPF ? 'PER' : 'FIX'
              };
            });

            return {
              id: s.id || 0,
              startValue: s.startVal || 0,
              endValue: s.endVal || 0,
              slabs: slabsObj
            };
          });
          setDynSlabs(mappedSlabs);
        } else {
          handleResetMatrix(levels);
        }
      }
    } catch (err) {
      console.error("Error loading commission matrix from database:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger matrix load on selection change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    handleLoadMatrix();
  }, [dynPackage, dynService, dynOperator]);

  const handleResetMatrix = (customLevels = null) => {
    const targetLevels = customLevels || dynLevels.filter(lvl => lvl !== 'slabCharges');
    setDynSlabs([createEmptySlab(targetLevels)]);
  };

  const createEmptySlab = (targetLevels) => {
    const slabsObj = {
      slabCharges: { id: 0, general: 0, amountType: 'COM', valueType: 'PER' }
    };
    targetLevels.forEach(lvlId => {
      slabsObj[lvlId] = { id: 0, general: 0, amountType: 'COM', valueType: 'PER' };
    });

    return {
      id: 0,
      startValue: 0,
      endValue: 999999,
      slabs: slabsObj
    };
  };

  const handleAddSlab = () => {
    const roleIdsOnly = dynLevels.filter(lvl => lvl !== 'slabCharges');
    const lastSlab = dynSlabs[dynSlabs.length - 1];
    const nextStart = lastSlab ? (Number(lastSlab.endValue) + 1) : 0;

    const slabsObj = {
      slabCharges: { id: 0, general: 0, amountType: 'COM', valueType: 'PER' }
    };
    roleIdsOnly.forEach(lvlId => {
      slabsObj[lvlId] = { id: 0, general: 0, amountType: 'COM', valueType: 'PER' };
    });

    setDynSlabs(prev => [...prev, {
      id: 0,
      startValue: nextStart,
      endValue: nextStart + 999999,
      slabs: slabsObj
    }]);
  };

  const handleRemoveSlab = (index) => {
    if (dynSlabs.length > 1) {
      setDynSlabs(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSlabValueChange = (slabIndex, field, value) => {
    setDynSlabs(prev => {
      const copy = [...prev];
      copy[slabIndex] = { ...copy[slabIndex], [field]: parseFloat(value) || 0 };
      return copy;
    });
  };

  const handleSlabToggle = (slabIndex, roleKey, field, value) => {
    setDynSlabs(prev => {
      const copy = [...prev];
      copy[slabIndex] = {
        ...copy[slabIndex],
        slabs: {
          ...copy[slabIndex].slabs,
          [roleKey]: {
            ...copy[slabIndex].slabs[roleKey],
            [field]: value
          }
        }
      };
      return copy;
    });
  };

  const handleSlabGeneralChange = (slabIndex, roleKey, val) => {
    setDynSlabs(prev => {
      const copy = [...prev];
      copy[slabIndex] = {
        ...copy[slabIndex],
        slabs: {
          ...copy[slabIndex].slabs,
          [roleKey]: {
            ...copy[slabIndex].slabs[roleKey],
            general: parseFloat(val) || 0
          }
        }
      };
      return copy;
    });
  };

  // Add Level Column
  const handleAddLevelColumn = (roleId) => {
    const numId = Number(roleId);
    if (!dynLevels.includes(numId)) {
      setDynLevels(prev => [...prev, numId]);
      // Update existing local slabs with new role level initialized to empty
      setDynSlabs(prev => prev.map(slab => ({
        ...slab,
        slabs: {
          ...slab.slabs,
          [numId]: { id: 0, general: 0, amountType: 'COM', valueType: 'PER' }
        }
      })));
    }
    setShowAddColumnSelect(false);
  };

  // Remove Level Column
  const handleRemoveLevelColumn = (roleId) => {
    if (roleId === 'slabCharges') return; // Slab Charges cannot be removed
    setDynLevels(prev => prev.filter(lvl => lvl !== roleId));
  };

  // Check for overlaps in slabs
  const getOverlapIndices = () => {
    const overlaps = new Set();
    for (let i = 0; i < dynSlabs.length; i++) {
      for (let j = i + 1; j < dynSlabs.length; j++) {
        const s1 = dynSlabs[i];
        const s2 = dynSlabs[j];
        const start1 = s1.startValue || 0;
        const end1 = s1.endValue || 0;
        const start2 = s2.startValue || 0;
        const end2 = s2.endValue || 0;
        if (start1 >= 0 && end1 > 0 && start2 >= 0 && end2 > 0) {
          if (
            (start1 >= start2 && start1 <= end2) ||
            (end1 >= start2 && end1 <= end2) ||
            (start1 <= start2 && end1 >= end2)
          ) {
            overlaps.add(i);
            overlaps.add(j);
          }
        }
      }
    }
    return overlaps;
  };

  const overlapIndices = getOverlapIndices();

  // Save Dynamic Matrix to Database REST API
  const handleSaveMatrix = async () => {
    if (!dynPackage || !dynService || !dynOperator) {
      alert("Please select Package, Service, and Operator.");
      return;
    }
    if (overlapIndices.size > 0) {
      alert("Please fix overlapping slab ranges before saving.");
      return;
    }

    const roleLevels = dynLevels.filter(lvl => lvl !== 'slabCharges').map(lvl => Number(lvl));

    const payload = {
      packageId: Number(dynPackage),
      serviceId: Number(dynService),
      opId: Number(dynOperator),
      levels: roleLevels,
      slabs: dynSlabs.map(s => {
        const slabSur = s.slabs.slabCharges || { id: 0, general: 0, amountType: 'COM', valueType: 'PER' };

        const valuesList = roleLevels.map(roleId => {
          const val = s.slabs[roleId] || { id: 0, general: 0, amountType: 'COM', valueType: 'PER' };
          return {
            id: val.id || 0,
            isComSur: val.amountType === 'COM',
            isPF: val.valueType === 'PER',
            sc: Number(val.general) || 0
          };
        });

        return {
          id: typeof s.id === 'number' ? s.id : 0,
          startVal: Number(s.startValue) || 0,
          endVal: Number(s.endValue) || 0,
          slabSurcharge: {
            id: slabSur.id || 0,
            isComSur: slabSur.amountType === 'COM',
            isPF: slabSur.valueType === 'PER',
            sc: Number(slabSur.general) || 0
          },
          values: valuesList
        };
      })
    };

    try {
      const res = await apiService.post('/Commission/SaveDynamicMatrix', payload);
      if (res && res.status === true) {
        alert("Commission matrix saved successfully to database!");
        handleLoadMatrix(); // Reload matrix
        fetchList(); // Refresh bottom table
      } else {
        alert(res?.message || "Failed to save commission matrix.");
      }
    } catch (err) {
      console.error("Error saving matrix to database:", err);
      alert("Error saving matrix to database API.");
    }
  };

  // Perform Toggle / Delete actions in DB
  const handleConfirmAction = async () => {
    try {
      if (confirmModal.type === 'toggle') {
        const res = await apiService.post(`/Commission/ToggleActive/${confirmModal.id}`);
        if (res && res.status === true) {
          alert("Status toggled successfully!");
          fetchList();
        } else {
          alert(res?.message || "Failed to toggle status.");
        }
      } else if (confirmModal.type === 'delete') {
        const res = await apiService.delete(`/Commission/Delete/${confirmModal.id}`);
        if (res && res.status === true) {
          alert("Commission entry deleted successfully!");
          fetchList();
        } else {
          alert(res?.message || "Failed to delete entry.");
        }
      }
    } catch (err) {
      console.error("Error performing action:", err);
      alert("API error during action execution.");
    } finally {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  // Maps all IDs to strings dynamically and schedules values safely
  const handleEdit = (item) => {
    setDynPackage(item.packageId ? String(item.packageId) : '');
    setDynService(item.serviceId ? String(item.serviceId) : '');
    setDynOperator(item.opId ? String(item.opId) : '');
    topFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const availableRolesToAdd = activeRoles.filter(role => !dynLevels.includes(role.id));

  return (
    <div className={styles.container} ref={topFormRef}>
      {/* ── DYNAMIC MATRIX CARD ── */}
      <div className={styles.dmCard}>
        <div className={styles.dmHeaderBar}>
          <div className={styles.directoryTitleGroup}>
            <h2 className={styles.dmTitle}>Dynamic Commission Matrix <span className={styles.dmTitleSub}>Configure network-wide slabs</span></h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className={styles.dmCountChip}>
              Commissions: {dynSlabs.reduce((acc, slab) => acc + Object.values(slab.slabs || {}).filter(v => v.amountType === 'COM').length, 0)}
            </span>
            <span className={styles.dmCountChip} style={{ background: '#dd8a1f' }}>
              Surcharges: {dynSlabs.reduce((acc, slab) => acc + Object.values(slab.slabs || {}).filter(v => v.amountType === 'SUR').length, 0)}
            </span>
          </div>
        </div>

        <div className={styles.dmCardPad}>
          {/* Dropdowns Toolbar */}
          <div className={styles.dmToolbar}>
            <div className={styles.dmField}>
              <label>Select Package *</label>
              <select value={dynPackage} onChange={(e) => setDynPackage(e.target.value)}>
                <option value="">Select Package</option>
                {packages.map(p => (
                  <option key={p.id || p.ID} value={String(p.id || p.ID)}>{p.name || p.Name}</option>
                ))}
              </select>
            </div>
            <div className={styles.dmField}>
              <label>Select Service *</label>
              <select value={dynService} onChange={(e) => setDynService(e.target.value)}>
                <option value="">Select Service</option>
                {services.map(s => (
                  <option key={s.id || s.ID} value={String(s.id || s.ID)}>{s.name || s.Name}</option>
                ))}
              </select>
            </div>
            <div className={styles.dmField}>
              <label>Select Operator *</label>
              <select value={dynOperator} onChange={(e) => setDynOperator(e.target.value)}>
                <option value="">Select Operator</option>
                {filteredOperators.map(o => (
                  <option key={o.id || o.ID} value={String(o.id || o.ID)}>{o.name || o.Name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.dmActions}>
            <button className={`${styles.dmBtn} ${styles.dmBtnBrand}`} disabled={!dynPackage || !dynService || !dynOperator} onClick={handleSaveMatrix}>
              Save Matrix
            </button>
            <button className={`${styles.dmBtn} ${styles.dmBtnOutline}`} disabled={!dynPackage || !dynService || !dynOperator} onClick={() => handleLoadMatrix()}>
              Reset Matrix
            </button>
          </div>
        </div>

        <div className={styles.dmLegend}>
          <div className={styles.dmLegendItem}>
            <span className={`${styles.dmSwatch} ${styles.dmSwatchCom}`}></span> Commission (COM)
          </div>
          <div className={styles.dmLegendItem}>
            <span className={`${styles.dmSwatch} ${styles.dmSwatchSur}`}></span> Surcharge (SUR)
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', fontWeight: 'bold', color: '#1756AA' }}>
            Loading matrix details from database...
          </div>
        ) : dynSlabs.length > 0 ? (
          <div className={styles.dmScroll}>
            <div className={styles.dmGrid} style={{ gridTemplateColumns: `220px repeat(${dynLevels.length}, 150px) 110px` }}>
              {/* Grid Header */}
              <div className={styles.dmSlabHead}>
                <span className={styles.t1}>Slab Range</span>
                <span className={styles.t2}>Amount in ₹</span>
              </div>
              {dynLevels.map(lvl => {
                const isSlabCharge = lvl === 'slabCharges';
                const roleName = isSlabCharge ? 'Slab Charges' : (activeRoles.find(r => r.id === lvl)?.name || lvl);
                return (
                  <div key={lvl} className={isSlabCharge ? styles.dmSurchargeHead : styles.dmLevelHead} style={{ position: 'relative' }}>
                    <span className={styles.t1}>{roleName}</span>
                    {isSlabCharge && <span className={styles.t2}>base charge, no role</span>}
                    {!isSlabCharge && (
                      <button 
                        className={styles.dmRemoveChip} 
                        style={{ position: 'absolute', top: '8px', right: '8px', padding: '2px 6px', background: '#FEE2E2', borderRadius: '50%' }}
                        onClick={() => handleRemoveLevelColumn(lvl)}
                        title="Remove Column"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add Level Column Button */}
              <div className={styles.dmAddLevelCol} style={{ flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                {showAddColumnSelect ? (
                  <select 
                    style={{ fontSize: '11px', padding: '6px', borderRadius: '8px', border: '1px solid #CBD5E0' }} 
                    onChange={(e) => handleAddLevelColumn(e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Select Role</option>
                    {availableRolesToAdd.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                ) : (
                  <button 
                    className={styles.dmAddLevelBtn} 
                    disabled={availableRolesToAdd.length === 0} 
                    onClick={() => setShowAddColumnSelect(true)}
                    title="Add Level Column"
                    style={{ fontSize: '12px', padding: '8px 12px' }}
                  >
                    <FaPlus /> Column
                  </button>
                )}
              </div>

              {/* Grid Body Rows */}
              {dynSlabs.map((slab, si) => {
                const isOverlap = overlapIndices.has(si);
                return (
                  <React.Fragment key={slab.id || si}>
                    {/* Range Cell */}
                    <div className={`${styles.dmSlabRangeCell} ${isOverlap ? styles.dmOverlap : ''}`}>
                      <div className={styles.dmRangeInputs}>
                        <input
                          type="number"
                          value={slab.startValue}
                          onChange={(e) => handleSlabValueChange(si, 'startValue', e.target.value)}
                        />
                        <span>→</span>
                        <input
                          type="number"
                          value={slab.endValue}
                          onChange={(e) => handleSlabValueChange(si, 'endValue', e.target.value)}
                        />
                      </div>
                      {isOverlap && (
                        <span className={styles.dmOverlapWarning}>
                          <FaExclamationCircle /> Overlaps slab
                        </span>
                      )}
                      <button
                        className={styles.dmRemoveSlabBtn}
                        disabled={dynSlabs.length === 1}
                        onClick={() => handleRemoveSlab(si)}
                      >
                        Remove slab
                      </button>
                    </div>

                    {/* Slabs Value Cards (Compact Inline Design) */}
                    {dynLevels.map(lvl => {
                      const value = slab.slabs[lvl] || { general: 0, amountType: 'COM', valueType: 'PER' };
                      return (
                        <div
                          key={lvl}
                          className={`${styles.dmValueCard} ${value.amountType === 'SUR' ? styles.dmModeSur : ''}`}
                        >
                          <div className={styles.dmValueInputWrapper}>
                            <input
                              type="number"
                              step="0.01"
                              value={value.general}
                              className={styles.dmValueInputInline}
                              onChange={(e) => handleSlabGeneralChange(si, lvl, e.target.value)}
                            />
                            <div className={styles.dmInlineBadges}>
                              <span
                                className={`${styles.dmInlineBadge} ${value.amountType === 'COM' ? styles.comActive : styles.surActive}`}
                                onClick={() => handleSlabToggle(si, lvl, 'amountType', value.amountType === 'COM' ? 'SUR' : 'COM')}
                              >
                                {value.amountType}
                              </span>
                              <span
                                className={`${styles.dmInlineBadge} ${styles.unitActive}`}
                                onClick={() => handleSlabToggle(si, lvl, 'valueType', value.valueType === 'PER' ? 'FIX' : 'PER')}
                              >
                                {value.valueType === 'PER' ? '%' : '₹'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Action space placeholder */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>
                  </React.Fragment>
                );
              })}
            </div>

            <div className={styles.dmAddSlabRow} onClick={handleAddSlab} style={{ marginTop: '16px' }}>
              <span>+ Add another slab</span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>
            Please select Package, Service, and Operator to load the commission configuration.
          </div>
        )}
      </div>

      {/* ── TABLE CARD (Live Database Report) ── */}
      <div className={styles.card} style={{ marginTop: '30px' }}>
        <div className="global-table-toolbar">
          <div className={styles.pillRow} style={{ alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>Show</span>
            <select className={styles.selectEntries} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span style={{ fontSize: '0.85rem', color: '#4E6080', fontWeight: 600 }}>entries</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
            <button className="global-export-btn btn-copy" title="Copy Table"><FaCopy /></button>
            <button className="global-export-btn btn-excel" title="Download Excel"><FaFileExcel /></button>
            <button className="global-export-btn btn-pdf" title="Download PDF"><FaFilePdf /></button>
            <button className="global-export-btn btn-csv" title="Download CSV"><FaFileCsv /></button>
            <button className="global-export-btn btn-print" title="Print Table"><FaPrint /></button>
          </div>

          <div className="global-search-box">
            <FaSearch />
            <input type="text" placeholder="Search role/operator..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPageNumber(1); }} />
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.tableFull} style={{ minWidth: '1200px' }}>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>PACKAGE / SERVICE</th>
                <th>OPERATOR / RANGE</th>
                <th>SLAB CHARGES</th>
                {activeRoles.map(role => (
                  <th key={role.id}>{role.name.toUpperCase()}</th>
                ))}
                <th>UPDATE</th>
                <th>ACTIVE</th>
                <th>DELETE</th>
              </tr>
            </thead>
            <tbody>
              {list.length > 0 ? list.map((item, i) => (
                <tr key={item.id || i}>
                  <td style={{ fontWeight: 700, color: '#A0AEC0' }}>{(pageNumber - 1) * pageSize + i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0D1B3E' }}>{item.packageName || item.package}</div>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>{item.serviceName || item.service}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0D1B3E' }}>{item.operatorName || item.operator}</div>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>{item.startVal || item.startValue} - {item.endVal || item.endValue}</div>
                  </td>
                  {/* Slab Surcharge (RoleID = 0) */}
                  <td key="slabCharges">
                    {(() => {
                      const lvlVal = item.levels?.find(l => l.roleId === 0);
                      if (lvlVal) {
                        return (
                          <>
                            <span style={{ fontWeight: 600 }}>{lvlVal.sc}</span>
                            <span style={{ fontSize: '0.75rem', color: '#718096', marginLeft: '6px' }}>
                              ({lvlVal.isComSur ? 'COM' : 'SUR'} - {lvlVal.isPF ? 'PER' : 'FIX'})
                            </span>
                          </>
                        );
                      }
                      return <span style={{ color: '#CBD5E0' }}>-</span>;
                    })()}
                  </td>
                  {/* Active Dynamic Roles */}
                  {activeRoles.map(role => (
                    <td key={role.id}>
                      {(() => {
                        const lvlVal = item.levels?.find(l => l.roleId === role.id);
                        if (lvlVal) {
                          return (
                            <>
                              <span style={{ fontWeight: 600 }}>{lvlVal.sc}</span>
                              <span style={{ fontSize: '0.75rem', color: '#718096', marginLeft: '6px' }}>
                                ({lvlVal.isComSur ? 'COM' : 'SUR'} - {lvlVal.isPF ? 'PER' : 'FIX'})
                              </span>
                            </>
                          );
                        }
                        return <span style={{ color: '#CBD5E0' }}>-</span>;
                      })()}
                    </td>
                  ))}
                  <td>
                    <button className={styles.pillBlue} onClick={() => handleEdit(item)}>Update</button>
                  </td>
                  <td>
                    <button
                      className={`${styles.toggleStatus} ${!item.isActive ? styles.inactive : ''}`}
                      onClick={() => setConfirmModal({ isOpen: true, type: 'toggle', id: item.id, title: item.isActive ? 'Deactivate Status' : 'Activate Status', desc: `Are you sure you want to ${item.isActive ? 'deactivate' : 'activate'} this commission?` })}
                    >
                      {item.isActive ? 'Active' : 'Deactive'}
                    </button>
                  </td>
                  <td>
                    <button className={styles.deleteBtn} onClick={() => setConfirmModal({ isOpen: true, type: 'delete', id: item.id, title: 'Delete Commission', desc: 'Are you sure you want to delete this commission? This action cannot be undone.' })}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8 + activeRoles.length} className={styles.emptyState}>
                    No commission ranges set up yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {confirmModal.isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <h3 className={styles.modalTitle}>{confirmModal.title}</h3>
            <p className={styles.modalDesc}>{confirmModal.desc}</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>Cancel</button>
              <button className={`${styles.confirmBtn} ${confirmModal.type === 'delete' ? styles.danger : ''}`} onClick={handleConfirmAction}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetCommission;
