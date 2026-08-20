import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiX, FiStar, FiUsers, FiShield 
} from 'react-icons/fi';
import { FaFingerprint } from 'react-icons/fa';
import { setUpgradePopup, setSelectedPlan } from '../../../store/slices/memberPanelSlice';
import { setNotification } from '../../../store/slices/uiSlice';
import styles from './UpgradePopup.module.css';

const plans = [
  {
    id: 1,
    name: 'TEST',
    icon: <FiStar />,
    price: '100.00',
    desc: 'TEST FOR CREATE PLAN',
    gradient: 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)',
    color: '#2196F3',
    shadow: 'rgba(33, 150, 243, 0.2)'
  },
  {
    id: 2,
    name: 'UPGRADE TO DIAMOND',
    icon: '💎',
    price: '100.00',
    desc: 'IF YOU HAVE TO UPGRADE YOUR MEMBERSHIP TO DIAMOND THEN MAKE PAYMENT OF ₹100 ON GIVEN LINK',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #4A148C 100%)',
    color: '#9C27B0',
    shadow: 'rgba(156, 39, 176, 0.2)',
    popular: true
  },
  {
    id: 3,
    name: 'SOCIAL',
    icon: <FiUsers />,
    price: '1001.00',
    desc: 'USE THIS',
    gradient: 'linear-gradient(135deg, #009688 0%, #004D40 100%)',
    color: '#009688',
    shadow: 'rgba(0, 150, 136, 0.2)'
  },
  {
    id: 4,
    name: 'TEST AEPS',
    icon: <FaFingerprint />,
    price: '100.00',
    desc: 'TEST FOR AEPS',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #1B5E20 100%)',
    color: '#4CAF50',
    shadow: 'rgba(76, 175, 80, 0.2)'
  }
];

const UpgradePopup = () => {
  const dispatch = useDispatch();
  const { isUpgradePopupOpen } = useSelector((state) => state.memberPanel);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') dispatch(setUpgradePopup(false));
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [dispatch]);

  if (!isUpgradePopupOpen) return null;

  const handleBuy = (plan) => {
    dispatch(setSelectedPlan(plan));
    dispatch(setNotification({ type: 'success', message: 'Plan purchased!' }));
    dispatch(setUpgradePopup(false));
  };

  return (
    <div className={styles.overlay} onClick={() => dispatch(setUpgradePopup(false))}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>UPDATE YOUR MEMBERSHIP</h2>
          <button 
            className={styles.closeBtn} 
            onClick={() => dispatch(setUpgradePopup(false))}
          >
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.plansGrid}>
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={styles.planCard}
                style={{ 
                  '--card-gradient': plan.gradient,
                  '--card-theme-color': plan.color,
                  '--hover-shadow-color': plan.shadow
                }}
              >
                <div className={styles.cardHeaderBar}>
                  <h3 className={styles.cardPlanName}>{plan.name}</h3>
                </div>
                
                {plan.popular && <div className={styles.popularBadge}>POPULAR</div>}

                <div className={styles.cardBody}>
                  <div className={styles.planIconWrap}>
                    {plan.icon}
                  </div>
                  <div className={styles.price}>₹{plan.price}</div>
                  <div className={styles.divider}></div>
                  <p className={styles.description}>{plan.desc}</p>
                  <button 
                    className={styles.buyBtn}
                    onClick={() => handleBuy(plan)}
                  >
                    Buy Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePopup;
