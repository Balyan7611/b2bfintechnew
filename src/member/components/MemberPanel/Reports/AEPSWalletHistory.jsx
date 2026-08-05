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

  const displayColumns = ['SNO', 'Member', 'Opening Balance', 'Amount', 'Factor', 'Commission', 'GST', 'TDS', 'Closing Balance', 'Narration', 'Transfer Date'];

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
                <td>{`${item.name || 'N/A'} (${item.member || 'N/A'})`}</td>
                <td>₹{item.opening || '0.00'}</td>
                <td>₹{item.amount || '0.00'}</td>
                <td>{item.factor || 'N/A'}</td>
                <td>₹{item.commission || '0.00'}</td>
                <td>₹{item.gst || '0.00'}</td>
                <td>₹{item.tds || '0.00'}</td>
                <td>₹{item.closing || '0.00'}</td>
                <td>{item.desc || item.narration || 'N/A'}</td>
                <td>{item.date || 'N/A'}</td>
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

