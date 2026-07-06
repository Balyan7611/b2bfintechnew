import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import DashboardPage from './admin/pages/DashboardPage';
import { SITE_CONFIG } from './config/siteConfig';
import MemberCertificate from './member/components/MemberPanel/Certificate/MemberCertificate';
import CommissionSetup from './member/components/MemberPanel/Commission/CommissionSetup';
import UploadKYC from './member/components/MemberPanel/KYC/UploadKYC';
import MemberHome from './member/components/MemberPanel/MemberHome';
import MyServices from './member/components/MemberPanel/MyServices';
import MyProfile from './member/components/MemberPanel/Profile/MyProfile';
import AEPSReport from './member/components/MemberPanel/Reports/AEPSReport';
import AEPSWalletHistory from './member/components/MemberPanel/Reports/AEPSWalletHistory';
import BBPSHistory from './member/components/MemberPanel/Reports/BBPSHistory';
import BusinessSummary from './member/components/MemberPanel/Reports/BusinessSummary';
import DMTHistory from './member/components/MemberPanel/Reports/DMTHistory';
import MainWalletHistory from './member/components/MemberPanel/Reports/MainWalletHistory';
import MATMHistory from './member/components/MemberPanel/Reports/MATMHistory';
import PayoutHistory from './member/components/MemberPanel/Reports/PayoutHistory';
import RechargeHistory from './member/components/MemberPanel/Reports/RechargeHistory';
import AadharPay from './member/components/MemberPanel/Services/AadharPay';
import Aeps from './member/components/MemberPanel/Services/Aeps';
import CableTV from './member/components/MemberPanel/Services/CableTV';
import DMT from './member/components/MemberPanel/Services/DMT';
import DTHRecharge from './member/components/MemberPanel/Services/DTHRecharge';
import Electricity from './member/components/MemberPanel/Services/Electricity';
import Fastag from './member/components/MemberPanel/Services/Fastag';
import Gas from './member/components/MemberPanel/Services/Gas';
import Insurance from './member/components/MemberPanel/Services/Insurance';
import Landline from './member/components/MemberPanel/Services/Landline';
import LPGGas from './member/components/MemberPanel/Services/LPGGas';
import MobilePostpaid from './member/components/MemberPanel/Services/MobilePostpaid';
import MobileRecharge from './member/components/MemberPanel/Services/MobileRecharge';
import MunicipalTax from './member/components/MemberPanel/Services/MunicipalTax';
import PanCard from './member/components/MemberPanel/Services/PanCard';
import Payout from './member/components/MemberPanel/Services/Payout';
import UpiCashout from './member/components/MemberPanel/Services/UpiCashout';
import UpiTransfer from './member/components/MemberPanel/Services/UpiTransfer';
import Water from './member/components/MemberPanel/Services/Water';
import FundRequest from './member/components/MemberPanel/Wallet/FundRequest';
import WalletToWallet from './member/components/MemberPanel/Wallet/WalletToWallet';
import LoginPage from './member/pages/LoginPage';
import MemberDashboard from './member/pages/MemberDashboard';
import ContactPage from './public/pages/ContactPage';
import HomePage from './public/pages/HomePage';
import PrivacyPolicyPage from './public/pages/PrivacyPolicyPage';
import RefundPolicyPage from './public/pages/RefundPolicyPage';
import RegisterDetailsPage from './public/pages/RegisterDetailsPage';
import TermsPage from './public/pages/TermsPage';
import { AuthGuard } from './security/auth-guard';
import { clearSession, isTokenExpired } from './utils/authUtils';
import { setNavScrolled, setNotification } from './store/slices/uiSlice';
import GlobalLoaderAndToast from './components/GlobalLoaderAndToast';

function App() {
  const [sessionExpiredModal, setSessionExpiredModal] = useState({ show: false, message: '', redirectUrl: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 15 minutes of inactivity limit (900,000 ms)
    const INACTIVITY_LIMIT = 15 * 60 * 1000;
    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      const isDashboardPath = location.pathname.startsWith('/member/dashboard') || location.pathname.startsWith('/admin/dashboard') || location.pathname === '/dashboard';
      if (!isDashboardPath) return;
      
      const adminStr = localStorage.getItem('admin_token');
      const accessStr = localStorage.getItem('access_token');
      
      const isValidTokenStr = (token) => {
        if (!token) return false;
        const t = token.replace(/^"(.*)"$/, '$1');
        return t !== 'null' && t !== 'undefined' && t !== '';
      };

      const hasAdmin = isValidTokenStr(adminStr);
      const hasAccess = isValidTokenStr(accessStr);
      const session = localStorage.getItem('bss_current_session');
      const isValidSession = isValidTokenStr(session);
      
      if ((hasAdmin || hasAccess) && isValidSession) {
        timeoutId = setTimeout(handleAutoLogout, INACTIVITY_LIMIT);
      }
    };

    const handleAutoLogout = () => {
      const isDashboardPath = location.pathname.startsWith('/member/dashboard') || location.pathname.startsWith('/admin/dashboard') || location.pathname === '/dashboard';
      if (!isDashboardPath || window.__isLoggingOut) return;
      
      window.__isLoggingOut = true;
      const isAdminPath = location.pathname.startsWith('/admin');
      clearSession();
      setSessionExpiredModal({
        show: true,
        message: "You have been logged out due to inactivity.",
        redirectUrl: isAdminPath ? '/admin/login' : '/member/login'
      });
    };

    const handleTokenExpirationLogout = () => {
      const isDashboardPath = location.pathname.startsWith('/member/dashboard') || location.pathname.startsWith('/admin/dashboard') || location.pathname === '/dashboard';
      if (!isDashboardPath || window.__isLoggingOut) return;

      window.__isLoggingOut = true;
      const isAdminPath = location.pathname.startsWith('/admin');
      clearSession();
      setSessionExpiredModal({
        show: true,
        message: "Your session has expired. Please log in again.",
        redirectUrl: isAdminPath ? '/admin/login' : '/member/login'
      });
    };

    const checkTokenExpiration = () => {
      const isDashboardPath = location.pathname.startsWith('/member/dashboard') || location.pathname.startsWith('/admin/dashboard') || location.pathname === '/dashboard';
      if (!isDashboardPath) return;

      const adminToken = localStorage.getItem('admin_token');
      const memberToken = localStorage.getItem('access_token');
      
      const isValidTokenStr = (token) => {
        if (!token) return false;
        const t = token.replace(/^"(.*)"$/, '$1');
        return t !== 'null' && t !== 'undefined' && t !== '';
      };

      const isValidAdminToken = isValidTokenStr(adminToken);
      const isValidMemberToken = isValidTokenStr(memberToken);

      if (isValidAdminToken || isValidMemberToken) {
        // Retrieve session data to check how long ago the user logged in
        const session = localStorage.getItem('bss_current_session');
        if (session) {
          try {
            const parsedSession = JSON.parse(session);
            if (parsedSession.loggedInAt) {
              const loginTime = new Date(parsedSession.loggedInAt).getTime();
              const elapsedMs = Date.now() - loginTime;
              // If logged in for more than 15 minutes (900,000 ms), force logout
              if (elapsedMs >= 15 * 60 * 1000) {
                handleTokenExpirationLogout();
                return;
              }
            }
          } catch (e) {
            console.error("Session parsing failed in token expiration check", e);
          }
        }
      }

      if (isValidAdminToken && isTokenExpired(adminToken)) {
         handleTokenExpirationLogout();
      } else if (isValidMemberToken && isTokenExpired(memberToken)) {
         handleTokenExpirationLogout();
      }
    };

    // Check token expiration every 10 seconds
    const tokenCheckInterval = setInterval(checkTokenExpiration, 10000);

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();
    checkTokenExpiration(); // Check immediately on mount/route change

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (tokenCheckInterval) clearInterval(tokenCheckInterval);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [dispatch, navigate, location.pathname]);

  useEffect(() => {
    // Dynamic page title and description
    document.title = SITE_CONFIG.brandName;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', `${SITE_CONFIG.companyName} - Complete digital platform for mobile & DTH recharge, bill payments, payout, and other financial services.`);
    }

    const handleScroll = () => dispatch(setNavScrolled(window.scrollY > 50));
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  useEffect(() => {
    const handleGlobalExport = (e) => {
      const btn = e.target.closest('.global-export-btn');
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      let ancestor = btn.parentElement;
      let table = null;
      while (ancestor && ancestor !== document.body) {
        table = ancestor.querySelector('table');
        if (table) break;
        ancestor = ancestor.parentElement;
      }
      if (!table) {
        table = document.querySelector('table');
      }
      if (!table) {
        dispatch(setNotification({ type: 'error', message: 'No table found to export.' }));
        return;
      }

      const headerCells = Array.from(table.querySelectorAll('thead th'));
      const columnsToExport = [];
      const headers = [];

      headerCells.forEach((th, idx) => {
        const text = th.innerText.trim().toUpperCase();
        if (text === 'ACTION' || text === 'ACTIONS' || text === '' || th.querySelector('input[type="checkbox"]')) {
          return;
        }
        columnsToExport.push(idx);
        headers.push(th.innerText.trim());
      });

      const rows = [];
      const bodyRows = table.querySelectorAll('tbody tr');
      bodyRows.forEach((tr) => {
        if (tr.innerText.includes('Loading...') || tr.innerText.includes('No records found') || tr.innerText.includes('No data found') || tr.cells.length <= 1) {
          return;
        }
        const rowData = [];
        columnsToExport.forEach((colIdx) => {
          const td = tr.cells[colIdx];
          if (td) {
            let cellText = td.innerText.trim();
            if (cellText.startsWith('●')) {
              cellText = cellText.replace('●', '').trim();
            }
            rowData.push(cellText);
          } else {
            rowData.push('');
          }
        });
        rows.push(rowData);
      });

      if (rows.length === 0) {
        dispatch(setNotification({ type: 'error', message: 'No data available to export.' }));
        return;
      }

      let titleText = 'report';
      const cardHeader = ancestor ? (ancestor.querySelector('h2') || ancestor.querySelector('h3')) : null;
      if (cardHeader) {
        titleText = cardHeader.innerText.trim();
      } else {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          titleText = pathSegments[pathSegments.length - 1];
        }
      }

      let cleanPrefix = titleText
        .toLowerCase()
        .replace(/entries|list|show|policy|policy_list/g, '')
        .trim()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'report';

      if (cleanPrefix === 'system_roles' || cleanPrefix === 'roles') {
        cleanPrefix = 'role';
      } else if (cleanPrefix === 'services') {
        cleanPrefix = 'service';
      }

      if (cleanPrefix.endsWith('s') && cleanPrefix.length > 3) {
        cleanPrefix = cleanPrefix.slice(0, -1);
      }

      const today = new Date();
      const day = today.getDate().toString().padStart(2, '0');
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const year = today.getFullYear();
      const dateStr = `${day}_${month}_${year}`;
      const fileName = `${cleanPrefix}_report_${dateStr}`;

      let exportType = 'copy';
      if (btn.classList.contains('btn-excel')) exportType = 'excel';
      else if (btn.classList.contains('btn-pdf')) exportType = 'pdf';
      else if (btn.classList.contains('btn-csv')) exportType = 'csv';
      else if (btn.classList.contains('btn-print')) exportType = 'print';

      if (exportType === 'copy') {
        const tsvContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
        navigator.clipboard.writeText(tsvContent)
          .then(() => {
            dispatch(setNotification({ type: 'success', message: 'Table data copied to clipboard as TSV!' }));
          })
          .catch(err => {
            dispatch(setNotification({ type: 'error', message: 'Failed to copy to clipboard: ' + err }));
          });
      } else if (exportType === 'csv') {
        const csvContent = [
          headers.join(','),
          ...rows.map(row => 
            row.map(val => {
              const stringVal = String(val);
              if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
                return `"${stringVal.replace(/"/g, '""')}"`;
              }
              return stringVal;
            }).join(',')
          )
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.csv`;
        link.click();
        dispatch(setNotification({ type: 'success', message: 'CSV downloaded successfully!' }));
      } else if (exportType === 'excel') {
        let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
        html += `<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta charset="utf-8"></head><body>`;
        html += `<table border="1">`;
        html += `<tr style="background-color: #0D1B5E; color: #FFFFFF; font-weight: bold;">`;
        headers.forEach(h => {
          html += `<th>${h}</th>`;
        });
        html += `</tr>`;
        rows.forEach(row => {
          html += `<tr>`;
          row.forEach(val => {
            html += `<td>${val}</td>`;
          });
          html += `</tr>`;
        });
        html += `</table></body></html>`;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.xls`;
        link.click();
        dispatch(setNotification({ type: 'success', message: 'Excel downloaded successfully!' }));
      } else if (exportType === 'print' || exportType === 'pdf') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          let rowsHtml = '';
          rows.forEach(row => {
            rowsHtml += '<tr>';
            row.forEach((val, colIdx) => {
              const stringVal = String(val);
              const lowerVal = stringVal.toLowerCase();
              let tdStyle = '';
              let contentHtml = stringVal;

              if (lowerVal === 'active' || lowerVal === 'inactive' || lowerVal === 'true' || lowerVal === 'false') {
                const isActive = lowerVal === 'active' || lowerVal === 'true';
                tdStyle = `color: ${isActive ? '#27AE60' : '#E53E3E'}; font-weight: bold;`;
                contentHtml = isActive ? 'ACTIVE' : 'INACTIVE';
              } else if (colIdx === 1) {
                tdStyle = 'font-weight: 600; color: #1756AA;';
              } else if (stringVal.startsWith('₹') || (headers[colIdx] && headers[colIdx].toLowerCase().includes('price') && !isNaN(val))) {
                tdStyle = 'color: #27AE60; font-weight: bold;';
                if (!stringVal.startsWith('₹')) {
                  contentHtml = '₹' + stringVal;
                }
              } else if (colIdx === 2 && stringVal.length > 0 && stringVal.length < 15) {
                contentHtml = `<span style="background: rgba(23, 86, 170, 0.1); color: #1756AA; padding: 2px 6px; border-radius: 4px;">${stringVal}</span>`;
              }

              rowsHtml += `<td style="${tdStyle}">${contentHtml}</td>`;
            });
            rowsHtml += '</tr>';
          });

          printWindow.document.write(`
            <html>
              <head>
                <title>${fileName}</title>
                <style>
                  body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    margin: 20px;
                    color: #333;
                  }
                  h2 {
                    color: #0D1B5E;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #0D1B5E;
                    padding-bottom: 8px;
                    text-transform: capitalize;
                  }
                  table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                  }
                  th, td {
                    border: 1px solid #E2E8F0;
                    padding: 10px 12px;
                    text-align: left;
                    font-size: 14px;
                  }
                  th {
                    background-color: #0D1B5E;
                    color: white;
                    font-weight: bold;
                  }
                  tr:nth-child(even) {
                    background-color: #F8FAFC;
                  }
                  @media print {
                    body { margin: 0; }
                    h2 { font-size: 20px; }
                    th { background-color: #0D1B5E !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                  }
                </style>
              </head>
              <body>
                <h2>${cleanPrefix.replace(/_/g, ' ')} Report</h2>
                <table>
                  <thead>
                    <tr>
                      ${headers.map(h => `<th>${h}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${rowsHtml}
                  </tbody>
                </table>
                <script>
                  window.onload = function() {
                    window.print();
                    window.close();
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
          dispatch(setNotification({ type: 'success', message: `${exportType.toUpperCase()} export opened successfully!` }));
        }
      }
    };

    document.body.addEventListener('click', handleGlobalExport);
    return () => document.body.removeEventListener('click', handleGlobalExport);
  }, [dispatch]);

  return (
    <div className="App">
      <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/refund" element={<RefundPolicyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/register" element={<RegisterDetailsPage />} />
          <Route path="/register/details" element={<Navigate to="/register" replace />} />
          <Route path="/login" element={<Navigate to="/member/login" replace />} />

          {/* --- MEMBER ROUTES --- */}
          <Route path="/member/" element={<LoginPage />} />
          <Route path="/member/login" element={<LoginPage />} />
          <Route path="/member/dashboard" element={<AuthGuard role="2">
                <MemberDashboard />
            </AuthGuard>}>
            <Route index element={<MemberHome />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="commission" element={<CommissionSetup />} />
            <Route path="report/aeps" element={<AEPSReport />} />
            <Route path="report/dmt" element={<DMTHistory />} />
            <Route path="report/payout" element={<PayoutHistory />} />
            <Route path="report/matm" element={<MATMHistory />} />
            <Route path="report/recharge" element={<RechargeHistory />} />
            <Route path="report/bbps" element={<BBPSHistory />} />
            <Route path="report/business" element={<BusinessSummary />} />
            <Route path="wallet/aeps" element={<AEPSWalletHistory />} />
            <Route path="wallet/main" element={<MainWalletHistory />} />
            <Route path="wallet/w2w" element={<WalletToWallet />} />
            <Route path="wallet/fund-request" element={<FundRequest />} />
            <Route path="my-services" element={<MyServices />} />
            <Route path="kyc/upload" element={<UploadKYC />} />
            <Route path="service/mobile-postpaid" element={<MobilePostpaid />} />
            <Route path="service/dth" element={<DTHRecharge />} />
            <Route path="service/electricity" element={<Electricity />} />
            <Route path="service/water" element={<Water />} />
            <Route path="service/gas" element={<Gas />} />
            <Route path="service/lpg" element={<LPGGas />} />
            <Route path="service/insurance" element={<Insurance />} />
            <Route path="service/landline" element={<Landline />} />
            <Route path="service/fastag" element={<Fastag />} />
            <Route path="service/cable-tv" element={<CableTV />} />
            <Route path="service/municipal-tax" element={<MunicipalTax />} />
            <Route path="service/mobile-recharge" element={<MobileRecharge />} />
            <Route path="service/dmt" element={<DMT />} />
            <Route path="service/payout" element={<Payout />} />
            <Route path="service/aadharpay" element={<AadharPay />} />
            <Route path="service/aeps" element={<Aeps />} />
            <Route path="service/upicashout" element={<UpiCashout />} />
            <Route path="service/upitransfer" element={<UpiTransfer />} />
            <Route path="service/pan" element={<PanCard />} />
            <Route path="certificate" element={<MemberCertificate />} />
          </Route>
          <Route path="/member/commission" element={<Navigate to="/member/dashboard/commission" replace />} />
          <Route path="/member/report/aeps" element={<Navigate to="/member/dashboard/report/aeps" replace />} />
          <Route path="/member/kyc/upload" element={<Navigate to="/member/dashboard/kyc/upload" replace />} />
          <Route path="/member/certificate" element={<Navigate to="/member/dashboard/certificate" replace />} />

          {/* --- ADMIN ROUTES --- */}
          <Route path="/admin/" element={<AdminLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AuthGuard role="1">
                <DashboardPage />
            </AuthGuard>} />
          <Route path="/admin/dashboard/:tab" element={<AuthGuard role="1">
                <DashboardPage />
            </AuthGuard>} />
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
        <GlobalLoaderAndToast />
        {sessionExpiredModal.show && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
              <div style={{ width: '60px', height: '60px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3 style={{ color: '#1F2937', marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', fontFamily: 'inherit' }}>Session Expired</h3>
              <p style={{ color: '#4B5563', marginBottom: '25px', fontSize: '15px', fontFamily: 'inherit' }}>{sessionExpiredModal.message}</p>
              <button 
                onClick={() => window.location.href = sessionExpiredModal.redirectUrl} 
                style={{ background: '#0D1B5E', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', width: '100%', fontSize: '16px', transition: 'background 0.2s', fontFamily: 'inherit' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#0a1445'}
                onMouseOut={(e) => e.currentTarget.style.background = '#0D1B5E'}
              >
                Log In Again
              </button>
            </div>
          </div>
        )}
      </div>
  );
}

export default App;
