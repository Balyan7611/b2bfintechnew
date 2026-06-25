import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { API } from '../../api/endpoints';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { SITE_CONFIG } from '../../config/siteConfig';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  toggleSidebar,
  setSidebarOpen,
  setSelectedDate,
  toggleQuickActions,
  setQuickActionsOpen,
  setHoveredMenu,
  setIsMemberDropdownOpen
} from '../../store/slices/dashboardSlice';
import { clearSession, getSession } from '../../utils/authUtils';
import { setNotification } from '../../store/slices/uiSlice';
import {
  FaBars, FaSearch, FaWallet, FaSignOutAlt, FaTh,
  FaMobileAlt, FaFingerprint, FaMoneyBillWave, FaUsers,
  FaExchangeAlt, FaRupeeSign, FaTimesCircle, FaUsersCog,
  FaUserPlus, FaUserCircle, FaTachometerAlt, FaHeadset,
  FaBalanceScale, FaShoppingCart, FaUserTie, FaPercent,
  FaIdCard, FaFileAlt, FaGavel, FaCog, FaSms, 
  FaChevronRight, FaChevronLeft,
  FaMoneyCheckAlt, FaCreditCard, FaQrcode, FaAddressCard, 
  FaHandHoldingUsd, FaPaperPlane, FaMoneyBill, FaChartPie, FaProjectDiagram,
  FaChevronDown, FaCircle, FaCalendarAlt, FaCaretDown, FaCaretUp,
  FaEdit, FaUserLock, FaArrowLeft, FaExclamationTriangle
} from 'react-icons/fa';
import { FiGrid, FiX, FiDroplet } from 'react-icons/fi';
import SupportList from '../../shared/components/SupportList/SupportList';
import AddSupport from '../components/SupportPages/AddSupport';
import SupportMain from '../components/SupportPages/SupportMain';
import HoldAmount from '../components/BalancePages/HoldAmount';
import CompanyBank from '../components/BalancePages/CompanyBank';
import AddBank from '../components/BalancePages/AddBank';
import MemberBankDetails from '../components/BalancePages/MemberBankDetails';
import FundRequest from '../components/BalancePages/FundRequest';
import Transfer from '../components/BalancePages/Transfer';
import StaffRegistration from '../components/MemberPages/StaffRegistration';
import StaffList from '../components/MemberPages/StaffList';
import ChangePassword from '../components/MemberPages/ChangePassword';
import ChangeTPIN from '../components/MemberPages/ChangeTPIN';
import MemberSecurity from '../components/MemberPages/MemberSecurity';
import CreditLimit from '../components/MemberPages/CreditLimit';
import MemberRegistration from '../components/MemberPages/MemberRegistration';
import ManageMember from '../components/MemberPages/ManageMember';
import AssignTID from '../components/MemberPages/AssignTID';
import SetCommission from '../components/CommissionPages/SetCommission';
import SetApiCommissionRange from '../components/CommissionPages/SetApiCommissionRange';
import KYCDocuments from '../components/KYCPages/KYCDocuments';
import UploadKYC from '../components/KYCPages/UploadKYC';
import KYCDetails from '../components/KYCPages/KYCDetails';
import TermsAndConditions from '../components/LegalPages/TermsAndConditions';
import PrivacyPolicy from '../components/LegalPages/PrivacyPolicy';
import RefundPolicy from '../components/LegalPages/RefundPolicy';
import AdminChat from '../components/AdminChat/AdminChat';
import SecurityTips from '../components/LegalPages/SecurityTips';
import AEPSReport from '../components/WalletPages/AEPSReport';
import MainWallet from '../components/WalletPages/MainWallet';
import WalletSummary from '../components/WalletPages/WalletSummary';
import FundTransferReport from '../components/WalletPages/FundTransferReport';
import MainWalletReport from '../components/WalletPages/MainWalletReport';
import WalletTXN from '../components/WalletPages/WalletTXN';
import AEPSWalletReport from '../components/WalletPages/AEPSWalletReport';
import DownLineBalance from '../components/WalletPages/DownLineBalance';
import ListAPI from '../components/RechargeSettings/ListAPI';
import APIBalance from '../components/RechargeSettings/APIBalance';

import SwitchSystem from '../components/RechargeSettings/SwitchSystem';
import AddAPI from '../components/RechargeSettings/AddAPI';
import ManageCompany from '../components/SettingsPages/ManageCompany';
import PackageManagement from '../components/SettingsPages/PackageManagement';
import RoleManagement from '../components/SettingsPages/RoleManagement';
import AssignPackage from '../components/SettingsPages/AssignPackage';
import ServiceManagement from '../components/SettingsPages/ServiceManagement';
import AssignService from '../components/SettingsPages/AssignService';
import BannerManagement from '../components/SettingsPages/BannerManagement';
import OperatorManagement from '../components/SettingsPages/OperatorManagement';
import PermissionSetting from '../components/SettingsPages/PermissionSetting';
import DesignService from '../components/SettingsPages/DesignService';
import RoleChange from '../components/SettingsPages/RoleChange';
import AssignRole from '../components/SettingsPages/AssignRole';
import EmpLoginSecurity from '../components/SettingsPages/EmpLoginSecurity';
import ParentChange from '../components/SettingsPages/ParentChange';
import ManageNews from '../components/SettingsPages/ManageNews';
import AssignServiceRole from '../components/SettingsPages/AssignServiceRole';
import OnOffServices from '../components/SettingsPages/OnOffServices';
import ListOperator from '../components/SettingsPages/ListOperator';
import CheckTXN from '../components/SettingsPages/CheckTXN';
import EmployeeLoginList from '../components/SettingsPages/EmployeeLoginList';
import SMSCategory from '../components/SettingsPages/SMSCategory';
import SMSTemplate from '../components/SettingsPages/SMSTemplate';
import SMSIntegration from '../components/SettingsPages/SMSIntegration';
import ManageSMSTemplate from '../components/SettingsPages/ManageSMSTemplate';
import AEPSHistory from '../components/ReportPages/AEPSHistory';
import DMTHistory from '../components/ReportPages/DMTHistory';
import PayoutHistory from '../components/ReportPages/PayoutHistory';
import MATMHistory from '../components/ReportPages/MATMHistory';
import RechargeHistory from '../components/ReportPages/RechargeHistory';
import BBPSTransaction from '../components/ReportPages/BBPSTransaction';
import CCBillPayHistory from '../components/ReportPages/CCBillPayHistory';
import UPITransferHistory from '../components/ReportPages/UPITransferHistory';
import DisputeRecharge from '../components/ReportPages/DisputeRecharge';
import QueuedRecharge from '../components/ReportPages/QueuedRecharge';
import BusinessSummary from '../components/ReportPages/BusinessSummary';
import EarningCommission from '../components/ReportPages/EarningCommission';
import NSDLHistory from '../components/ReportPages/NSDLHistory';
import UpgradePopup from '../../member/components/MemberPanel/UpgradePopup';
import { BarChart, Bar } from 'recharts';
import DMTPPIHistory from '../components/ReportPages/DMTPPIHistory';
import MoneyRemitterDetails from '../components/ReportPages/MoneyRemitterDetails';
import MoneyWalletLoadHistory from '../components/ReportPages/MoneyWalletLoadHistory';
import WalletPPIRegistration from '../components/ReportPages/WalletPPIRegistration';
import QuickSearch from '../components/ReportPages/QuickSearch';
import TDSReport from '../components/ReportPages/TDSReport';
import MemberControlPage from '../components/MemberPages/MemberControlPage';
import { updateMemberDirect } from '../../store/slices/memberSlice';
import Admin from '../components/MemberPages/Admin';
import MasterDistributor from '../components/MemberPages/MasterDistributor';
import Distributor from '../components/MemberPages/Distributor';
import Retailer from '../components/MemberPages/Retailer';
import ApiUser from '../components/MemberPages/ApiUser';
import Unique from '../components/MemberPages/Unique';
import PipeMasterNew from '../../member/components/MemberPanel/Pipe/PipeMasterNew';
import PipeModuleSettings from '../../member/components/MemberPanel/Pipe/PipeModuleSettings';
import styles from './DashboardPage.module.css';

// --- DATA ---
const SIDEBAR_LINKS = [
  { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
  { 
    id: 'complain', 
    label: 'Complain/Support', 
    icon: FaHeadset,
    subLinks: [
      { id: 'complain_list', label: 'Complain List' },
      { id: 'add_support', label: 'Add Support' },
      { id: 'support_main', label: 'Support' }
    ]
  },
  { 
    id: 'balance', 
    label: 'Balance', 
    icon: FaBalanceScale,
    subLinks: [
      { id: 'hold_amount', label: 'Hold Amount' },
      { id: 'company_bank', label: 'Company Bank Details' },
      { id: 'add_bank', label: 'Add Bank' },
      { id: 'member_bank_details', label: 'Member Bank Details' },
      { id: 'fund_request', label: 'Fund Request' },
      { id: 'transfer', label: 'Transfer' }
    ]
  },
  { 
    id: 'member', 
    label: 'Member Management', 
    icon: FaUserTie,
    subLinks: [
      // { id: 'staff_reg', label: 'Staff Registration' },
      // { id: 'staff_list', label: 'Staff List' },
      { id: 'set_password', label: 'Set Member Password' },
      { id: 'set_tpin', label: 'Set Member T-Pin' },
      { id: 'login_security', label: 'Login Security' },
      { id: 'credit_limit', label: 'Credit Limit' },
      // { id: 'registration_main', label: 'Registration' },
      { id: 'manage_member', label: 'Manage Member' },
      { id: 'assign_tid', label: 'Assign TID' }
    ]
  },
  { 
    id: 'commission', 
    label: 'Commission Setup', 
    icon: FaPercent,
    subLinks: [
      { id: 'commission_setup', label: 'Commission' },
      { id: 'api_commission_range', label: 'API Commission' }
    ]
  },
  { 
    id: 'kyc', 
    label: 'KYC', 
    icon: FaIdCard,
    subLinks: [
      { id: 'kyc_master', label: 'KYC Master' },
      { id: 'upload_kyc', label: 'Upload Member KYC' },
      { id: 'kyc_details', label: 'Kyc Details' }
    ]
  },
  { 
    id: 'report', 
    label: 'All Report', 
    icon: FaFileAlt,
    subLinks: [
      { id: 'aeps_history', label: 'AEPS History' },
      { id: 'dmt_history', label: 'DMT History' },
      { id: 'payout_history', label: 'Payout History' },
      { id: 'matm_history', label: 'MATM History' },
      { id: 'recharge_history', label: 'Recharge History' },
      { id: 'bbps_history', label: 'BBPS History' },
      { id: 'cc_bill_pay_history', label: 'CC Bill Pay History' },
      { id: 'upi_history', label: 'UPI History' },
      { id: 'dispute_recharge_report', label: 'Dispute Recharge Report' },
      { id: 'queued_recharge', label: 'Queued Recharge' },
      { id: 'business_summary', label: 'Business Summary' },
      { id: 'earning_commission', label: 'Earning Commission' },
      { id: 'nsdl_history', label: 'NSDL History' },
      { id: 'dmt_ppi_history', label: 'DMT PPI History' },
      { id: 'money_remitter_details', label: 'Money Remitter Details' },
      { id: 'money_wallet_load_history', label: 'Money Wallet Load History' },
      { id: 'wallet_ppi_registration', label: 'Wallet PPI Registration' },
      { id: 'quick_search', label: 'Quick Search' },
      { id: 'tds_report', label: 'TDS Report' }
    ]
  },
  { 
    id: 'legal', 
    label: 'Legal Document', 
    icon: FaGavel,
    subLinks: [
      { id: 'term_condition', label: 'Term & Condition' },
      { id: 'privacy_policy', label: 'Privacy Policy' },
      { id: 'refund_policy', label: 'Refund Policy' },
      { id: 'security_tips', label: 'Security Tips' }
    ]
  },
  { 
    id: 'wallet', 
    label: 'Wallet Report', 
    icon: FaWallet,
    subLinks: [
      { id: 'aeps_report', label: 'AEPS' },
      { id: 'main_wallet', label: 'Main Wallet' },
      { id: 'wallet_summary', label: 'Wallet Summary' },
      { id: 'fund_transfer_report', label: 'Fund Transfer Report' },
      { id: 'main_wallet_report', label: 'Main Wallet Report' },
      { id: 'wallet_txn', label: 'Wallet TXN' },
      { id: 'aeps_wallet_report', label: 'AEPS Wallet Report' },
      { id: 'downline_balance', label: 'DownLineBalance' }
    ]
  },
  { 
    id: 'recharge', 
    label: 'Recharge Setting', 
    icon: FaMobileAlt,
    subLinks: [
      { id: 'list_api', label: 'List API' },
      { id: 'api_balance', label: 'API Balance' },
      { id: 'add_api', label: 'Add API' },
      { id: 'switch_system', label: 'Switch System' }
    ]
  },
  { 
    id: 'setting', 
    label: 'Setting', 
    icon: FaCog,
    subLinks: [
      { id: 'manage_company', label: 'Manage Company' },
      { id: 'package', label: 'Package' },
      { id: 'role', label: 'Role' },
      { id: 'assign_package', label: 'Assign Package' },
      { id: 'services', label: 'Services' },
      { id: 'upload_banner', label: 'Upload Banner' },
      { id: 'manage_operator', label: 'Manage Operator' },
      { id: 'permission_setting', label: 'Permission Setting' },
      { id: 'design_service', label: 'Design Service' },
      { id: 'change_role', label: 'Change Role' },
      { id: 'assign_role', label: 'Assign Role' },
      { id: 'emp_login_security', label: 'Emp Login Security' },
      { id: 'parent_change', label: 'Parent Change' },
      { id: 'manage_news', label: 'Manage News' },
      { id: 'assign_service', label: 'Assign Service' },
      // { id: 'assign_service_role', label: 'Assign Service On Role' },
      { id: 'check_txn', label: 'Check TXN' },
      { id: 'employee_login_list', label: 'Employee Login List' }
    ]
  },
  { 
    id: 'sms', 
    label: 'SMS Setting', 
    icon: FaSms,
    subLinks: [
      { id: 'sms_category', label: 'SMS Category' },
      { id: 'sms_template', label: 'SMS Template' },
      { id: 'sms_integration', label: 'SMS Integration' },
      { id: 'manage_sms_template', label: 'Manage Sms Template' }
    ]
  },
  { 
    id: 'pipe', 
    label: 'PIPE', 
    icon: FaProjectDiagram,
    subLinks: [
      { id: 'pipe_master_new', label: 'Pipe Master New' },
      { id: 'pipe_module_settings', label: 'Pipe Module Settings' }
    ]
  },
];

const ACTION_ICONS = [
  { icon: FaMobileAlt, label: 'Mobile', color: '#1756AA', bg: 'rgba(23,86,170,0.1)' },
  { icon: FaFingerprint, label: 'AEPS', color: '#E53E3E', bg: 'rgba(229,62,62,0.1)' },
  { icon: FaMoneyBillWave, label: 'Money', color: '#27AE60', bg: 'rgba(39,174,96,0.1)' },
  { icon: FaUsers, label: 'Users', color: '#EAA21F', bg: 'rgba(234,162,31,0.1)' },
  { icon: FaExchangeAlt, label: 'Transfer', color: '#805AD5', bg: 'rgba(128,90,213,0.1)' },
  { icon: FaRupeeSign, label: 'Payout', color: '#319795', bg: 'rgba(49,151,149,0.1)' },
  { icon: FaTimesCircle, label: 'Dispute', color: '#D53F8C', bg: 'rgba(213,63,140,0.1)' },
  { icon: FaUsersCog, label: 'Staff', color: '#2B6CB0', bg: 'rgba(43,108,176,0.1)' },
  { icon: FaUserPlus, label: 'Add Member', color: '#2F855A', bg: 'rgba(47,133,90,0.1)' },
  { icon: FaUserCircle, label: 'Profile', color: '#4A5568', bg: 'rgba(74,85,104,0.1)' },
];

const DASHBOARD_CARDS = [
  { id: 1, title: 'E-Wallet Summary', icon: FaWallet, color: 'green', badge: null, max: '0.00' },
  { id: 2, title: 'Balance Transfer', icon: FaExchangeAlt, color: 'green', badge: null, max: '0.00' },
  { id: 3, title: 'Registration', icon: FaUserPlus, color: 'red', badge: null, max: '0.00' },
  { id: 4, title: 'Todays DMT', icon: FaMoneyBillWave, color: 'blue', badge: { label: 'Sur', value: '0.0000', type: 'orange' }, max: '0.00' },
  { id: 5, title: 'Total Recharge', icon: FaMobileAlt, color: 'green', badge: { label: 'Comm', value: '0.00', type: 'green' }, max: '0.00' },
  { id: 6, title: 'Total AEPS', icon: FaFingerprint, color: 'red', badge: { label: 'Comm', value: '0.00', type: 'green' }, max: '0.00' },
  { id: 7, title: 'Total Payout', icon: FaMoneyCheckAlt, color: 'yellow', badge: { label: 'Charge', value: '0.00', type: 'red' }, max: '0.00' },
  { id: 8, title: 'Todays MATM', icon: FaCreditCard, color: 'blue', badge: { label: 'Comm', value: '0.00', type: 'green' }, max: '0.00' },
  { id: 9, title: 'Total Aadharpay', icon: FaIdCard, color: 'green', badge: { label: 'Surcharge', value: '0.00', type: 'red' }, max: '0.00' },
  { id: 10, title: 'Total UPI', icon: FaQrcode, color: 'red', badge: { label: 'Charge', value: '0', type: 'red' }, max: '0.00' },
  { id: 11, title: 'Total Water', icon: FiDroplet, color: 'blue', badge: { label: 'Max', value: '0.00', type: 'red' }, max: '0.00' },
  { id: 12, title: 'Total Fund Request', icon: FaHandHoldingUsd, color: 'yellow', badge: { label: 'Max', value: '0.00', type: 'red' }, max: '0.00' },
  { id: 13, title: 'UPI Transfer', icon: FaPaperPlane, color: 'yellow', badge: { label: 'Charge', value: '0.00', type: 'red' }, max: '0.00' },
  { id: 14, title: 'UPI Cashout', icon: FaMoneyBill, color: 'yellow', badge: { label: 'Charge', value: '0.00', type: 'red' }, max: '0.00' },
  { id: 15, title: 'Credit Card', icon: FaCreditCard, color: 'yellow', badge: { label: 'Charge', value: '0.00', type: 'red' }, max: '0.00' },
  { id: 16, title: 'DMT PPI', icon: FaChartPie, color: 'yellow', badge: { label: 'Charge', value: '0.00', type: 'red' }, max: '0.00' },
];

const CHART_DATA = [
  { date: 'May 01', amount: 12500 },
  { date: 'May 05', amount: 18200 },
  { date: 'May 10', amount: 14800 },
  { date: 'May 15', amount: 26000 },
  { date: 'May 20', amount: 21500 },
  { date: 'May 25', amount: 34000 },
  { date: 'May 30', amount: 41200 },
];

const DONUT_DATA = [
  { name: 'AEPS', value: 45000 },
  { name: 'DMT', value: 30000 },
  { name: 'Recharge', value: 15000 },
  { name: 'Payout', value: 20000 },
];

const DONUT_COLORS = ['#1756AA', '#EAA21F', '#27AE60', '#E53E3E'];

const STAT_CARDS = [
  { id: 1, title: 'Total Transactions', value: '₹ 0.00', icon: FaExchangeAlt, color: 'blue' },
  { id: 2, title: 'Total Commission', value: '₹ 0.00', icon: FaPercent, color: 'green' },
  { id: 3, title: 'Total Charges', value: '₹ 0.00', icon: FaFileAlt, color: 'red' },
  { id: 4, title: 'Net Flow', value: '₹ 0.00', icon: FaChartPie, color: 'yellow' },
];

const RECENT_TXNS = [
  { id: '1', txnId: 'TXN8472', date: '2026-05-01 10:30', service: 'AEPS', memberId: 'MEM8472', amount: '5000.00', commission: '15.00', status: 'Success', change: '+5000' },
  { id: '2', txnId: 'TXN8473', date: '2026-05-01 11:15', service: 'DMT', memberId: 'MEM8473', amount: '2000.00', commission: '8.00', status: 'Pending', change: '-2000' },
  { id: '3', txnId: 'TXN8474', date: '2026-05-01 11:45', service: 'Recharge', memberId: 'MEM8474', amount: '399.00', commission: '5.00', status: 'Failed', change: '0' },
  { id: '4', txnId: 'TXN8475', date: '2026-05-01 12:00', service: 'Payout', memberId: 'MEM8475', amount: '10000.00', commission: '0.00', status: 'Success', change: '-10000' },
  { id: '5', txnId: 'TXN8476', date: '2026-05-01 12:10', service: 'UPI', memberId: 'MEM8476', amount: '1500.00', commission: '2.00', status: 'Success', change: '+1500' },
];

const ServiceRow = ({ card, index }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(Math.floor(Math.random() * 40) + 10), 100 + index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className={styles.serviceRow} style={{ animationDelay: `${index * 0.05}s` }}>
      <div className={styles.serviceRowContent}>
        <div className={styles.serviceRowLeft}>
          <card.icon className={`${styles.serviceIcon} ${styles[`icon_${card.color}`]}`} />
          <span className={styles.serviceName}>{card.title}</span>
        </div>
        <div className={styles.serviceRowRight}>
          {card.badge && (
            <span className={`${styles.serviceBadge} ${styles[`badge_${card.badge.type}`]}`}>
              {card.badge.label}: {card.badge.value}
            </span>
          )}
          <span className={styles.serviceMax}>MAX: {card.max}</span>
        </div>
      </div>
      <div className={styles.serviceProgressTrack}>
        <div 
          className={`${styles.serviceProgressBar} ${styles[`progress_${card.color}`]}`} 
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Emergency Freeze Switch
  const [isSystemFrozen, setIsSystemFrozen] = useState(() => {
    return localStorage.getItem('bss_system_frozen') === 'true';
  });
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezePassword, setFreezePassword] = useState('');
  const [freezeModalError, setFreezeModalError] = useState('');
  const [freezeMessage, setFreezeMessage] = useState('⚠️ SYSTEM NOTICE: All transactions and wallet transfers are temporarily suspended by the Admin for security.');

  const handleFreezeToggleClick = () => {
    setFreezePassword('');
    setFreezeModalError('');
    setShowFreezeModal(true);
  };

  const handleConfirmFreeze = (e) => {
    e.preventDefault();
    if (freezePassword === '1234') {
      const nextState = !isSystemFrozen;
      localStorage.setItem('bss_system_frozen', String(nextState));
      if (nextState) {
        localStorage.setItem('bss_system_freeze_message', freezeMessage || '⚠️ SYSTEM NOTICE: All transactions and wallet transfers are temporarily suspended by the Admin for security.');
      } else {
        localStorage.removeItem('bss_system_freeze_message');
      }
      window.dispatchEvent(new Event('system_freeze_updated')); // Notify other components in the same window
      
      setIsSystemFrozen(nextState);
      setShowFreezeModal(false);
      setFreezePassword('');
      dispatch(setNotification({
        type: nextState ? 'error' : 'success',
        message: nextState ? '⚠️ EMERGENCY FREEZE ACTIVE: All services disabled!' : '✅ EMERGENCY FREEZE REMOVED: Services activated.'
      }));
    } else {
      setFreezeModalError('Incorrect security password.');
    }
  };
  const { isSidebarOpen, isQuickActionsOpen, selectedDate, wallets, memberCounts, hoveredMenu, isMemberDropdownOpen } = useSelector((s) => s.dashboard);
  const actionPanelRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const memberDropdownRef = useRef(null);
  const contentRef = useRef(null);

  const { tab } = useParams();
  const [activeTab, setActiveTabState] = useState(tab || 'dashboard');

  const setActiveTab = useCallback((newTab) => {
    setActiveTabState(newTab);
    const search = location.search;
    if (newTab === 'dashboard') {
      navigate(`/admin/dashboard${search}`);
    } else {
      navigate(`/admin/dashboard/${newTab}${search}`);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (tab) {
      setActiveTabState(tab);
    } else {
      setActiveTabState('dashboard');
    }
  }, [tab]);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, isUpward: false });
  
  const [isChartFilterOpen, setIsChartFilterOpen] = useState(false);
  const [selectedChartFilter, setSelectedChartFilter] = useState('Last 7 Days');
  const [adminChartView, setAdminChartView] = useState('revenue'); // 'revenue' or 'health'
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const { manageMemberState } = useSelector((s) => s.member);
  const memberList = useMemo(() => manageMemberState?.list || [], [manageMemberState?.list]);

  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Header Search
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [showAdminSearchResults, setShowAdminSearchResults] = useState(false);
  const adminSearchRef = useRef(null);

  const adminSearchItems = useMemo(() => {
    const items = [{ name: 'Dashboard', path: 'dashboard' }];
    SIDEBAR_LINKS.forEach(link => {
      if (link.id !== 'dashboard' && !link.subLinks) {
        items.push({ name: link.label, path: link.id });
      } else if (link.subLinks) {
        link.subLinks.forEach(sub => {
          items.push({ name: `${link.label} > ${sub.label}`, path: sub.id, shortName: sub.label });
        });
      }
    });
    return items;
  }, []);

  const filteredAdminSearchItems = adminSearchItems.filter(item => 
    item.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
    (item.shortName && item.shortName.toLowerCase().includes(adminSearchQuery.toLowerCase()))
  );

  const activeMemberData = useMemo(() => {
    if (!selectedMember) return null;
    return memberList.find(m => m.id === selectedMember.id) || selectedMember;
  }, [selectedMember, memberList]);

  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingMember, setIsSearchingMember] = useState(false);

  useEffect(() => {
    if (memberSearchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    console.log("DashboardPage: Triggering member search for query:", memberSearchQuery);
    const timer = setTimeout(async () => {
      setIsSearchingMember(true);
      const query = memberSearchQuery.toLowerCase().trim();
      try {
        console.log("DashboardPage: Calling API.member.search for query:", memberSearchQuery);
        const results = await API.member.search(memberSearchQuery.trim());
        console.log("DashboardPage: Search results returned:", results);
        
        // Filter local memberList case-insensitively
        const localMatches = memberList.filter(m => 
          (m.name && m.name.toLowerCase().includes(query)) ||
          (m.memberId && m.memberId.toLowerCase().includes(query)) ||
          (m.mobile && m.mobile.toLowerCase().includes(query)) ||
          (m.email && m.email.toLowerCase().includes(query)) ||
          (m.shopName && m.shopName.toLowerCase().includes(query))
        );

        // Merge API results with local matches, avoiding duplicates by id or memberId
        const merged = [...(results || [])];
        localMatches.forEach(lm => {
          const alreadyExists = merged.some(m => 
            String(m.id) === String(lm.id) || 
            (m.memberId && lm.memberId && String(m.memberId).toLowerCase() === String(lm.memberId).toLowerCase())
          );
          if (!alreadyExists) {
            merged.push(lm);
          }
        });

        // Ensure all suggestions match the query case-insensitively for maximum relevance
        const filteredSuggestions = merged.filter(m => 
          (m.name && m.name.toLowerCase().includes(query)) ||
          (m.memberId && m.memberId.toLowerCase().includes(query)) ||
          (m.mobile && m.mobile.toLowerCase().includes(query)) ||
          (m.email && m.email.toLowerCase().includes(query)) ||
          (m.shopName && m.shopName.toLowerCase().includes(query))
        );

        setSuggestions(filteredSuggestions);
      } catch (err) {
        console.error("DashboardPage: Member Search Error:", err);
        // Fallback to local filter
        const localMatches = memberList.filter(m => 
          (m.name && m.name.toLowerCase().includes(query)) ||
          (m.memberId && m.memberId.toLowerCase().includes(query)) ||
          (m.mobile && m.mobile.toLowerCase().includes(query)) ||
          (m.email && m.email.toLowerCase().includes(query)) ||
          (m.shopName && m.shopName.toLowerCase().includes(query))
        );
        setSuggestions(localMatches);
      } finally {
        setIsSearchingMember(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [memberSearchQuery, memberList]);

  const chartFilterOptions = ['Today', '7 Days', '1 Month', '3 Months', '6 Months', '1 Year', 'All Time'];

  const serviceHealthData = useMemo(() => {
    let multiplier = 1;
    if (selectedChartFilter === '7 Days') multiplier = 7;
    if (selectedChartFilter === '1 Month') multiplier = 30;
    if (selectedChartFilter === '3 Months') multiplier = 90;
    if (selectedChartFilter === '6 Months') multiplier = 180;
    if (selectedChartFilter === '1 Year') multiplier = 365;
    if (selectedChartFilter === 'All Time') multiplier = 1000;

    return [
      { name: 'AEPS', success: Math.floor(4000 * multiplier * (Math.random() * 0.4 + 0.8)), failed: Math.floor(400 * multiplier) },
      { name: 'DMT', success: Math.floor(3000 * multiplier * (Math.random() * 0.4 + 0.8)), failed: Math.floor(200 * multiplier) },
      { name: 'Recharge', success: Math.floor(2000 * multiplier * (Math.random() * 0.4 + 0.8)), failed: Math.floor(100 * multiplier) },
      { name: 'Payout', success: Math.floor(2780 * multiplier * (Math.random() * 0.4 + 0.8)), failed: Math.floor(500 * multiplier) },
      { name: 'UPI', success: Math.floor(1890 * multiplier * (Math.random() * 0.4 + 0.8)), failed: Math.floor(50 * multiplier) },
    ];
  }, [selectedChartFilter]);

  const revenueProfitData = useMemo(() => {
    let data = [];
    if (selectedChartFilter === 'Today') {
      data = ['08:00', '12:00', '16:00', '20:00', '23:59'].map(t => ({
        date: t, revenue: Math.floor(Math.random() * 5000) + 1000, profit: Math.floor(Math.random() * 500) + 100
      }));
    } else if (selectedChartFilter === '7 Days') {
      data = ['08', '09', '10', '11', '12', '13', '14'].map(d => ({
        date: `May ${d}`, revenue: Math.floor(Math.random() * 5000) + 2000, profit: Math.floor(Math.random() * 600) + 200
      }));
    } else if (selectedChartFilter === '1 Month') {
      data = ['W1', 'W2', 'W3', 'W4'].map(w => ({
        date: w, revenue: Math.floor(Math.random() * 25000) + 15000, profit: Math.floor(Math.random() * 3000) + 1500
      }));
    } else if (selectedChartFilter === '3 Months') {
      data = ['Mar', 'Apr', 'May'].map(m => ({
        date: m, revenue: Math.floor(Math.random() * 80000) + 50000, profit: Math.floor(Math.random() * 9000) + 5000
      }));
    } else if (selectedChartFilter === '6 Months') {
      data = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => ({
        date: m, revenue: Math.floor(Math.random() * 150000) + 100000, profit: Math.floor(Math.random() * 18000) + 10000
      }));
    } else if (selectedChartFilter === '1 Year') {
      data = ['Q1', 'Q2', 'Q3', 'Q4'].map(q => ({
        date: q, revenue: Math.floor(Math.random() * 400000) + 250000, profit: Math.floor(Math.random() * 45000) + 25000
      }));
    } else {
      data = ['2023', '2024', '2025', '2026'].map(y => ({
        date: y, revenue: Math.floor(Math.random() * 1000000) + 800000, profit: Math.floor(Math.random() * 120000) + 80000
      }));
    }
    return data;
  }, [selectedChartFilter]);

  const formatYAxis = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value;
  };

  const chartFilterRef = useRef(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionPanelRef.current && !actionPanelRef.current.contains(event.target)) {
        dispatch(setQuickActionsOpen(false));
      }
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target)) {
        dispatch(setIsMemberDropdownOpen(false));
      }
      if (chartFilterRef.current && !chartFilterRef.current.contains(event.target)) {
        setIsChartFilterOpen(false);
      }
      if (adminSearchRef.current && !adminSearchRef.current.contains(event.target)) {
        setShowAdminSearchResults(false);
      }
    };

    // Close sidebar on mobile/tablet mount
    if (window.innerWidth <= 1024) {
      dispatch(setSidebarOpen(false));
    }

    if (isQuickActionsOpen || isMemberDropdownOpen || isChartFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isQuickActionsOpen, isMemberDropdownOpen, isChartFilterOpen, dispatch]);

  // Sync Status query parameter from URL to load Recharge History
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('Status')) {
      setActiveTab('recharge_history');
    }
  }, [location.search, setActiveTab]);

  // Dynamic Browser Tab Title Update for all active pages/tabs
  useEffect(() => {
    let pageLabel = 'Dashboard';
    if (activeTab !== 'dashboard') {
      for (const link of SIDEBAR_LINKS) {
        if (link.id === activeTab) {
          pageLabel = link.label;
          break;
        }
        if (link.subLinks) {
          const sub = link.subLinks.find(s => s.id === activeTab);
          if (sub) {
            pageLabel = sub.label;
            break;
          }
        }
      }
      if (activeTab === 'admin_view') pageLabel = 'Admin Users';
      else if (activeTab === 'master_distributor_view') pageLabel = 'Master Distributors';
      else if (activeTab === 'distributor_view') pageLabel = 'Distributors';
      else if (activeTab === 'retailer_view') pageLabel = 'Retailers';
      else if (activeTab === 'api_user_view') pageLabel = 'API Users';
      else if (activeTab === 'unique_view') pageLabel = 'Unique Users';
    }
    document.title = `${pageLabel} | ${SITE_CONFIG.shortName}`;
  }, [activeTab]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    clearSession();
    navigate('/admin/login');
  };

  const handleMenuClick = (link) => {
    navigate(location.pathname);
    if (link.subLinks) {
      setExpandedMenu(expandedMenu === link.id ? null : link.id);
      if (!isSidebarOpen) dispatch(setSidebarOpen(true));
    } else {
      setActiveTab(link.id);
      setExpandedMenu(null);
      if (window.innerWidth <= 800) dispatch(setSidebarOpen(false));
      if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubMenuClick = (e, subId) => {
    e.stopPropagation();
    navigate(location.pathname);
    setActiveTab(subId);
    dispatch(setHoveredMenu(null));
    if (window.innerWidth <= 800) dispatch(setSidebarOpen(false));
    if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickActionClick = (label) => {
    dispatch(setQuickActionsOpen(false));
    if (label === 'Mobile') {
      navigate('/admin/dashboard/recharge_history?Status=Pending');
      if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (label === 'AEPS') {
      navigate('/admin/dashboard/aeps_history?Status=Pending');
      if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (label === 'Money') {
      navigate('/admin/dashboard/dmt_history?Status=Pending');
      if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (label === 'Payout') {
      navigate('/admin/dashboard/payout_history?Status=Pending');
      if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (label === 'Transfer') {
      navigate('/admin/dashboard/transfer');
      if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (label === 'Dispute') {
      navigate('/admin/dashboard/dispute_recharge_report');
      if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (label === 'Staff') {
      navigate('/admin/dashboard/staff_list');
      if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (label === 'Add Member') {
      navigate('/admin/dashboard/registration_main');
      if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (label === 'Profile') {
      navigate('/admin/dashboard/login_security');
      if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMouseEnter = (e, link) => {
    if (isSidebarOpen || !link.subLinks) return;
    
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Check if near bottom
    const isUpward = rect.top + 300 > windowHeight; // 300px estimated max height of popup
    
    setHoverPosition({
      top: isUpward ? rect.bottom : rect.top,
      isUpward,
    });
    
    dispatch(setHoveredMenu(link.id));
  };

  const handleMouseLeave = () => {
    if (isSidebarOpen) return;
    hoverTimeoutRef.current = setTimeout(() => {
      dispatch(setHoveredMenu(null));
    }, 150); // slight delay to allow moving mouse to popup
  };

  const handlePopupMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const hoveredLinkData = !isSidebarOpen && hoveredMenu ? SIDEBAR_LINKS.find(l => l.id === hoveredMenu) : null;

  return (
    <div className={styles.layout}>
      {/* Mobile Overlay */}
      <div 
        className={`${styles.sidebarOverlay} ${isSidebarOpen && window.innerWidth <= 800 ? styles.overlayActive : ''}`}
        onClick={() => dispatch(setSidebarOpen(false))}
      ></div>

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.hamburger} onClick={() => dispatch(toggleSidebar())}>
            <FaBars />
          </button>
          <button 
            className={styles.desktopToggleBtn} 
            onClick={() => dispatch(toggleSidebar())}
          >
            {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
          </button>
          <img src={SITE_CONFIG.logo} alt="Logo" className={styles.headerLogo} />
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.searchBar} ref={adminSearchRef}>
            <FaSearch className={styles.searchIcon} />
            <input 
              type="text" 
              name="admin_search_box"
              autoComplete="off"
              placeholder="Search for services, reports..." 
              className={styles.searchInput} 
              value={adminSearchQuery}
              onChange={(e) => {
                setAdminSearchQuery(e.target.value);
                setShowAdminSearchResults(true);
              }}
              onFocus={() => setShowAdminSearchResults(true)}
            />
            {showAdminSearchResults && adminSearchQuery && (
              <div className={styles.adminSearchDropdown}>
                {filteredAdminSearchItems.length > 0 ? (
                  filteredAdminSearchItems.map((item, index) => (
                    <div 
                      key={index} 
                      className={styles.adminSearchResultItem}
                      onClick={() => {
                        setActiveTab(item.path);
                        setShowAdminSearchResults(false);
                        setAdminSearchQuery('');
                      }}
                    >
                      <FaSearch style={{ color: '#A0AEC0', marginRight: '10px' }} />
                      <span style={{ fontSize: '0.85rem', color: '#0D1B3E', fontWeight: 500 }}>{item.name}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '15px', textAlign: 'center', color: '#718096', fontSize: '0.85rem' }}>
                    No results found for "{adminSearchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={`${styles.headerWallets} admin-header-wallets`}>
            <div className={styles.walletPill}>
              <span className={styles.walletIconWrap} style={{ color: '#27AE60', background: 'rgba(39,174,96,0.1)' }}>
                <FaWallet />
              </span>
              <div className={styles.walletInfo}>
                <span className={styles.walletLabel}>AEPS Wallet</span>
                <span className={styles.walletAmount}>{wallets.aeps.toFixed(2)}</span>
              </div>
            </div>
            <div className={styles.walletPill}>
              <span className={styles.walletIconWrap} style={{ color: '#1756AA', background: 'rgba(23,86,170,0.1)' }}>
                <FaWallet />
              </span>
              <div className={styles.walletInfo}>
                <span className={styles.walletLabel}>Main Wallet</span>
                <span className={styles.walletAmount}>{wallets.main.toFixed(2)}</span>
              </div>
            </div>
            <div className={styles.walletPill}>
              <span className={styles.walletIconWrap} style={{ color: '#EAA21F', background: 'rgba(234,162,31,0.1)' }}>
                <FaWallet />
              </span>
              <div className={styles.walletInfo}>
                <span className={styles.walletLabel}>Profit Wallet</span>
                <span className={styles.walletAmount}>{wallets.profit.toFixed(2)}</span>
              </div>
            </div>
          </div>
          {/* Kill Switch (Emergency Freeze) */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: isSystemFrozen ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${isSystemFrozen ? '#EF4444' : '#10B981'}`,
              cursor: 'pointer',
              userSelect: 'none',
              marginRight: '15px'
            }}
            onClick={handleFreezeToggleClick}
            title={isSystemFrozen ? 'System is Frozen! Click to Activate Services.' : 'Emergency Kill Switch: Click to Freeze All Services.'}
          >
            <FaExclamationTriangle style={{ color: isSystemFrozen ? '#EF4444' : '#10B981', fontSize: '1rem' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isSystemFrozen ? '#EF4444' : '#10B981' }}>
              {isSystemFrozen ? 'SYSTEM FROZEN' : 'SYSTEM ACTIVE'}
            </span>
            <div style={{
              width: '32px',
              height: '18px',
              background: isSystemFrozen ? '#EF4444' : '#E2E8F0',
              borderRadius: '10px',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '14px',
                height: '14px',
                background: '#FFF',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: isSystemFrozen ? '16px' : '2px',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>

          <div className={styles.headerActions}>
            {/* Header Date Picker */}
            <div className={styles.datePillWrapHeader}>
              <FaCalendarAlt className={styles.dateIcon} />
              <input 
                type="date" 
                className={styles.datePickerHeader} 
                value={selectedDate}
                onChange={(e) => dispatch(setSelectedDate(e.target.value))}
              />
            </div>

            {/* Quick Actions Toggle */}
            <div className={styles.actionDropdownWrap} ref={actionPanelRef}>
              <button 
                className={`${styles.actionToggleBtn} ${isQuickActionsOpen ? styles.actionToggleActive : ''}`} 
                onClick={() => dispatch(toggleQuickActions())}
              >
                <FiGrid />
              </button>

              {/* Backdrop for Mobile */}
              {isQuickActionsOpen && (
                <div 
                  className={styles.actionBackdrop} 
                  onClick={() => dispatch(setQuickActionsOpen(false))}
                />
              )}

              {/* Quick Actions Panel */}
              {isQuickActionsOpen && (
                <div className={styles.actionPanel}>
                  <div className={styles.actionPanelHeader}>
                    <h3 className={styles.actionPanelTitle}>Quick Actions</h3>
                    <button 
                      className={styles.actionPanelClose} 
                      onClick={() => dispatch(setQuickActionsOpen(false))}
                    >
                      <FiX />
                    </button>
                  </div>
                  <div className={styles.actionGrid}>
                    {ACTION_ICONS.map((item, i) => (
                      <button key={i} className={styles.actionGridItem} onClick={() => handleQuickActionClick(item.label)}>
                        <div className={styles.actionIconContainer} style={{ backgroundColor: item.bg }}>
                          <item.icon className={styles.actionGridIcon} style={{ color: item.color }} />
                        </div>
                        <span className={styles.actionGridLabel}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>

      <div className={styles.mainContainer}>
        {/* ── SIDEBAR ── */}
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
          <nav className={styles.sidebarNav}>
            {SIDEBAR_LINKS.map((link) => {
              const isExpanded = expandedMenu === link.id;
              const isActive = activeTab === link.id || (link.subLinks && link.subLinks.some(s => s.id === activeTab));
              
              return (
                <div key={link.id} className={styles.menuItemWrap}>
                  <button 
                    className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''} ${isExpanded && !isActive ? styles.menuExpandedBg : ''}`}
                    onClick={() => handleMenuClick(link)}
                    onMouseEnter={(e) => handleMouseEnter(e, link)}
                    onMouseLeave={handleMouseLeave}
                    data-tooltip-right={!isSidebarOpen && !link.subLinks ? link.label : undefined}
                  >
                    <link.icon className={styles.sidebarIcon} />
                    <span className={styles.sidebarLabel}>{link.label}</span>
                    {isSidebarOpen && link.subLinks && (
                      <FaChevronRight className={`${styles.sidebarChevron} ${isExpanded ? styles.chevronOpen : ''}`} />
                    )}
                  </button>

                  {/* Submenu Drawer */}
                  {link.subLinks && (
                    <div className={`${styles.subMenuDrawer} ${isExpanded && isSidebarOpen ? styles.subMenuOpen : ''}`}>
                      {link.subLinks.map(sub => (
                        <button 
                          key={sub.id}
                          className={`${styles.subLink} ${activeTab === sub.id ? styles.subLinkActive : ''}`}
                          onClick={(e) => handleSubMenuClick(e, sub.id)}
                        >
                          <FaCircle className={styles.subIconDot} />
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Sidebar Bottom Spacer */}
            <div style={{ height: '100px', width: '100%' }}></div>
          </nav>
        </aside>

        {/* Hover Popup Menu (Collapsed Sidebar Only) */}
        {hoveredLinkData && (
          <div 
            className={`${styles.hoverPopup} ${hoverPosition.isUpward ? styles.hoverPopupUpward : ''}`}
            style={{ 
              top: hoverPosition.isUpward ? 'auto' : hoverPosition.top,
              bottom: hoverPosition.isUpward ? (window.innerHeight - hoverPosition.top) : 'auto'
            }}
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles.hoverPopupHeader}>
              {hoveredLinkData.label}
            </div>
            {hoveredLinkData.subLinks.map(sub => (
              <button
                key={sub.id}
                className={styles.hoverPopupItem}
                onClick={(e) => handleSubMenuClick(e, sub.id)}
              >
                <FaCircle className={styles.hoverPopupDot} />
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* ── MAIN CONTENT ── */}
        <main className={styles.content} ref={contentRef}>
          {activeTab === 'complain_list' ? (
            <SupportList />
          ) : activeTab === 'add_support' ? (
            <AddSupport />
          ) : activeTab === 'support_main' ? (
            <SupportMain />
          ) : activeTab === 'hold_amount' ? (
            <HoldAmount />
          ) : activeTab === 'company_bank' ? (
            <CompanyBank />
          ) : activeTab === 'add_bank' ? (
            <AddBank />
          ) : activeTab === 'member_bank_details' ? (
            <MemberBankDetails />
          ) : activeTab === 'fund_request' ? (
            <FundRequest />
          ) : activeTab === 'transfer' ? (
            <Transfer />
          ) : activeTab === 'staff_reg' ? (
            <StaffRegistration />
          ) : activeTab === 'staff_list' ? (
            <StaffList />
          ) : activeTab === 'set_password' ? (
            <ChangePassword />
          ) : activeTab === 'set_tpin' ? (
            <ChangeTPIN />
          ) : activeTab === 'login_security' ? (
            <MemberSecurity />
          ) : activeTab === 'credit_limit' ? (
            <CreditLimit />
          ) : activeTab === 'registration_main' ? (
            <MemberRegistration />
          ) : activeTab === 'manage_member' ? (
            <ManageMember />
          ) : activeTab === 'assign_tid' ? (
            <AssignTID />
          ) : activeTab === 'kyc_master' ? (
            <KYCDocuments />
          ) : activeTab === 'upload_kyc' ? (
            <UploadKYC />
          ) : activeTab === 'kyc_details' ? (
            <KYCDetails />
          ) : activeTab === 'commission_setup' ? (
            <SetCommission />
          ) : activeTab === 'api_commission_range' ? (
            <SetApiCommissionRange />
          ) : activeTab === 'term_condition' ? (
            <TermsAndConditions />
          ) : activeTab === 'privacy_policy' ? (
            <PrivacyPolicy />
          ) : activeTab === 'refund_policy' ? (
            <RefundPolicy />
          ) : activeTab === 'security_tips' ? (
            <SecurityTips />
          ) : activeTab === 'aeps_report' ? (
            <AEPSReport />
          ) : activeTab === 'main_wallet' ? (
            <MainWallet />
          ) : activeTab === 'wallet_summary' ? (
            <WalletSummary />
          ) : activeTab === 'fund_transfer_report' ? (
            <FundTransferReport />
          ) : activeTab === 'main_wallet_report' ? (
            <MainWalletReport />
          ) : activeTab === 'wallet_txn' ? (
            <WalletTXN />
          ) : activeTab === 'aeps_wallet_report' ? (
            <AEPSWalletReport />
          ) : activeTab === 'downline_balance' ? (
            <DownLineBalance />
          ) : activeTab === 'list_api' ? (
            <ListAPI />
          ) : activeTab === 'api_balance' ? (
            <APIBalance />
          ) : activeTab === 'add_api' ? (
            <AddAPI />
          ) : activeTab === 'switch_system' ? (
            <SwitchSystem />
          ) : activeTab === 'manage_company' ? (
            <ManageCompany />
          ) : activeTab === 'package' ? (
            <PackageManagement />
          ) : activeTab === 'role' ? (
            <RoleManagement />
          ) : activeTab === 'assign_package' ? (
            <AssignPackage />
          ) : activeTab === 'assign_service' ? (
            <AssignService />
          ) : activeTab === 'services' ? (
            <ServiceManagement />
          ) : activeTab === 'upload_banner' ? (
            <BannerManagement />
          ) : activeTab === 'manage_operator' ? (
            <OperatorManagement />
          ) : activeTab === 'permission_setting' ? (
            <PermissionSetting />
          ) : activeTab === 'design_service' ? (
            <DesignService />
          ) : activeTab === 'change_role' ? (
            <RoleChange />
          ) : activeTab === 'assign_role' ? (
            <AssignRole />
          ) : activeTab === 'emp_login_security' ? (
            <EmpLoginSecurity />
          ) : activeTab === 'parent_change' ? (
            <ParentChange />
          ) : activeTab === 'manage_news' ? (
            <ManageNews />
          ) : activeTab === 'assign_service_role' ? (
            <AssignServiceRole />
          ) : activeTab === 'on_off_services' ? (
            <OnOffServices />
          ) : activeTab === 'list_operator' ? (
            <ListOperator />
          ) : activeTab === 'check_txn' ? (
            <CheckTXN />
          ) : activeTab === 'employee_login_list' ? (
            <EmployeeLoginList />
          ) : activeTab === 'sms_category' ? (
            <SMSCategory />
          ) : activeTab === 'sms_template' ? (
            <SMSTemplate />
          ) : activeTab === 'sms_integration' ? (
            <SMSIntegration />
          ) : activeTab === 'manage_sms_template' ? (
            <ManageSMSTemplate />
          ) : activeTab === 'aeps_history' ? (
            <AEPSHistory />
          ) : activeTab === 'dmt_history' ? (
            <DMTHistory />
          ) : activeTab === 'payout_history' ? (
            <PayoutHistory />
          ) : activeTab === 'matm_history' ? (
            <MATMHistory />
          ) : activeTab === 'recharge_history' ? (
            <RechargeHistory />
          ) : activeTab === 'bbps_history' ? (
            <BBPSTransaction />
          ) : activeTab === 'cc_bill_pay_history' ? (
            <CCBillPayHistory />
          ) : activeTab === 'upi_history' ? (
            <UPITransferHistory />
          ) : activeTab === 'dispute_recharge_report' ? (
            <DisputeRecharge />
          ) : activeTab === 'queued_recharge' ? (
            <QueuedRecharge />
          ) : activeTab === 'business_summary' ? (
            <BusinessSummary />
          ) : activeTab === 'earning_commission' ? (
            <EarningCommission />
          ) : activeTab === 'nsdl_history' ? (
            <NSDLHistory />
          ) : activeTab === 'dmt_ppi_history' ? (
            <DMTPPIHistory />
          ) : activeTab === 'money_remitter_details' ? (
            <MoneyRemitterDetails />
          ) : activeTab === 'money_wallet_load_history' ? (
            <MoneyWalletLoadHistory />
          ) : activeTab === 'wallet_ppi_registration' ? (
            <WalletPPIRegistration />
          ) : activeTab === 'quick_search' ? (
            <QuickSearch />
          ) : activeTab === 'tds_report' ? (
            <TDSReport />
          ) : activeTab === 'pipe_master_new' ? (
            <PipeMasterNew />
          ) : activeTab === 'pipe_module_settings' ? (
            <PipeModuleSettings />
          ) : activeTab === 'admin_view' ? (
            <Admin onBack={() => setActiveTab('dashboard')} />
          ) : activeTab === 'master_distributor_view' ? (
            <MasterDistributor onBack={() => setActiveTab('dashboard')} />
          ) : activeTab === 'distributor_view' ? (
            <Distributor onBack={() => setActiveTab('dashboard')} />
          ) : activeTab === 'retailer_view' ? (
            <Retailer onBack={() => setActiveTab('dashboard')} />
          ) : activeTab === 'api_user_view' ? (
            <ApiUser onBack={() => setActiveTab('dashboard')} />
          ) : activeTab === 'unique_view' ? (
            <Unique onBack={() => setActiveTab('dashboard')} />
          ) : activeMemberData ? (
            <MemberControlPage 
              activeMemberData={activeMemberData} 
              onClose={() => setSelectedMember(null)} 
            />
          ) : (
            <>
              {/* Sub Header */}
              <div className={styles.subHeader}>
                <div className={styles.memberPillsRow}>
                  <span className={styles.countPill} onClick={() => setActiveTab('admin_view')} style={{ cursor: 'pointer' }}>Admin</span>
                  <span className={styles.countPill} onClick={() => setActiveTab('master_distributor_view')} style={{ cursor: 'pointer' }}>Master Distributor</span>
                  <span className={styles.countPill} onClick={() => setActiveTab('distributor_view')} style={{ cursor: 'pointer' }}>Distributor</span>
                  
                  <div className={styles.moreDropdownWrapper} ref={memberDropdownRef}>
                    <button 
                      className={styles.moreBtn} 
                      onClick={() => dispatch(setIsMemberDropdownOpen(!isMemberDropdownOpen))}
                    >
                      More {isMemberDropdownOpen ? <FaCaretUp /> : <FaCaretDown />}
                    </button>
                    
                    {isMemberDropdownOpen && (
                      <div className={styles.moreDropdown}>
                        <span className={styles.countPillDropdown} onClick={() => { setActiveTab('retailer_view'); dispatch(setIsMemberDropdownOpen(false)); }} style={{ cursor: 'pointer' }}>Retailer</span>
                        <span className={styles.countPillDropdown} onClick={() => { setActiveTab('api_user_view'); dispatch(setIsMemberDropdownOpen(false)); }} style={{ cursor: 'pointer' }}>API User</span>
                        <span className={styles.countPillDropdown} onClick={() => { setActiveTab('unique_view'); dispatch(setIsMemberDropdownOpen(false)); }} style={{ cursor: 'pointer' }}>Unique</span>
                        <span className={styles.countPillDropdown} onClick={() => { dispatch(setIsMemberDropdownOpen(false)); }} style={{ cursor: 'pointer' }}>Set News</span>
                        <span className={styles.countPillDropdown} onClick={() => { dispatch(setIsMemberDropdownOpen(false)); }} style={{ cursor: 'pointer' }}>Create Pin</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Search Member input field */}
                <div className={styles.searchMemberContainer}>
                  <div className={styles.searchMemberWrapper}>
                    <FaSearch className={styles.searchMemberIcon} />
                    <input 
                      type="text" 
                      placeholder="Search Member / Login ID..." 
                      className={styles.searchMemberInput}
                      value={memberSearchQuery}
                      onChange={(e) => {
                        setMemberSearchQuery(e.target.value);
                        setShowSearchDropdown(true);
                      }}
                      onFocus={() => setShowSearchDropdown(true)}
                    />
                  </div>

                  {showSearchDropdown && memberSearchQuery.trim().length >= 3 && (
                    <>
                      <div className={styles.dropdownBackdrop} onClick={() => setShowSearchDropdown(false)} />
                      <div className={styles.searchSuggestionsDropdown}>
                        {isSearchingMember ? (
                          <div style={{ padding: '15px', textAlign: 'center', color: '#718096', fontSize: '0.85rem' }}>
                            Searching...
                          </div>
                        ) : suggestions.length > 0 ? (
                          suggestions.map((m) => (
                            <button
                              key={m.id}
                              className={styles.suggestionItem}
                              onClick={() => {
                                setSelectedMember(m);
                                setMemberSearchQuery('');
                                setShowSearchDropdown(false);
                              }}
                            >
                              <div className={styles.suggestionAvatar}>
                                {m.name ? m.name.charAt(0).toUpperCase() : '👤'}
                              </div>
                              <div className={styles.suggestionText}>
                                <span className={styles.suggestionName}>{m.name} ({m.memberId || 'N/A'})</span>
                                <span className={styles.suggestionMeta}>📞 {m.mobile}</span>
                                {m.shopName && <span className={styles.suggestionMeta}>🏪 {m.shopName}</span>}
                                <span className={styles.suggestionMeta} style={{ fontSize: '0.68rem', color: '#1756AA', fontWeight: '600', marginTop: '2px' }}>
                                  Bal: ₹{m.mainWallet !== undefined ? m.mainWallet.toFixed(2) : '0.00'}
                                </span>
                              </div>
                              <span className={`${styles.suggestionBadge} ${
                                m.memberId && m.memberId.startsWith('RT') ? styles.badgeRetailer :
                                m.memberId && m.memberId.startsWith('DT') ? styles.badgeDistributor :
                                m.memberId && m.memberId.startsWith('MD') ? styles.badgeMasterDist :
                                m.memberId && m.memberId.startsWith('AD') ? styles.badgeAdmin : styles.badgeDefault
                              }`}>
                                {m.memberId ? (
                                  m.memberId.startsWith('RT') ? 'Retailer' :
                                  m.memberId.startsWith('DT') ? 'Distributor' :
                                  m.memberId.startsWith('MD') ? 'Master Dist.' :
                                  m.memberId.startsWith('AD') ? 'Admin' : 'Member'
                                ) : 'Member'}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div style={{ padding: '15px', textAlign: 'center', color: '#718096', fontSize: '0.85rem' }}>
                            No members found
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className={styles.dashboardMainContent}>
                <div className={styles.dashboardColumns}>
                  {/* LEFT COLUMN - 35% */}
                  <div className={styles.leftColumn}>
                    {/* SERVICES OVERVIEW (Top) */}
                    <div className={`${styles.cardContainer} ${styles.servicesCard} ${styles.servicesCardMobileOrder}`}>
                      <h3 className={styles.sectionTitle}>Services Overview</h3>
                      <div className={styles.servicesList}>
                        {DASHBOARD_CARDS.map((card, index) => (
                          <ServiceRow key={card.id} card={card} index={index} />
                        ))}
                      </div>
                    </div>

                    {/* BOTTOM ROW (Donut + Alerts) */}
                    <div className={`${styles.leftBottomRow} ${styles.leftBottomRowMobileOrder}`}>
                      {/* DONUT CHART */}
                      <div className={`${styles.cardContainer} ${styles.donutCard} ${styles.bottomInfoCard}`}>
                        <h3 className={styles.sectionTitle}>Revenue</h3>
                        <div className={styles.donutWrapper}>
                          <ResponsiveContainer width="100%" height={110}>
                            <PieChart>
                              <Pie
                                data={DONUT_DATA}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={50}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                              >
                                {DONUT_DATA.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 8px 24px rgba(13, 27, 62, 0.12)', padding: '6px 10px', fontSize: '0.75rem' }}
                                itemStyle={{ color: '#0D1B3E', fontWeight: 'bold' }}
                                formatter={(value) => [`₹ ${value.toLocaleString()}`, 'Revenue']}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className={styles.donutLegend}>
                            {DONUT_DATA.map((entry, index) => (
                              <div key={entry.name} className={styles.legendItem}>
                                <span className={styles.legendDot} style={{ backgroundColor: DONUT_COLORS[index] }}></span>
                                <span className={styles.legendText} style={{ fontSize: '0.65rem' }}>{entry.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* SYSTEM ALERTS */}
                      <div className={`${styles.cardContainer} ${styles.bottomInfoCard}`} style={{ padding: '16px' }}>
                        <h3 className={styles.sectionTitle}>Pending Actions</h3>
                        <div className={styles.alertsList}>
                          <div className={styles.alertItem}>
                            <div className={`${styles.alertIconWrap} ${styles.alertOrange}`}>
                              <FaIdCard />
                            </div>
                            <div className={styles.alertInfo}>
                              <span className={styles.alertCount}>12</span>
                              <span className={styles.alertLabel}>KYC Pending</span>
                            </div>
                          </div>
                          
                          <div className={styles.alertItem}>
                            <div className={`${styles.alertIconWrap} ${styles.alertRed}`}>
                              <FaHeadset />
                            </div>
                            <div className={styles.alertInfo}>
                              <span className={styles.alertCount}>5</span>
                              <span className={styles.alertLabel}>Open Tickets</span>
                            </div>
                          </div>

                          <div className={styles.alertItem}>
                            <div className={`${styles.alertIconWrap} ${styles.alertBlue}`}>
                              <FaWallet />
                            </div>
                            <div className={styles.alertInfo}>
                              <span className={styles.alertCount}>3</span>
                              <span className={styles.alertLabel}>Fund Request</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN - 65% */}
                  <div className={styles.rightColumn}>
                    {/* KEY METRICS ROW */}
                    <div className={`${styles.statsRow} ${styles.statsRowMobileOrder} admin-stats-row`}>
                      {STAT_CARDS.map(stat => (
                        <div key={stat.id} className={styles.statCard}>
                          <div className={styles.statIconWrap}>
                            <stat.icon className={`${styles.statIcon} ${styles[`icon_${stat.color}`]}`} />
                          </div>
                          <div className={styles.statInfo}>
                            <span className={styles.statValue}>{stat.value}</span>
                            <span className={styles.statLabel}>{stat.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CHART */}
                    <div className={`${styles.cardContainer} ${styles.chartCard} ${styles.chartCardMobileOrder} admin-chart-card`}>
                      <div className={styles.chartHeader}>
                        <div className={styles.chartHeaderLeft}>
                          <h3 className={styles.sectionTitle}>Transaction Overview</h3>
                        </div>

                        <div className={styles.chartTabsWrapper}>
                          <div className={styles.chartTabs}>
                            <button 
                              className={`${styles.chartTabBtn} ${adminChartView === 'revenue' ? styles.activeChartTab : ''}`}
                              onClick={() => setAdminChartView('revenue')}
                            >
                              Revenue vs Profit
                            </button>
                            <button 
                              className={`${styles.chartTabBtn} ${adminChartView === 'health' ? styles.activeChartTab : ''}`}
                              onClick={() => setAdminChartView('health')}
                            >
                              Service Health
                            </button>
                          </div>
                        </div>

                        <div className={styles.chartHeaderRight}>
                          <div className={styles.customFilterWrapper} ref={chartFilterRef}>
                            <button 
                              className={styles.chartFilterBtn} 
                              onClick={() => setIsChartFilterOpen(!isChartFilterOpen)}
                            >
                              {selectedChartFilter} {isChartFilterOpen ? <FaCaretUp /> : <FaCaretDown />}
                            </button>
                            {isChartFilterOpen && (
                              <div className={styles.customFilterDropdown}>
                                {chartFilterOptions.map(opt => (
                                  <button 
                                    key={opt}
                                    className={`${styles.filterOption} ${selectedChartFilter === opt ? styles.filterOptionActive : ''}`}
                                    onClick={() => {
                                      setSelectedChartFilter(opt);
                                      setIsChartFilterOpen(false);
                                    }}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={220}>
                          {adminChartView === 'revenue' ? (
                            <AreaChart data={revenueProfitData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#1756AA" stopOpacity={0.6}/>
                                  <stop offset="95%" stopColor="#1756AA" stopOpacity={0.05}/>
                                </linearGradient>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#27AE60" stopOpacity={0.6}/>
                                  <stop offset="95%" stopColor="#27AE60" stopOpacity={0.05}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#718096', fontSize: 10 }} />
                              <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#718096', fontSize: 10 }} 
                                tickFormatter={formatYAxis}
                                width={45}
                              />
                              <Tooltip />
                              <Area type="monotone" dataKey="revenue" stroke="#1756AA" strokeWidth={3} fill="url(#colorRev)" activeDot={{ r: 6 }} />
                              <Area type="monotone" dataKey="profit" stroke="#27AE60" strokeWidth={3} fill="url(#colorProfit)" activeDot={{ r: 6 }} />
                            </AreaChart>
                          ) : (
                            <BarChart data={serviceHealthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#718096', fontSize: 10 }} />
                              <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#718096', fontSize: 10 }} 
                                tickFormatter={formatYAxis}
                                width={45}
                              />
                              <Tooltip />
                              <Bar dataKey="success" fill="#27AE60" radius={[4, 4, 0, 0]} barSize={20} />
                              <Bar dataKey="failed" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* ADDITIONAL INFO CARDS (To fill empty space) */}
                    <div className={`${styles.rightBottomGrid} ${styles.rightBottomGridMobileOrder}`}>
                      {/* TOP PERFORMERS */}
                      <div className={`${styles.cardContainer} ${styles.bottomInfoCard}`} style={{ padding: '16px' }}>
                        <h3 className={styles.sectionTitle}>Top Performers</h3>
                        <div className={styles.performersList}>
                          <div className={styles.performerItem}>
                            <div className={styles.performerAvatar}>R</div>
                            <div className={styles.performerInfo}>
                              <span className={styles.performerName}>Ramesh Store</span>
                              <span className={styles.performerType}>DMT Agent</span>
                            </div>
                            <span className={styles.performerAmount}>₹ 45k</span>
                          </div>
                          <div className={styles.performerItem}>
                            <div className={styles.performerAvatar}>P</div>
                            <div className={styles.performerInfo}>
                              <span className={styles.performerName}>Priya Telecom</span>
                              <span className={styles.performerType}>AEPS Retailer</span>
                            </div>
                            <span className={styles.performerAmount}>₹ 38k</span>
                          </div>
                          <div className={styles.performerItem}>
                            <div className={styles.performerAvatar}>S</div>
                            <div className={styles.performerInfo}>
                              <span className={styles.performerName}>Sharma Comms</span>
                              <span className={styles.performerType}>Recharge</span>
                            </div>
                            <span className={styles.performerAmount}>₹ 32k</span>
                          </div>
                        </div>
                      </div>

                      {/* API HEALTH STATUS */}
                      <div className={`${styles.cardContainer} ${styles.bottomInfoCard}`} style={{ padding: '16px' }}>
                        <h3 className={styles.sectionTitle}>API Health Status</h3>
                        <div className={styles.apiHealthList}>
                          <div className={styles.apiRow}>
                            <div className={styles.apiNameWrap}>
                              <div className={styles.apiDotGreen}></div>
                              <span>ICICI Payout</span>
                            </div>
                            <span className={styles.textGreen}>99.9% Uptime</span>
                          </div>
                          <div className={styles.apiRow}>
                            <div className={styles.apiNameWrap}>
                              <div className={styles.apiDotGreen}></div>
                              <span>YesBank AEPS</span>
                            </div>
                            <span className={styles.textGreen}>98.5% Uptime</span>
                          </div>
                          <div className={styles.apiRow}>
                            <div className={styles.apiNameWrap}>
                              <div className={styles.apiDotOrange}></div>
                              <span>Paytm Wallet</span>
                            </div>
                            <span className={styles.textOrange}>Degraded</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTTOM TABLE */}
                <div className={`${styles.cardContainer} ${styles.tableContainer} ${styles.tableContainerMobileOrder}`}>
                  <h3 className={styles.sectionTitle}>Recent Transactions</h3>
                  <div className={styles.tableWrapper}>
                    <table className={styles.recentTable}>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Date</th>
                          <th>Service</th>
                          <th>Member ID</th>
                          <th>Amount</th>
                          <th>Commission</th>
                          <th>Status</th>
                          <th>Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {RECENT_TXNS.map((txn, i) => (
                          <tr key={txn.id}>
                            <td>{i + 1}</td>
                            <td>{txn.date}</td>
                            <td>
                              <span className={`${styles.servicePill} ${styles[`service_${txn.service.toLowerCase()}`] || ''}`}>
                                {txn.service}
                              </span>
                            </td>
                            <td>{txn.memberId}</td>
                            <td>₹ {txn.amount}</td>
                            <td>₹ {txn.commission}</td>
                            <td>
                              <span className={`${styles.statusBadge} ${styles[`status_${txn.status.toLowerCase()}`]}`}>
                                {txn.status}
                              </span>
                            </td>
                            <td className={txn.change.startsWith('+') ? styles.changePositive : txn.change.startsWith('-') ? styles.changeNegative : styles.changeNeutral}>
                              {txn.change}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`${styles.sidebarOverlay} ${isSidebarOpen ? styles.overlayActive : ''}`} 
        onClick={() => dispatch(toggleSidebar())}
      />
      
      {/* Upgrade Popup */}
      <UpgradePopup />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className={styles.logoutModalOverlay} onClick={() => setShowLogoutModal(false)}>
          <div className={styles.logoutModalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.logoutModalIconBox}>
              <FaSignOutAlt />
            </div>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out of the Admin panel?</p>
            <div className={styles.logoutModalActions}>
              <button className={styles.logoutCancelBtn} onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className={styles.logoutConfirmBtn} onClick={confirmLogout}>
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Freeze Password Modal */}
      {showFreezeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }} onClick={() => setShowFreezeModal(false)}>
          <form 
            onSubmit={handleConfirmFreeze}
            style={{
              background: '#fff', borderRadius: '16px', padding: '24px',
              width: '380px', maxWidth: '90%', textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: isSystemFrozen ? '#E0F2FE' : '#FEE2E2', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: isSystemFrozen ? '#0284C7' : '#EF4444', margin: '0 auto 16px auto',
              fontSize: '1.6rem'
            }}>
              <FaUserLock />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 800, color: '#0D1B3E' }}>
              {isSystemFrozen ? 'Activate All Services?' : 'Deactivate All Services?'}
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5 }}>
              {isSystemFrozen 
                ? 'Are you sure you want to activate member transactions? Enter Admin Security Password to confirm.' 
                : 'WARNING: This will freeze all member withdrawals and transactions immediately. Enter Admin Security Password to confirm.'}
            </p>
            
            {freezeModalError && (
              <div style={{
                color: '#EF4444', background: '#FEF2F2', border: '1px solid #FCA5A5',
                padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '15px',
                display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'
              }}>
                <FaExclamationTriangle /> {freezeModalError}
              </div>
            )}

            <input
              type="password"
              placeholder="Enter Admin Password"
              value={freezePassword}
              onChange={(e) => setFreezePassword(e.target.value)}
              autoFocus
              required
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #E2E8F0', marginBottom: '20px', outline: 'none',
                boxSizing: 'border-box', textAlign: 'center', fontSize: '1rem',
                letterSpacing: '0.1em'
              }}
            />

            {!isSystemFrozen && (
              <textarea
                placeholder="Enter custom broadcast message for members..."
                value={freezeMessage}
                onChange={(e) => setFreezeMessage(e.target.value)}
                rows={3}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid #E2E8F0', marginBottom: '20px', outline: 'none',
                  boxSizing: 'border-box', fontSize: '0.9rem', resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button"
                onClick={() => setShowFreezeModal(false)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0',
                  background: '#fff', color: '#64748B', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                  background: isSystemFrozen ? '#0284C7' : '#EF4444', color: '#fff', 
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin Chat & Broadcast Assistant */}
      <AdminChat />
    </div>
  );
};

export default DashboardPage;
