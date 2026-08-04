import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { 
  setMainWalletList, 
  updateMainWalletFilters, 
  setMainWalletSearchQuery, 
  setMainWalletRowsPerPage, 
  setMainWalletCurrentPage 
} from '../../../../store/slices/reportSlice';
import AdminTable from '../../../../shared/components/common/AdminTable';
import { API } from '../../../../api/endpoints';
import { resolveMemberId, getLoginId } from '../../../../utils/memberIdentity';
import { getSession } from '../../../../utils/authUtils';
import { formatLedgerDate } from '../../../../models/walletLedgerModel';
import SearchableSelect from '../../../../shared/components/common/SearchableSelect';
import styles from './AEPSReport.module.css';

const MainWalletHistory = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isApiPanel = location.pathname.startsWith('/api-panel');
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    list,
    filters,
    searchQuery,
    rowsPerPage,
    currentPage
  } = useSelector(state => state.report.mainWalletReport);

  const [memberOptions, setMemberOptions] = React.useState([]);
  const [masterServices, setMasterServices] = React.useState([]);
  const [masterOperators, setMasterOperators] = React.useState([]);
  const [masterApis, setMasterApis] = React.useState([]);

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

  // Loads the logged-in member's own Main wallet movements.
  const loadHistory = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const defaultMemberId = await resolveMemberId();
      const queryMemberId = filters.memberId || defaultMemberId;
      if (!queryMemberId) {
        console.warn('MainWalletHistory: could not resolve member id');
        dispatch(setMainWalletList([]));
        return;
      }
      // WalletTypeId 1 = Main wallet ledger.
      const { items } = await API.walletLedger.getMainLedger({
        memberId: queryMemberId,
        pageNumber: 1,
        pageSize: 500,
        fromDate: filters.fromDate || '',
        toDate: filters.toDate || ''
      });
      console.log('[MainWalletHistory] memberId', queryMemberId, '->', items.length, 'ledger row(s)', items);

      const session = getSession();
      
      // Fetch actual member details to ensure correct name/loginId instead of session fallback
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

      const meLabel = myName && myLoginId ? `${myName} (${myLoginId})`
        : myName || myLoginId || `Member #${queryMemberId}`;

      dispatch(setMainWalletList(items.map(r => {
        const rowName = r.memberName || myName;
        const rowLoginId = r.loginId || myLoginId;
        const memberLabel = rowName && rowLoginId ? `${rowName} (${rowLoginId})`
          : rowName || rowLoginId || meLabel;

        return {
          ...r,
          id: r.id,
          member: rowLoginId,
          memberName: rowName,
          opening: (r.openingBalance || 0).toFixed(2),
          amount: (r.amount || 0).toFixed(2),
          factor: r.isCredit ? 'Credit' : 'Debit',
          surcharge: (r.surcharge || 0).toFixed(2),
          gst: (r.gst || 0).toFixed(2),
          tds: (r.tds || 0).toFixed(2),
          commission: (r.commission || 0).toFixed(2),
          closing: (r.balance || 0).toFixed(2),
          narration: r.narration || r.description || '-',
          date: formatLedgerDate(r.createdDate)
        };
      })));
    } catch (err) {
      console.error('MainWalletHistory: failed to load', err);
      dispatch(setMainWalletList([]));
    } finally {
      setIsLoading(false);
    }
    // filters are read on demand via the Search button, not as deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const lower = (v) => String(v ?? '').toLowerCase();
  const filteredList = list.filter(item =>
    lower(item.narration).includes(lower(searchQuery)) ||
    lower(item.member).includes(lower(searchQuery))
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
    : ['SNO', 'MEMBER DETAIL', 'OPENING AMOUNT', 'AMOUNT', 'FACTOR', 'SURCHARGE', 'GST', 'TDS', 'COMMISSION', 'CLOSING BALANCE', 'NARRATION', 'TRANSFER DATE'];

  return (
    <div className={`${styles.container} ${styles.compactTableContainer}`}>
      <AdminTable
        title="E-WALLET HISTORY"
        topContent={
          <div className={styles.filterSection}>
            <div className={styles.filterRow}>
              <div className={styles.formGroup}>
                <label>From Date</label>
                <input type="date" className={styles.inputControl} name="fromDate" value={filters.fromDate} onChange={(e) => dispatch(updateMainWalletFilters({fromDate: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label>To Date</label>
                <input type="date" className={styles.inputControl} name="toDate" value={filters.toDate} onChange={(e) => dispatch(updateMainWalletFilters({toDate: e.target.value}))} />
              </div>
              <div className={styles.formGroup}>
                <label>Member ID :</label>
                <SearchableSelect
                  options={memberOptions}
                  value={filters.memberId}
                  onChange={(val) => dispatch(updateMainWalletFilters({memberId: val}))}
                  placeholder="Select Member"
                />
              </div>
              <button className={styles.submitBtn} disabled={isLoading} onClick={loadHistory}>
                {isLoading ? 'Loading...' : 'Search History'}
              </button>
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
        onSearchChange={(val) => dispatch(setMainWalletSearchQuery(val))}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(val) => dispatch(setMainWalletRowsPerPage(val))}
        currentPage={currentPage}
        onPageChange={(val) => dispatch(setMainWalletCurrentPage(val))}
        totalEntries={filteredList.length}
        totalPages={Math.ceil(filteredList.length / rowsPerPage)}
      />
    </div>
  );
};

export default MainWalletHistory;

