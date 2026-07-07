import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import styles from './ApiHome.module.css';
import { FaCheckCircle, FaExclamationTriangle, FaClock, FaTimesCircle, FaServer, FaShieldAlt, FaStore, FaLandmark, FaMoneyBillWave, FaMobileAlt, FaFingerprint, FaWallet, FaQrcode, FaExchangeAlt, FaIdCard, FaAddressCard, FaUniversity, FaUserPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
const ApiHome = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useSelector((state) => state.memberPanel);
  const [activeLane, setActiveLane] = useState('Success');
  const [currentTime, setCurrentTime] = useState('');
  const [healthScore, setHealthScore] = useState(0);

  // Smooth count up animation for health score
  useEffect(() => {
    let start = 0;
    const end = 97;
    const duration = 1500; // 1.5 seconds
    const increment = end / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setHealthScore(end);
        clearInterval(timer);
      } else {
        setHealthScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      setCurrentTime(now.toLocaleString('en-IN', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const healthData = [
    { name: 'Success', value: 97, color: '#10B981' }, 
    { name: 'Remaining', value: 3, color: isDarkMode ? '#334155' : '#e2e8f0' }
  ];

  const laneData = {
    Success: {
      count: '0', amount: '₹ 0.00', avg: '₹ 0.00',
      desc: 'Clean credits reaching beneficiary / operator without noise',
      percent: '0%', color: '#10B981', icon: <FaCheckCircle />
    },
    Accepted: {
      count: '0', amount: '₹ 0.00', avg: '₹ 0.00',
      desc: 'Transactions accepted and pending operator final status.',
      percent: '0%', color: '#3B82F6', icon: <FaClock />
    },
    Pending: {
      count: '0', amount: '₹ 0.00', avg: '₹ 0.00',
      desc: 'Awaiting response from bank or NPCI nodes.',
      percent: '0%', color: '#F59E0B', icon: <FaExclamationTriangle />
    },
    Failed: {
      count: '0', amount: '₹ 0.00', avg: '₹ 0.00',
      desc: 'Transactions failed due to routing or balance issues.',
      percent: '0%', color: '#EF4444', icon: <FaTimesCircle />
    }
  };

  const quickServices = [
    { name: 'DMT', icon: <FaMoneyBillWave />, color: '#8E24AA', path: '/api-panel/dashboard/service/dmt', value: '₹ 12.5L', max: '₹ 20L', usagePercent: 62 },
    { name: 'RECHARGE', icon: <FaMobileAlt />, color: '#1E88E5', path: '/api-panel/dashboard/service/mobile-recharge', value: '₹ 24K', max: '₹ 50K', usagePercent: 48 },
    { name: 'AEPS', icon: <FaFingerprint />, color: '#43A047', path: '/api-panel/dashboard/service/aeps', value: '₹ 45L', max: '₹ 50L', usagePercent: 90 },
    { name: 'PAYOUT', icon: <FaWallet />, color: '#E53935', path: '/api-panel/dashboard/service/payout', value: '₹ 8.2L', max: '₹ 15L', usagePercent: 55 },
    { name: 'UPI', icon: <FaQrcode />, color: '#1A237E', path: '/api-panel/dashboard/service/upitransfer', value: '₹ 1.5L', max: '₹ 5L', usagePercent: 30 },
    { name: 'W2W', icon: <FaExchangeAlt />, color: '#FB8C00', path: '/api-panel/dashboard/wallet/w2w', value: '₹ 9.1L', max: '₹ 10L', usagePercent: 91 },
    { name: 'AADHARPAY', icon: <FaIdCard />, color: '#00897B', path: '/api-panel/dashboard/service/aadharpay', value: '₹ 2.8L', max: '₹ 5L', usagePercent: 56 },
    { name: 'PAN', icon: <FaAddressCard />, color: '#D81B60', path: '/api-panel/dashboard/service/pan', value: '45/100', max: 'Cards', usagePercent: 45 },
    { name: 'V-ACCOUNT', icon: <FaUniversity />, color: '#5E35B1', path: '/api-panel/dashboard/wallet/main', value: '₹ 18.5L', max: '₹ 25L', usagePercent: 74 },
    { name: 'FUND REQ', icon: <FaUserPlus />, color: '#F4511E', path: '/api-panel/dashboard/wallet/fund-request', value: '₹ 32L', max: '₹ 50L', usagePercent: 64 }
  ];

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : ''}`}>
      
      {/* Top Status Cards */}
      <div className={styles.statusGrid}>
        <div className={`${styles.statusCard} ${styles.blueCard} ${styles.animateCardPop}`} style={{ animationDelay: '0.1s' }}>
          <div className={styles.cardGlow}></div>
          <div className={styles.cardTitle}>DEPOSIT TRANSACTIONS</div>
          <div className={styles.cardAmount}>₹ 0.00</div>
          <div className={styles.cardSubtext}>Today's Deposit Amount</div>
        </div>
        <div className={`${styles.statusCard} ${styles.greenCard} ${styles.animateCardPop}`} style={{ animationDelay: '0.2s' }}>
          <div className={styles.cardGlow}></div>
          <div className={styles.cardTitle}>SUCCESS TRANSACTIONS</div>
          <div className={styles.cardAmount}>₹ 0.00</div>
          <div className={styles.cardSubtext}>Today's Successful Amount</div>
        </div>
        <div className={`${styles.statusCard} ${styles.purpleCard} ${styles.animateCardPop}`} style={{ animationDelay: '0.3s' }}>
          <div className={styles.cardGlow}></div>
          <div className={styles.cardTitle}>FAILED TRANSACTIONS</div>
          <div className={styles.cardAmount}>₹ 0.00</div>
          <div className={styles.cardSubtext}>Today's Failed Amount</div>
        </div>
        <div className={`${styles.statusCard} ${styles.orangeCard} ${styles.animateCardPop}`} style={{ animationDelay: '0.4s' }}>
          <div className={styles.cardGlow}></div>
          <div className={styles.cardTitle}>PENDING TRANSACTIONS</div>
          <div className={styles.cardAmount}>₹ 0.00</div>
          <div className={styles.cardSubtext}>Amount Awaiting Final Status</div>
        </div>
      </div>

      {/* SERVICES OVERVIEW SECTION */}
      <div className={`${styles.servicesSection} ${styles.animateFadeIn}`} style={{ animationDelay: '0.45s' }}>
        <div className={styles.servicesHeader}>
          <h2 className={styles.servicesTitle}>SERVICES OVERVIEW</h2>
          <p className={styles.servicesSubtitle}>Monitor API limits, daily usage, and active status in real-time</p>
        </div>
        <div className={styles.servicesOverviewGrid}>
          {quickServices.map((service, index) => (
            <div 
              key={index} 
              className={styles.overviewCard}
              style={{ '--theme-color': service.color }}
            >
              <div className={styles.overviewCardTop}>
                <div className={styles.overviewIconBox} style={{ background: `${service.color}15`, color: service.color }}>
                  {service.icon}
                </div>
                <div className={styles.overviewTitleBox}>
                  <span className={styles.overviewServiceName}>{service.name}</span>
                  <span className={styles.overviewServiceStatus} style={{ color: service.usagePercent > 90 ? '#EF4444' : '#10B981', background: service.usagePercent > 90 ? '#FEF2F2' : '#ECFDF5' }}>
                    {service.usagePercent > 90 ? 'Alert' : 'Active'}
                  </span>
                </div>
              </div>
              <div className={styles.overviewCardMiddle}>
                <div className={styles.usageValueBox}>
                  <span className={styles.usageValue}>{service.value}</span>
                  <span className={styles.usageMax}>/ {service.max}</span>
                </div>
                <span className={styles.usagePercentText}>{service.usagePercent}%</span>
              </div>
              <div className={styles.overviewProgressTrack}>
                <div 
                  className={styles.overviewProgressBar} 
                  style={{ '--target-width': `${service.usagePercent}%`, background: service.usagePercent > 90 ? '#EF4444' : service.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className={styles.middleGrid}>
        
        {/* Left Panel: Service Live Deck */}
        <div className={`${styles.panel} ${styles.animateSlideUp}`} style={{ animationDelay: '0.5s' }}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>SERVICE LIVE DECK</h2>
              <p className={styles.panelSubtitle}>Live Engine health, status focus & money story for today</p>
            </div>
            <div className={styles.deckHeaderRight}>
              <span className={styles.primeBadge}>Prime Mode - 97 / 100</span>
              <span className={styles.liveBadge}><span className={styles.liveDot}></span> LIVE</span>
              <span className={styles.timeDisplay}>{currentTime}</span>
            </div>
          </div>

          <div className={styles.deckContent}>
            {/* Chart Section */}
            <div className={styles.engineHealthCol}>
              <div className={styles.radialChartWrapper}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={70}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                      animationDuration={1000}
                    >
                      {healthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.healthCenterText}>
                  <span className={styles.healthScore}>{healthScore}</span>
                  <span className={styles.healthLabel}>Engine Health</span>
                </div>
              </div>
              
              <div className={styles.healthLegend}>
                {Object.entries(laneData).map(([key, data]) => (
                  <div className={styles.legendItem} key={key}>
                    <div className={styles.legendLeft}>
                      <span className={styles.legendDot} style={{ background: data.color }}></span>
                      <span className={styles.legendName}>{key}</span>
                    </div>
                    <span className={styles.legendValue}>0%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Focus Lane Section */}
            <div className={styles.focusLaneCol}>
              <div className={styles.laneLabel}>Focus a lane:</div>
              <div className={styles.laneToggles}>
                {Object.keys(laneData).map(lane => (
                  <button 
                    key={lane}
                    className={`${styles.laneBtn} ${activeLane === lane ? styles.active : ''}`}
                    onClick={() => setActiveLane(lane)}
                  >
                    <span className={styles.legendDot} style={{ background: laneData[lane].color }}></span>
                    {lane}
                  </button>
                ))}
              </div>

              <div className={styles.laneActivePanel}>
                <div className={styles.activeLaneHeader}>
                  <div>
                    <h3 className={styles.activeLaneTitle}>
                      <span style={{ color: laneData[activeLane].color, display: 'flex', alignItems: 'center' }}>
                        {laneData[activeLane].icon}
                      </span>
                      <span style={{ marginLeft: '8px' }}>{activeLane} Lane</span>
                    </h3>
                    <p className={styles.activeLaneDesc}>{laneData[activeLane].desc}</p>
                  </div>
                  <span className={styles.activeLanePercent} style={{ color: laneData[activeLane].color }}>
                    {laneData[activeLane].percent} of today
                  </span>
                </div>

                <div className={styles.laneStatsGrid}>
                  <div className={styles.laneStatBox}>
                    <span className={styles.statBoxLabel}>TRANSACTIONS</span>
                    <span className={styles.statBoxValue}>{laneData[activeLane].count}</span>
                  </div>
                  <div className={styles.laneStatBox}>
                    <span className={styles.statBoxLabel}>AMOUNT</span>
                    <span className={styles.statBoxValue}>{laneData[activeLane].amount}</span>
                  </div>
                  <div className={styles.laneStatBox}>
                    <span className={styles.statBoxLabel}>AVG TICKET</span>
                    <span className={styles.statBoxValue}>{laneData[activeLane].avg}</span>
                  </div>
                </div>
                
                <p className={styles.laneHelpText}>
                  Use webhook + status check to keep merchants synced on final status.
                </p>
                <div className={styles.laneAnimatedBar}>
                   <div className={styles.laneAnimatedProgress} style={{ background: laneData[activeLane].color }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Money Footers (Compact) */}
          <div className={styles.deckFooter}>
            <div className={`${styles.footerStat} ${styles.cleared}`}>
              <div className={styles.footerStatHeader}>
                <FaCheckCircle className={styles.footerIcon} />
                <span className={styles.footerStatLabel}>Money Cleared Today</span>
              </div>
              <span className={styles.footerStatValue}>₹ 0.00</span>
            </div>
            <div className={styles.footerDivider}></div>
            <div className={`${styles.footerStat} ${styles.waiting}`}>
              <div className={styles.footerStatHeader}>
                <FaClock className={styles.footerIcon} />
                <span className={styles.footerStatLabel}>Money Waiting @ Bank / Operator</span>
              </div>
              <span className={styles.footerStatValue}>₹ 0.00</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Escalation Radar */}
        <div className={`${styles.panel} ${styles.animateSlideUp}`} style={{ animationDelay: '0.6s' }}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>ESCALATION RADAR</h2>
              <p className={styles.panelSubtitle}>Where should ops / tech look first?</p>
            </div>
          </div>

          <div className={styles.radarGrid}>
            <div className={`${styles.radarItem} ${styles.radarGreen}`}>
              <div className={styles.radarIconBox}><FaLandmark /></div>
              <div>
                <h4 className={styles.radarTitle}>Bank / Partner</h4>
                <p className={styles.radarDesc}>Quiet window - good time for config changes.</p>
              </div>
            </div>
            <div className={`${styles.radarItem} ${styles.radarGreen}`}>
              <div className={styles.radarIconBox}><FaStore /></div>
              <div>
                <h4 className={styles.radarTitle}>Merchant</h4>
                <p className={styles.radarDesc}>No abnormal spikes. Requests look fine.</p>
              </div>
            </div>
            <div className={`${styles.radarItem} ${styles.radarGreen}`}>
              <div className={styles.radarIconBox}><FaServer /></div>
              <div>
                <h4 className={styles.radarTitle}>Internal Systems</h4>
                <p className={styles.radarDesc}>Engine Idle. Services are in healthy state.</p>
              </div>
            </div>
            <div className={`${styles.radarItem} ${styles.radarYellow}`}>
              <div className={styles.radarIconBox}><FaShieldAlt /></div>
              <div>
                <h4 className={styles.radarTitle}>Compliance & KYC</h4>
                <p className={styles.radarDesc}>Push KYC completion before raising limits.</p>
              </div>
            </div>
          </div>

          <p className={styles.radarFooter}>
            Use this panel during live incident calls as a single view of where to probe first.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ApiHome;

