import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { 
  setAEPSWalletList, 
  updateAEPSWalletFilters, 
  setAEPSWalletSearchQuery, 
  setAEPSWalletRowsPerPage, 
  setAEPSWalletCurrentPage 
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import { API } from '../../../../api/endpoints';
import { resolveMemberId, getLoginId } from '../../../../utils/memberIdentity';
import { getSession } from '../../../../utils/authUtils';
import { formatLedgerDate } from '../../../../models/walletLedgerModel';
import SearchableSelect from '../../../../shared/components/common/SearchableSelect';
import styles from './AEPSReport.module.css';

const AEPSWalletHistory = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isApiPanel = location.pathname.startsWith('/api-panel');
  const [isLoading, setIsLoading] = React.useState(false);
  const [masterServices, setMasterServices] = React.useState([]);
  const [masterOperators, setMasterOperators] = React.useState([]);
  const [masterApis, setMasterApis] = React.useState([]);
  const {
    list,
    filters,
    searchQuery,
    rowsPerPage,
    currentPage
  } = useSelector(state => state.report.aepsWalletReport);

  const [memberOptions, setMemberOptions] = React.useState([]);

  React.useEffect(() => {
    const fetchMasters = async () => {
      try {
        const svcRes = await API.service.getAll();
        setMasterServices(Array.isArray(svcRes?.data) ? svcRes.data : Array.isArray(svcRes) ? svcRes : []);
      } catch (e) {}
      try {
        const opRes = await API.operator.getAll({ pageSize: 1000 });
        setMasterOperators(Array.isArray(opRes?.data?.items) ? opRes.data.items : Array.isArray(opRes?.data) ? opRes.data : Array.isArray(opRes) ? opRes : []);
      } catch (e) {}
      try {
        const apiRes = await API.masterApi.getAll({ pageSize: 500 });
        setMasterApis(Array.isArray(apiRes?.data?.items) ? apiRes.data.items : Array.isArray(apiRes?.data) ? apiRes.data : Array.isArray(apiRes) ? apiRes : []);
      } catch (e) {}
    };
    fetchMasters();
  }, []);

  React.useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await API.member.getAll({ pageNumber: 1, pageSize: 5000 });
        const items = res?.data?.items || res?.data || res || [];
        const options = (Array.isArray(items) ? items : []).map(m => {
          const name = m.name || m.fullName || m.memberName || m.ownerName || m.firstName || m.firmName || '';
          const loginId = m.memberID || m.memberid || m.loginID || m.loginId || m.username || String(m.id || m.msrno);
          return {
            value: String(m.id || m.msrno),
            label: name && loginId ? `${name} (${loginId})` : (name || loginId || `Member ${m.id || m.msrno}`)
          };
        });
        setMemberOptions(options);
      } catch (err) {
        console.warn('Failed to load members for filter', err);
      }
    };
    if (isApiPanel) fetchMembers();
  }, [isApiPanel]);

  // Loads the logged-in member's own AEPS wallet movements.
  const loadHistory = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const defaultMemberId = await resolveMemberId();
      const queryMemberId = filters.memberId || defaultMemberId;
      if (!queryMemberId) {
        console.warn('AEPSWalletHistory: could not resolve member id');
        dispatch(setAEPSWalletList([]));
        return;
      }
      // WalletTypeId 2 = AEPS wallet ledger.
      const { items } = await API.walletLedger.getAepsLedger({
        memberId: queryMemberId,
        pageNumber: 1,
        pageSize: 500,
        fromDate: filters.fromDate || '',
        toDate: filters.toDate || ''
      });
      console.log('[AEPSWalletHistory] memberId', queryMemberId, '->', items.length, 'ledger row(s)', items);

      // Always the logged-in member's own ledger — fall back to the session's
      // name/login id when the API doesn't echo the member back.
      const session = getSession();
      let myName = session?.name || session?.fullName || '';
      let myLoginId = getLoginId() || queryMemberId;
      
      try {
        const res = await API.member.getById(queryMemberId);
        const m = res?.data?.data || res?.data || res || {};
        if (m.name || m.loginId || m.ownerName || m.username) {
          myName = m.name || m.fullName || m.memberName || m.ownerName || m.firstName || m.firmName || myName;
          myLoginId = m.memberID || m.memberid || m.loginID || m.loginId || m.username || myLoginId;
        }
      } catch (e) {
        console.error('Failed to fetch member detail', e);
      }

      // This table uses member/name/desc/charge/status column names.
      dispatch(setAEPSWalletList(items.map(r => ({
        ...r,
        id: r.id,
        member: r.loginId || myLoginId || r.msrno || queryMemberId,
        name: r.memberName || myName || r.loginId || myLoginId || '-',
        opening: (r.openingBalance || 0).toFixed(2),
        amount: (r.amount || 0).toFixed(2),
        factor: r.isCredit ? 'Credit' : 'Debit',
        commission: (r.commission || 0).toFixed(2),
        tds: (r.tds || 0).toFixed(2),
        charge: (r.charge || 0).toFixed(2),
        closing: (r.balance || 0).toFixed(2),
        date: formatLedgerDate(r.createdDate),
        desc: r.description || r.narration || '-',
        status: r.status || 'SUCCESS'
      }))));
    } catch (err) {
      console.error('AEPSWalletHistory: failed to load', err);
      dispatch(setAEPSWalletList([]));
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const lower = (v) => String(v ?? '').toLowerCase();
  const filteredList = list.filter(item =>
    lower(item.name).includes(lower(searchQuery)) ||
    lower(item.desc).includes(lower(searchQuery))
  );

  // Dynamic Column logic
  const baseData = filteredList.length > 0 ? filteredList : list;
  let dynamicColumns = [];
  const allowedApiKeys = [
    'createdDate', 'orderId', 'vendorId', 'refid', 'rrn',
    'memberName', 'memberId', 'serviceName', 'operatorName', 'apiName', 'operator', 'api', 'service',
    'customerName', 'customerMobile', 'accountNo', 'ifsc', 'bankName', 'beniName', 'beniVerifyName',
    'openingBalance', 'amount', 'closingBalance',
    'surcharge', 'commission', 'serviceCharge', 'totalCommission', 'totalTds', 'cashback', 'gst', 'tds', 'vgst', 'vcs', 'vtds', 'padmin', 'pgst', 'tdsadmin',
    'mode', 'ip', 'fromChannel', 'message', 'status'
  ];

  if (baseData && baseData.length > 0) {
    const rawKeys = Object.keys(baseData[0]);
    dynamicColumns = allowedApiKeys.filter(key => {
      if (rawKeys.includes(key)) return true;
      if (key === 'operatorName' && (rawKeys.includes('operatorId') || rawKeys.includes('operator'))) return true;
      if (key === 'apiName' && (rawKeys.includes('apiId') || rawKeys.includes('api') || rawKeys.includes('apiid'))) return true;
      if (key === 'serviceName' && (rawKeys.includes('serviceId') || rawKeys.includes('service'))) return true;
      return false;
    });
  }
  
  const formatHeader = (key) => key.replace(/([A-Z])/g, ' $1').toUpperCase();
  const displayColumns = dynamicColumns.length > 0
    ? ['SNO', ...dynamicColumns.map(formatHeader)]
    : ['SNO', 'MEMBER DETAIL', 'OPENING BALANCE', 'AMOUNT', 'FACTOR', 'COMMISSION', 'TDS', 'CHARGE', 'CLOSING BALANCE', 'DATE', 'DESCRIPTION', 'STATUS'];

  return (
    <div className={styles.container}>
      <AdminTable
        title="AEPS EWALLET SUMMARY"
        topContent={
          <div className={styles.filterSection}>
            <div className={styles.filterRow}>
               <div className={styles.formGroup}>
                <label>From Date</label>
                <input type="date" className={styles.inputControl} name="fromDate" value={filters.fromDate} onChange={(e) => dispatch(updateAEPSWalletFilters({fromDate: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label>To Date</label>
                <input type="date" className={styles.inputControl} name="toDate" value={filters.toDate} onChange={(e) => dispatch(updateAEPSWalletFilters({toDate: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label>Member ID :</label>
                <SearchableSelect
                  options={memberOptions}
                  value={filters.memberId}
                  onChange={(val) => dispatch(updateAEPSWalletFilters({memberId: val}))}
                  placeholder="Select Member"
                />
              </div>
              <button className={styles.submitBtn} disabled={isLoading} onClick={loadHistory}>{isLoading ? 'Loading...' : 'Filter Records'}</button>
            </div>
          </div>
        }
        columns={displayColumns}
        data={filteredList}
        renderRow={(item, index) => {
          return (
            <tr key={item.id || index}>
              <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  {dynamicColumns.map((colKey, colIndex) => {
                    let val = item[colKey];
                    
                    if (colKey === 'operatorName' && !val) {
                      const opId = item.operatorId || item.operator;
                      if (opId) {
                         const op = masterOperators.find(o => String(o.id) === String(opId));
                         val = op ? op.name || op.operatorCode : opId;
                      } else val = 'N/A';
                    }
                    if (colKey === 'apiName' && !val) {
                      const aId = item.apiId || item.api || item.apiid;
                      if (aId) {
                         const api = masterApis.find(a => String(a.id) === String(aId) || String(a.apiid) === String(aId));
                         val = api ? api.apiname || api.name : aId;
                      } else val = 'N/A';
                    }
                    if (colKey === 'serviceName' && !val) {
                      const sId = item.serviceId || item.service;
                      if (sId) {
                         const svc = masterServices.find(s => String(s.id) === String(sId));
                         val = svc ? svc.name : sId;
                      } else val = 'N/A';
                    }
                    
                    // Status styling
                if (colKey.toLowerCase() === 'status') {
                   let statusStyle = styles.statusPending;
                   if (String(val).toUpperCase() === 'SUCCESS') statusStyle = styles.statusSuccess;
                   if (String(val).toUpperCase() === 'FAILED') statusStyle = styles.statusFailed;
                   return (
                     <td key={colIndex}>
                       <span className={`${styles.statusBadge} ${statusStyle}`}>
                         {val}
                       </span>
                     </td>
                   );
                }

                // Date styling (split top and bottom if contains 'T')
                if (String(val).includes('T') && String(val).length > 10) {
                  return (
                    <td key={colIndex}>
                      <div style={{ color: '#0D1B3E', fontWeight: '800', fontSize: '0.85rem' }}>{String(val).split('T')[0]}</div>
                      <div style={{ color: '#718096', fontSize: '0.75rem', fontWeight: '600', marginTop: '2px' }}>{String(val).split('T')[1]?.split('.')[0] || ''}</div>
                    </td>
                  );
                }

                return (
                  <td key={colIndex} style={{ fontSize: '0.8rem', color: '#4E6080' }}>
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </td>
                );
              })}
            </tr>
          );
        }}
        searchQuery={searchQuery}
        onSearchChange={(val) => dispatch(setAEPSWalletSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => dispatch(setAEPSWalletRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setAEPSWalletCurrentPage(val))}
        totalEntries={filteredList.length}
        totalPages={Math.ceil(filteredList.length / rowsPerPage)}
      />
    </div>
  );
};

export default AEPSWalletHistory;

