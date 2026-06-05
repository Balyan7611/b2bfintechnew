/**
 * QuickActionGrid — Reusable Quick Account Operations Component
 *
 * Usage (kisi bhi page mein):
 *   import QuickActionGrid from '../../../shared/components/common/QuickActionGrid';
 *
 *   <QuickActionGrid
 *     isEditingProfile={bool}
 *     activeActionType={string | null}
 *     memberType={'DeActive' | 'Active'}
 *     holdAmt={number | string}
 *     creditLimit={number | string}
 *     onEditProfile={() => void}
 *     onAction={(type, defaultAmt?) => void}
 *     onBlock={() => void}
 *   />
 */

import React from 'react';
import {
  FaEdit, FaHandHoldingUsd, FaMoneyBillWave,
  FaCreditCard, FaExchangeAlt, FaUserLock,
  FaRupeeSign, FaTimesCircle,
} from 'react-icons/fa';
import styles from '../../../admin/components/MemberPages/MemberControlPage.module.css';

const QuickActionGrid = ({
  isEditingProfile,
  activeActionType,
  memberType,
  holdAmt,
  creditLimit,
  onEditProfile,
  onAction,
  onBlock,
}) => {
  const ACTIONS = [
    {
      key: 'editProfile',
      label: 'Edit Profile',
      icon: <FaEdit />,
      bg: 'rgba(23,86,170,0.1)',
      color: '#1756AA',
      isActive: isEditingProfile,
      onClick: onEditProfile,
    },
    {
      key: 'addFund',
      label: 'Add Fund',
      icon: <FaHandHoldingUsd />,
      bg: 'rgba(39,174,96,0.1)',
      color: '#27AE60',
      isActive: activeActionType === 'addFund',
      onClick: () => onAction('addFund'),
    },
    {
      key: 'deductFund',
      label: 'Deduct Fund',
      icon: <FaMoneyBillWave />,
      bg: 'rgba(229,62,62,0.1)',
      color: '#E53E3E',
      isActive: activeActionType === 'deductFund',
      onClick: () => onAction('deductFund'),
    },
    {
      key: 'addAeps',
      label: 'Add AEPS Fund',
      icon: <FaCreditCard />,
      bg: 'rgba(49,151,149,0.1)',
      color: '#319795',
      isActive: activeActionType === 'addAeps',
      onClick: () => onAction('addAeps'),
    },
    {
      key: 'deductAeps',
      label: 'Deduct AEPS',
      icon: <FaExchangeAlt />,
      bg: 'rgba(128,90,213,0.1)',
      color: '#805AD5',
      isActive: activeActionType === 'deductAeps',
      onClick: () => onAction('deductAeps'),
    },
    {
      key: 'holdAmt',
      label: 'Hold/Unhold',
      icon: <FaUserLock />,
      bg: 'rgba(234,162,31,0.1)',
      color: '#EAA21F',
      isActive: activeActionType === 'holdAmt',
      onClick: () => onAction('holdAmt', holdAmt || '0'),
    },
    {
      key: 'creditLimit',
      label: 'Credit Limit',
      icon: <FaRupeeSign />,
      bg: 'rgba(43,108,176,0.1)',
      color: '#2B6CB0',
      isActive: activeActionType === 'creditLimit',
      onClick: () => onAction('creditLimit', creditLimit || '0'),
    },
    {
      key: 'blockAc',
      label: memberType === 'DeActive' ? 'Activate A/C' : 'Block A/C',
      icon: <FaTimesCircle />,
      bg: memberType === 'DeActive' ? 'rgba(229,62,62,0.1)' : 'rgba(39,174,96,0.1)',
      color: memberType === 'DeActive' ? '#E53E3E' : '#27AE60',
      isActive: false,
      onClick: onBlock,
    },
  ];

  return (
    <div className={styles.actionsIconGrid}>
      {ACTIONS.map(action => (
        <button
          key={action.key}
          className={`${styles.actionIconCard} ${action.isActive ? styles.actionIconCardActive : ''}`}
          onClick={action.onClick}
          title={action.label}
        >
          <div
            className={styles.actionIconCircle}
            style={{ background: action.bg, color: action.color }}
          >
            {action.icon}
          </div>
          <span className={styles.actionIconLabel}>{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActionGrid;
