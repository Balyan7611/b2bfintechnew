import React, { useContext, useEffect, useState } from 'react';
import { FaArrowRight, FaBatteryFull, FaMobileAlt, FaPlay, FaSignal, FaTv, FaUniversity, FaWifi } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../../../config/siteConfig';
import { BrandContext } from '../../../context/BrandContext';
import styles from './Hero.module.css';

const CountUp = ({ end, duration = 2000, suffix = '', prefix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrame;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setCount(easeProgress * end);
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };
    animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{prefix}{count.toFixed(decimals)}{suffix}</>;
};

const Hero = () => {
  const dynamicConfig = useContext(BrandContext);
  const dispatch = useDispatch();
  const [currentTime, setCurrentTime] = useState('10:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      hours = hours < 10 ? '0' + hours : hours;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className={styles.hero}>
      {/* Animated Blob Background */}
      <div className={styles.bgGradient}>
        <div className={styles.bgGrid}></div>
      </div>

      <div className={styles.heroInner}>
        <div className="container">
          <div className={styles.heroSplit}>

            {/* ── LEFT COLUMN ── */}
            <div className={styles.heroLeft}>

              {/* Headline */}
              <h1 className={styles.heroTitle}>
                Smarter, Faster<br />
                &amp; Safer{' '}
                <span className={styles.heroGradientText}>Banking<br />For Businesses</span>
              </h1>

              {/* Short punchy tagline only */}
              <p className={styles.heroTagline}>
                One platform for Recharge, DTH, Bill Payments,<br />
                UPI Payouts &amp; Financial Services.
              </p>

              {/* CTAs */}
              <div className={styles.buttonGroup}>
                <Link
                  to="/register"
                  className={styles.primaryBtn}
                >
                  <span>Get Started</span> <FaArrowRight className={styles.btnIcon} />
                </Link>
                <button
                  onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
                  className={styles.secondaryBtn}
                >
                  <FaPlay className={styles.playIconDesktop} />
                  <span className={styles.desktopBtnText}>See How It Works</span>
                  <span className={styles.mobileBtnText}>Explore <FaArrowRight className={styles.mobileArrow} /></span>
                </button>
              </div>

              {/* Stats row */}
              <div className={styles.statsRow}>
                {dynamicConfig.liveStats?.map((stat, idx) => (
                  <React.Fragment key={idx}>
                    <div className={styles.statItem}>
                      <span className={styles.statVal}>
                        <CountUp end={stat.value} decimals={stat.decimals || 0} suffix={stat.suffix || ''} />
                      </span>
                      <span className={styles.statLbl}>{stat.label}</span>
                    </div>
                    {idx < dynamicConfig.liveStats.length - 1 && <div className={styles.statDivider}></div>}
                  </React.Fragment>
                ))}
              </div>

            </div>{/* /heroLeft */}

            {/* ── RIGHT COLUMN ── */}
            <div className={styles.heroRight}>

              {/* Phone pair */}
              <div className={styles.phonePair}>

                {/* Back Phone — Live Payouts */}
                <div className={`${styles.phoneFrame} ${styles.phoneBack}`}>
                  <div className={styles.phoneNotch}></div>
                  <div className={styles.phoneScreen}>
                    {/* Status Bar */}
                    <div className={styles.statusBar}>
                      <span className={styles.statusTime}>{currentTime}</span>
                      <div className={styles.statusIcons}>
                        <FaSignal className={`${styles.statusIcon} ${styles.signalAnim}`} />
                        <FaWifi className={`${styles.statusIcon} ${styles.wifiAnim}`} />
                        <FaBatteryFull className={`${styles.statusIcon} ${styles.batteryAnim}`} />
                      </div>
                    </div>
                    <div className={styles.phoneHeader}>
                      <div>
                        <span className={styles.phoneWelcome}>Live Queue</span>
                        <h4 className={styles.phoneUsername}>Live Payouts</h4>
                      </div>
                      <div className={styles.phoneAvatar}>BP</div>
                    </div>
                    <div className={styles.miniTransList}>
                      <div className={styles.miniTransTrack}>
                        {[
                          { icon: <FaMobileAlt />, desc: 'Jio Recharge', amt: '₹299', col: '#2563EB', delay: '0.1s' },
                          { icon: <FaUniversity />, desc: 'UPI Payout', amt: '₹15,000', col: '#7C3AED', delay: '0.25s' },
                          { icon: <FaTv />, desc: 'DTH Bill Pay', amt: '₹450', col: '#10B981', delay: '0.4s' },
                          { icon: <FaMobileAlt />, desc: 'Airtel Recharge', amt: '₹149', col: '#F59E0B', delay: '0.55s' },
                          { icon: <FaUniversity />, desc: 'Fund Transfer', amt: '₹5,000', col: '#EC4899', delay: '0.7s' },
                        ].map((t, i) => (
                          <div
                            key={i}
                            className={styles.miniTransItem}
                            style={{ animationDelay: t.delay }}
                          >
                            <div className={styles.miniIconBg} style={{ background: t.col + '1A', color: t.col }}>
                              {t.icon}
                            </div>
                            <div className={styles.miniTransInfo}>
                              <span className={styles.miniTransName}>{t.desc}</span>
                              <span className={styles.miniTransSub}>Success</span>
                            </div>
                            <span className={styles.miniTransAmt}>{t.amt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Front Phone — Dashboard */}
                <div className={`${styles.phoneFrame} ${styles.phoneFront}`}>
                  <div className={styles.phoneNotch}></div>
                  <div className={styles.phoneScreen}>

                    {/* Status Bar */}
                    <div className={styles.statusBar}>
                      <span className={styles.statusTime}>{currentTime}</span>
                      <div className={styles.statusIcons}>
                        <FaSignal className={`${styles.statusIcon} ${styles.signalAnim}`} />
                        <FaWifi className={`${styles.statusIcon} ${styles.wifiAnim}`} />
                        <FaBatteryFull className={`${styles.statusIcon} ${styles.batteryAnim}`} />
                      </div>
                    </div>

                    <div className={styles.phoneHeader}>
                      <div>
                        <span className={styles.phoneWelcome}>Merchant Portal</span>
                        <h4 className={styles.phoneUsername}>{SITE_CONFIG.shortName} </h4>
                      </div>
                      <div className={styles.phoneAvatar} style={{ background: 'transparent' }}>
                        <img src={SITE_CONFIG.logo} alt="Logo" style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '50%' }} />
                      </div>
                    </div>

                    {/* Wallet Card */}
                    <div className={styles.walletCard}>
                      <div className={styles.walletTop}>
                        <span className={styles.walletLabel}>BUSINESS WALLET</span>
                        <div className={styles.walletChip}></div>
                      </div>
                      <span className={styles.walletLimit}>Limit: ₹10,00,000</span>
                      <div className={styles.walletBottom}>
                        <div>
                          <span className={styles.walletBalLabel}>Main Balance</span>
                          <span className={styles.walletBal}>₹1,84,500</span>
                        </div>
                        <span className={styles.walletStatus}>● ACTIVE</span>
                      </div>
                    </div>

                    {/* Our Services */}
                    <div className={styles.servicesHeader}>
                      <span>Our Services</span>
                      <span className={styles.seeAll}>View All</span>
                    </div>
                    <div className={styles.servicesGrid}>
                      {[
                        { img: '/images/heropage/adhare.png', label: 'Aadhar', col: '#2563EB' },
                        { img: '/images/heropage/AEPs.png', label: 'AEPS', col: '#10B981' },
                        { img: '/images/heropage/UPI.png', label: 'UPI', col: '#F59E0B' },
                        { img: '/images/heropage/UPI_transfer.png', label: 'Transfer', col: '#7C3AED' },
                      ].map((s, i) => (
                        <div key={i} className={styles.serviceItem}>
                          <div className={styles.serviceCircle} style={s.img ? { background: 'transparent' } : { background: s.col + '1A', color: s.col }}>
                            {s.img ? (
                              <img src={s.img} alt={s.label} className={styles.serviceImg} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                            ) : (
                              s.icon
                            )}
                          </div>
                          <span className={styles.serviceLabel}>{s.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* DMT Services */}
                    <div className={styles.servicesHeader} style={{ marginTop: '8px' }}>
                      <span>DMT Services</span>
                    </div>
                    <div className={styles.servicesGrid}>
                      {[
                        { img: '/images/parterners/Airtel.png', label: 'Airtel' },
                        { img: '/images/parterners/fino.png', label: 'Fino' },
                        { img: '/images/heropage/JIO.png', label: 'Jio' },
                        { img: '/images/parterners/NSDL.png', label: 'NSDL' },
                      ].map((s, i) => (
                        <div key={i} className={styles.serviceItem}>
                          <div className={styles.serviceCircle} style={{ background: 'transparent' }}>
                            <img src={s.img} alt={s.label} className={styles.serviceImg} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                          </div>
                          <span className={styles.serviceLabel}>{s.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Recent payout */}
                    <div className={styles.recentRow} style={{ marginTop: '10px' }}>
                      <div className={styles.recentIcon}>✔</div>
                      <span className={styles.recentName}>Payout → SBI</span>
                      <span className={styles.recentAmt}>+₹45,000</span>
                    </div>

                    <div className={styles.homeBar}></div>
                  </div>
                </div>

              </div>{/* /phonePair */}
            </div>{/* /heroRight */}

          </div>{/* /heroSplit */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
