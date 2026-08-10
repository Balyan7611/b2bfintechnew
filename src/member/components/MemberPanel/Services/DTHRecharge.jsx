import React, { useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import styles from './DTHRecharge.module.css';
import ServiceQuickNav from './ServiceQuickNav';

const DTHRecharge = () => {
  const [dthNumber, setDthNumber] = useState('');
  const [operator, setOperator] = useState('');
  const [amount, setAmount] = useState('0');

  const operators = [
    "Airtel Digital TV",
    "Tata Play",
    "Dish TV",
    "Videocon D2H",
    "Sun Direct"
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>DTH Recharge</h1>
          <p className={styles.subtitle}>Fast and secure DTH recharge for all providers</p>
        </div>
        <ServiceQuickNav />
      </div>
      <div className={styles.mainCard}>
        
                <div className={styles.formSection}>
          <h2 className={styles.title}>DTH Recharges</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>DTH Number :</label>
            <input 
              type="text" 
              className={styles.inputField} 
              placeholder="Enter DTH Number" 
              value={dthNumber}
              onChange={(e) => setDthNumber(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Select Operator</label>
            <select 
              className={styles.inputField} 
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
            >
              <option value="">-- Select Operator --</option>
              {operators.map(op => <option key={op} value={op}>{op}</option>)}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Enter Amount ( ₹ ) :</label>
            <input 
              type="number" 
              className={styles.inputField} 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <a href="#" className={styles.viewDetails}>View Details</a>

          <button className={styles.payBtn}>
            Proceed to Pay Bill <FiChevronRight />
          </button>
        </div>

                <div className={styles.planSection}>
          <h2 className={styles.planHeader}>Browse Plans</h2>
          
          <div className={styles.planTableContainer}>
            <table className={styles.planTable}>
              <thead>
                <tr>
                  <th>Plan Name</th>
                  <th>Description</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontSize: '13px' }}>
                    Enter details to browse current operator plans
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.disclaimer}>
            <strong>Disclaimer:</strong> While we support most recharges, we request you to verify with your operator once before proceeding.
          </div>
        </div>

      </div>
    </div>
  );
};

export default DTHRecharge;
