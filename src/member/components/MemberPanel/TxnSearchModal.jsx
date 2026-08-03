import React, { useState } from 'react';
import { FiSearch, FiX, FiCheckCircle, FiAlertCircle, FiXCircle } from 'react-icons/fi';
import { API } from '../../../api/endpoints';
import ReceiptModal from '../../../shared/components/common/ReceiptModal';
import styles from './TxnSearchModal.module.css';

const TxnSearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await API.transaction.search({
        searchTerm: searchTerm.trim(),
        pageNumber: 1,
        pageSize: 10
      });

      if (res && res.status !== false) {
        const payload = res.data || res;
        setResults(payload.items || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('TxnSearchModal: Search failed:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'success') return styles.statusSuccess;
    if (s === 'pending') return styles.statusPending;
    return styles.statusFailed;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.iconBox}><FiSearch /></div>
              <div>
                <h2>Universal Transaction Search</h2>
                <p>Find any transaction by ID, RRN, or Mobile</p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <FiX />
            </button>
          </div>

          <div className={styles.modalBody}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.inputWrapper}>
                <FiSearch className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Enter Order ID, RRN, Phone, Acc or Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <button type="submit" disabled={loading} className={styles.searchBtn}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>

            <div className={styles.resultsContainer}>
              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>Searching database...</p>
                </div>
              ) : hasSearched && results.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No transactions found for "{searchTerm}"</p>
                </div>
              ) : (
                <div className={styles.resultsList}>
                  {results.map((txn, index) => (
                    <div key={index} className={styles.resultItem}>
                      <div className={styles.resultMain}>
                        <div className={styles.resultTop}>
                          <span className={styles.txnId}>{txn.orderId || txn.transactionId || txn.id || 'N/A'}</span>
                          <span className={`${styles.statusBadge} ${getStatusStyle(txn.status)}`}>
                            {txn.status || 'PENDING'}
                          </span>
                        </div>
                        <div className={styles.resultMiddle}>
                          <span className={styles.txnDate}>
                            {txn.createdDate ? new Date(txn.createdDate).toLocaleString('en-IN') : '-'}
                          </span>
                          <span className={styles.txnAmount}>
                            ₹{txn.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                          </span>
                        </div>
                        <div className={styles.resultBottom}>
                          <span>{txn.customerName || txn.customerMobile || '-'}</span>
                          <button 
                            className={styles.viewBtn}
                            onClick={() => {
                              setSelectedTxn(txn);
                              setIsReceiptOpen(true);
                            }}
                          >
                            View Receipt
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ReceiptModal 
        isOpen={isReceiptOpen} 
        onClose={() => setIsReceiptOpen(false)} 
        data={selectedTxn} 
      />
    </>
  );
};

export default TxnSearchModal;
