import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FaWallet, FaSearch, FaCalendarAlt, FaShieldAlt,
  FaArrowUp, FaArrowDown, FaInbox, FaFingerprint, FaCheckCircle,
  FaCreditCard, FaUser, FaChartBar, FaCaretDown,
  FaCopy, FaFileExcel, FaFileCsv, FaFilePdf, FaPrint, FaMoneyBillWave, FaMobileAlt,
  FaExchangeAlt, FaAddressCard, FaQrcode, FaShoppingBag, FaUniversity, FaUserPlus, FaIdCard
} from 'react-icons/fa';
import {
  FiSmartphone, FiCreditCard as FiCard, FiUser
} from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  setSelectedDate, setActiveTab, setUpgradePopup 
} from '../../../store/slices/memberPanelSlice';
import UpgradePopup from './UpgradePopup';
import GuidedTour from '../../../shared/components/common/GuidedTour';
import styles from './MemberHome.module.css';
import sharedStyles from '../../../shared/components/common/SharedTable.module.css';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const amt = payload.find(p => p.dataKey === 'amount');
    return (
      <div className={styles.customTooltip} style={{ background: '#fff', border: '1px solid #f2f2f2', padding: '10px 15px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <p className={styles.tooltipValue} style={{ margin: 0, fontWeight: '700', color: '#111b21' }}>₹{amt ? amt.value.toLocaleString() : 0}</p>
        <p className={styles.tooltipLabel} style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#667781' }}>{payload[0].payload.time}</p>
      </div>
    );
  }
  return null;
};

// 1. ServiceRow Component
const ServiceRow = ({ card, index }) => {
  const navigate = useNavigate();
  const isSurcharge = card.stat1Label?.toLowerCase().includes('surcharge');
  const isCommission = card.stat1Label?.toLowerCase().includes('commission');
  const badgeType = isSurcharge ? 'orange' : isCommission ? 'green' : 'blue';

  const handleClick = () => {
    const name = card.name.toLowerCase();
    if (name.includes('recharge')) navigate('/member/dashboard/service/mobile-recharge');
    else if (name.includes('dmt')) navigate('/member/dashboard/service/dmt');
    else if (name.includes('aeps')) navigate('/member/dashboard/service/aeps');
    else if (name.includes('payout')) navigate('/member/dashboard/service/payout');
    else if (name.includes('aadharpay')) navigate('/member/dashboard/service/aadharpay');
    else if (name.includes('upi cash out')) navigate('/member/dashboard/service/upicashout');
    else if (name.includes('upi')) navigate('/member/dashboard/service/upitransfer');
    else if (name.includes('pan')) navigate('/member/dashboard/service/pan');
    else if (name.includes('fund')) navigate('/member/dashboard/wallet/fund-request');
    else if (name.includes('w2w') || name.includes('wallet 2 wallet')) navigate('/member/dashboard/wallet/w2w');
  };

  return (
    <div 
      className={styles.serviceRow} 
      style={{ animationDelay: `${index * 0.05}s`, cursor: 'pointer' }}
      onClick={handleClick}
    >
      <div className={styles.serviceRowMain}>
        <div className={styles.serviceInfoLeft}>
          <div className={styles.premiumIconWrap} style={{ '--icon-bg': card.color }}>
            {card.icon}
          </div>
          <div className={styles.nameSection}>
            <span className={styles.serviceName}>{card.name}</span>
            <span className={styles.subText}>Active Service</span>
          </div>
        </div>
        
        <div className={styles.serviceInfoRight}>
          <div className={styles.badgeColumn}>
            {card.stat1Label && (
              <span className={`${styles.badge} ${styles[`badge_${badgeType}`]}`}>
                {card.stat1Label.toUpperCase()}: ₹{card.stat1Value}
              </span>
            )}
          </div>
          <div className={styles.valueBadge}>
            <span className={styles.maxLabel}>{card.stat2Label ? card.stat2Label.toUpperCase() : 'PAID'}:</span>
            <span className={styles.maxValue}>₹{card.stat2Value || '0.00'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MemberHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const servicesRef = useRef(null);
  const {
    isDarkMode, isSidebarOpen, user, wallets,
    selectedDate, activeTab, serviceCards, transactions, searchTerm
  } = useSelector((state) => state.memberPanel);

  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('7 Days');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showMemberTour, setShowMemberTour] = useState(false);

  // New states for Analytics Filters & Animation
  const [weeklyRatioFilter, setWeeklyRatioFilter] = useState('This Week');
  const [topServicesFilter, setTopServicesFilter] = useState('This Month');
  const [analyticsVisible, setAnalyticsVisible] = useState(false);
  const analyticsRef = useRef(null);

  const MEMBER_TOUR_STEPS = [
    {
      target: '.member-services-card',
      icon: '⚡',
      title: 'Services Overview',
      description: 'View all your active services like Recharge, DMT, AEPS, and Payout here. Click on any service to view its detailed report.',
    },
    {
      target: '.member-chart-section',
      icon: '📊',
      title: "Today's Performance",
      description: "Track your business trends with this interactive chart. You can toggle between Trend and Service-wise views, and use date filters to analyze past data.",
    },
    {
      target: '.member-wallets-row',
      icon: '💰',
      title: 'Wallets Balance',
      description: 'Monitor your AEPS, Main, and Profit wallet balances in real-time from the header. These update instantly after every transaction.',
    },
    {
      target: '.member-my-services-btn',
      icon: '📦',
      title: 'My Services',
      description: 'Click this button at the end of the sidebar to explore more services like Gas, Electricity Bill, and Landline payments.',
    },
  ];


  const filterOptions = ['Today', '7 Days', '1 Month', '3 Months', '6 Months', '1 Year', 'All Time'];

  const { chartData, stats } = useMemo(() => {
    let dynamicChart = [];
    
    if (selectedFilter === 'Today') {
      dynamicChart = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'].map(t => ({
        time: t, amount: Math.floor(Math.random() * 4000) + 1000,
        baseline: Math.floor(Math.random() * 3000) + 1500
      }));
    } else if (selectedFilter === '7 Days') {
      dynamicChart = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
        time: day, amount: Math.floor(Math.random() * 5000) + 2000,
        baseline: Math.floor(Math.random() * 4000) + 1500
      }));
    } else if (selectedFilter === '1 Month') {
      dynamicChart = ['W1', 'W2', 'W3', 'W4'].map(w => ({
        time: w, amount: Math.floor(Math.random() * 25000) + 15000,
        baseline: Math.floor(Math.random() * 20000) + 10000
      }));
    } else if (selectedFilter === '3 Months') {
      dynamicChart = ['Month 1', 'Month 2', 'Month 3'].map(m => ({
        time: m, amount: Math.floor(Math.random() * 80000) + 40000,
        baseline: Math.floor(Math.random() * 60000) + 30000
      }));
    } else if (selectedFilter === '6 Months') {
      dynamicChart = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => ({
        time: m, amount: Math.floor(Math.random() * 150000) + 100000,
        baseline: Math.floor(Math.random() * 120000) + 80000
      }));
    } else if (selectedFilter === '1 Year') {
      dynamicChart = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map(m => ({
        time: m, amount: Math.floor(Math.random() * 300000) + 200000,
        baseline: Math.floor(Math.random() * 250000) + 150000
      }));
    } else {
      dynamicChart = ['2023', '2024', '2025', '2026'].map(y => ({
        time: y, amount: Math.floor(Math.random() * 800000) + 500000,
        baseline: Math.floor(Math.random() * 600000) + 400000
      }));
    }

    const totalBusiness = dynamicChart.reduce((sum, item) => sum + item.amount, 0);
    const totalEarning = (totalBusiness * 0.002).toFixed(2);
    
    return {
      chartData: dynamicChart,
      stats: {
        business: totalBusiness > 1000 ? `${(totalBusiness/1000).toFixed(1)}k` : totalBusiness,
        earning: totalEarning,
        txns: dynamicChart.length * 5,
        balance: wallets.main.toLocaleString()
      }
    };
  }, [selectedFilter, wallets.main]);

  const daybookTabs = [
    { name: 'Recharge', icon: <FiSmartphone /> },
    { name: 'AEPS', icon: <FaFingerprint /> },
    { name: 'MATM', icon: <FaCreditCard /> },
    { name: 'Aadhar', icon: <FaUser /> },
    { name: 'CreditCardBillPay', icon: <FiCard /> }
  ];

  const getIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('dmt')) return <FaMoneyBillWave />;
    if (n.includes('recharge')) return <FaMobileAlt />;
    if (n.includes('aeps')) return <FaFingerprint />;
    if (n.includes('payout')) return <FaWallet />;
    if (n.includes('wallet 2 wallet')) return <FaExchangeAlt />;
    if (n.includes('aadharpay')) return <FaIdCard />;
    if (n.includes('upi cash out')) return <FaQrcode />;
    if (n.includes('upi')) return <FaQrcode />;
    if (n.includes('pan')) return <FaAddressCard />;
    if (n.includes('virtual')) return <FaUniversity />;
    if (n.includes('fund')) return <FaUserPlus />;
    if (n.includes('shopping')) return <FaShoppingBag />;
    if (n.includes('dth')) return <FaMobileAlt />;
    if (n.includes('electricity')) return <FaMobileAlt />;
    if (n.includes('water')) return <FaMobileAlt />;
    if (n.includes('gas')) return <FaMobileAlt />;
    if (n.includes('insurance')) return <FaShieldAlt />;
    if (n.includes('fastag')) return <FaCreditCard />;
    if (n.includes('cable tv')) return <FaMobileAlt />;
    if (n.includes('municipal tax')) return <FaUniversity />;
    return <FaWallet />;
  };

  const successRatioData = useMemo(() => {
    let multiplier = weeklyRatioFilter === 'This Week' ? 1 : 0.7;
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
       const success = Math.floor((Math.random() * 8000 + 4000) * multiplier);
       const failed = Math.floor((Math.random() * 1000 + 200) * multiplier);
       return { day, Success: success, Failed: failed };
    });
  }, [weeklyRatioFilter]);

  const { topServicesData, totalVolume } = useMemo(() => {
    let multi = 1;
    if (topServicesFilter === 'Today') multi = 0.05;
    if (topServicesFilter === 'This Week') multi = 0.25;
    if (topServicesFilter === 'This Month') multi = 1;
    if (topServicesFilter === 'This Year') multi = 10;

    const baseData = [
      { name: 'AEPS', baseVal: 35000, color: '#F472B6' },
      { name: 'DMT', baseVal: 25000, color: '#A78BFA' },
      { name: 'Recharge', baseVal: 20000, color: '#2DD4BF' },
      { name: 'Payout', baseVal: 15000, color: '#A3E635' },
      { name: 'Others', baseVal: 5000, color: '#FDE047' }
    ];

    let total = 0;
    const finalData = baseData.map(item => {
       const val = Math.floor(item.baseVal * multi * (Math.random() * 0.2 + 0.9));
       total += val;
       return { ...item, value: val };
    });

    return {
       totalVolume: total >= 1000 ? `${(total/1000).toFixed(1)}k` : total,
       topServicesData: finalData.map(item => ({
          ...item,
          percent: Math.round((item.value / total) * 100) + '%'
       }))
    };
  }, [topServicesFilter]);

  useEffect(() => {
    setIsLoaded(true);
    
    // Setup Intersection Observer for Scroll Animation
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setAnalyticsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (analyticsRef.current) {
      observer.observe(analyticsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // FILTERED SERVICES
  const filteredServices = useMemo(() => {
    if (!searchTerm) return serviceCards;
    return serviceCards.filter(card => 
      card.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, serviceCards]);

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : ''}`}>

      {/* GUIDED TOUR */}
      {showMemberTour && (
        <GuidedTour
          steps={MEMBER_TOUR_STEPS}
          onFinish={() => setShowMemberTour(false)}
        />
      )}

      {/* ========== MAIN GRID WITH HEIGHT FIX ========== */}
      <div 
        className={styles.dashboardGrid} 
        style={{ 
          display: 'flex', 
          gap: '20px', 
          alignItems: 'stretch' 
        }}
      >
        {/* Left column: Services Overview */}
        <div className={styles.leftCol} style={{ flex: 1, display: 'flex' }}>
          <div 
            className={`${styles.servicesCard} member-services-card`} 
            ref={servicesRef}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <div className={styles.cardHeaderArea}>
              <h3 className={styles.cardTitle}>Services Overview</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={styles.miniStat}>
                  {searchTerm ? `Found: ${filteredServices.length}` : `Total: ${serviceCards.length}`}
                </span>
                <button
                  onClick={() => setShowMemberTour(true)}
                  title="Start Guided Tour"
                  style={{
                    background: 'linear-gradient(135deg,#1756AA,#2a7de1)',
                    border: 'none', borderRadius: '8px',
                    width: '28px', height: '28px',
                    color: '#fff', fontSize: '0.75rem',
                    cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(23,86,170,0.35)',
                    flexShrink: 0,
                  }}
                >
                  ❓
                </button>
              </div>
            </div>
            <div className={styles.servicesList} style={{ flex: 1 }}>
              {filteredServices.length > 0 ? (
                filteredServices.map((card, index) => (
                  <ServiceRow 
                    key={index} 
                    card={{...card, icon: getIcon(card.name)}} 
                    index={index} 
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>No services found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Today's Performance */}
        <div className={styles.rightCol} style={{ flex: 1, display: 'flex' }}>
          <div 
            className={`${styles.performanceCard} member-chart-section`}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <div className={styles.performanceHeader}>
              <div className={styles.performanceTitleRow}>
                <h3 className={styles.performanceTitle}><FaChartBar /> Today's Performance</h3>
              </div>
              
              <div className={styles.chartControlsWrapper}>
                <div className={styles.chartFilterWrapper}>
                  <button 
                    className={styles.chartFilterBtn}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <FaCalendarAlt /> {selectedFilter} <FaCaretDown />
                  </button>
                  
                  {isFilterOpen && (
                    <div className={styles.filterDropdown}>
                      <div className={styles.filterOptionsList}>
                        {filterOptions.map(option => (
                          <div 
                            key={option} 
                            className={`${styles.filterOption} ${selectedFilter === option ? styles.activeOption : ''}`}
                            onClick={() => {
                              setSelectedFilter(option);
                              setIsFilterOpen(false);
                            }}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                      <button 
                        className={styles.clearFilterBtn}
                        onClick={() => {
                          setSelectedFilter('Today');
                          setIsFilterOpen(false);
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className={styles.performanceChartWrapper}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 20, right: 15, left: -15, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#718096', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#718096', fontSize: 12 }}
                    tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'url(#colorPerfHover)', strokeWidth: 30, opacity: 0.15 }} />
                  <defs>
                    <linearGradient id="colorPerfHover" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Line 
                    type="monotone" 
                    dataKey="baseline" 
                    stroke="#E2E8F0" 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={false}
                    animationDuration={1500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#6366F1" 
                    strokeWidth={4} 
                    dot={false}
                    animationDuration={1500}
                    activeDot={{ r: 8, stroke: '#818CF8', strokeWidth: 4, fill: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={`${styles.performanceGrid} member-perf-cards`}>
              <div className={`${styles.insightCard} ${styles.blueInsight}`}>
                 <div className={styles.insightIconWrap}><FaMoneyBillWave /></div>
                 <div className={styles.insightText}>
                    <span className={styles.insightLabel}>Business</span>
                    <strong className={styles.insightValue}>₹{stats.business}</strong>
                 </div>
              </div>
              
              <div className={`${styles.insightCard} ${styles.greenInsight}`}>
                 <div className={styles.insightIconWrap}><FaCheckCircle /></div>
                 <div className={styles.insightText}>
                    <span className={styles.insightLabel}>Earning</span>
                    <strong className={styles.insightValue}>₹{stats.earning}</strong>
                 </div>
              </div>

              <div className={`${styles.insightCard} ${styles.purpleInsight}`}>
                 <div className={styles.insightIconWrap}><FaExchangeAlt /></div>
                 <div className={styles.insightText}>
                    <span className={styles.insightLabel}>Today TXNS</span>
                    <strong className={styles.insightValue}>{stats.txns}</strong>
                 </div>
              </div>

              <div className={`${styles.insightCard} ${styles.orangeInsight}`}>
                 <div className={styles.insightIconWrap}><FaWallet /></div>
                 <div className={styles.insightText}>
                    <span className={styles.insightLabel}>Wallet Balance</span>
                    <strong className={styles.insightValue}>₹{stats.balance}</strong>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW ANALYTICS GRID SECTION */}
      <section 
        ref={analyticsRef}
        className={`${styles.analyticsGrid} ${analyticsVisible ? styles.animateIn : styles.opacityZero}`}
      >
        
        {/* BAR CHART CARD */}
        <div className={styles.analyticsCard}>
          <div className={styles.tableHeaderArea}>
            <div className={styles.tableHeaderTitle}>
              <h2 className={styles.sectionTitleBold}>Weekly Transaction Ratio</h2>
              <p className={styles.subText}>Compare successful vs failed transactions.</p>
            </div>
            <div className={styles.headerDropdowns}>
              <select 
                className={styles.miniFilterSelect}
                value={weeklyRatioFilter}
                onChange={(e) => setWeeklyRatioFilter(e.target.value)}
              >
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>
          </div>
          <div className={styles.barChartContainer}>
            <ResponsiveContainer width="100%" height={240}>
              {analyticsVisible && (
                <BarChart data={successRatioData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#718096', fontSize: 11, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#718096', fontSize: 11 }} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar dataKey="Success" fill="#27AE60" radius={[4, 4, 0, 0]} maxBarSize={30} animationDuration={1500} />
                  <Bar dataKey="Failed" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={30} animationDuration={1500} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* DONUT CHART CARD */}
        <div className={styles.analyticsCard}>
          <div className={styles.tableHeaderArea} style={{ marginBottom: '10px' }}>
            <div className={styles.tableHeaderTitle}>
              <h2 className={styles.sectionTitleBold}>Top Services</h2>
            </div>
            <div className={styles.headerDropdowns}>
              <span className={styles.miniLabelBtn}>Top 5</span>
              <select 
                className={styles.miniFilterSelect}
                value={topServicesFilter}
                onChange={(e) => setTopServicesFilter(e.target.value)}
              >
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
            </div>
          </div>
          
          <div className={styles.donutLayout}>
            <div className={styles.donutChartWrapper}>
               <ResponsiveContainer width="100%" height={220}>
                 {analyticsVisible && (
                   <PieChart>
                     <Pie
                       data={topServicesData}
                       cx="50%" cy="50%"
                       innerRadius={70} outerRadius={85}
                       paddingAngle={5}
                       dataKey="value"
                       stroke="none"
                       cornerRadius={10}
                       animationDuration={1500}
                     >
                       {topServicesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip wrapperStyle={{ zIndex: 100 }} cursor={false} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 100 }} />
                   </PieChart>
                 )}
               </ResponsiveContainer>
               <div className={styles.donutCenterText} style={{ pointerEvents: 'none' }}>
                  <span className={styles.donutCenterValue}>₹{totalVolume}</span>
                  <span className={styles.donutCenterLabel}>Volume</span>
               </div>
            </div>
            
            <div className={styles.donutLegendList}>
              {topServicesData.map((item, idx) => (
                <div key={idx} className={styles.donutLegendItem}>
                   <div className={styles.donutLegendLeft}>
                     <span className={styles.colorSquare} style={{ backgroundColor: item.color }}></span>
                     <span className={styles.legendName}>{item.name}</span>
                   </div>
                   <span className={styles.legendPercent}>{item.percent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* TRANSACTION TABLE SECTION */}
      <section className={`${styles.transactionSection} ${isLoaded ? styles.animateIn : ''} member-txn-table`}>
        <div className={styles.tableHeaderArea}>
          <div className={styles.tableHeaderTitle}>
            <h2 className={styles.sectionTitleBold}>Recent Transactions</h2>
          </div>
          <button 
            className={styles.viewAllBtn}
            onClick={() => navigate('/member/dashboard/report/aeps')}
          >
            VIEW ALL REPORTS
          </button>
        </div>

        <div className={styles.tableControlsRow}>
          <div className={sharedStyles.exportGroup}>
            <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_copy}`} title="Copy"><FaCopy /></button>
            <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_excel}`} title="Excel"><FaFileExcel /></button>
            <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_csv}`} title="CSV"><FaFileCsv /></button>
            <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_pdf}`} title="PDF"><FaFilePdf /></button>
            <button className={`${sharedStyles.exportBtn} ${sharedStyles.bg_print}`} title="Print"><FaPrint /></button>
          </div>

          <div className={styles.tableTabsRow}>
            {daybookTabs.map(tab => (
              <button 
                key={tab.name}
                className={`${styles.tabBtnSmall} ${activeTab === tab.name ? styles.activeTabSmall : ''}`}
                onClick={() => dispatch(setActiveTab(tab.name))}
              >
                <span className={styles.tabIconSmall}>{tab.icon}</span>
                <span className={styles.tabLabelSmall}>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={sharedStyles.tableWrapper}>
          <table className={sharedStyles.table}>
            <thead>
              <tr>
                <th>Service</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Narration</th>
                <th>Status</th>
                <th>TransferDate</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((txn, i) => (
                  <tr key={i}>
                    <td className={styles.serviceNameTd}>{txn.service}</td>
                    <td>₹{txn.amount}</td>
                    <td style={{ fontWeight: 600 }}>₹{txn.balance}</td>
                    <td>{txn.narration}</td>
                    <td>
                      <span className={`${sharedStyles.statusPill} ${sharedStyles[txn.status.toLowerCase()]}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td>{txn.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIllustration}>
                        <FaInbox className={styles.emptyIconLarge} />
                      </div>
                      <p>No recent transactions found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <UpgradePopup />
    </div>
  );
};

export default MemberHome;