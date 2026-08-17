import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setMemberType, nextStep } from '../../../../store/slices/registrationSlice';
import { FaUserTie, FaChevronDown, FaCheck, FaArrowRight } from 'react-icons/fa';
import styles from './Step1.module.css';

const OPTIONS = [{ value: 'Retailer', label: 'Retailer', Icon: FaUserTie }];

const Step1 = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const memberType = useSelector((s) => s.registration.memberType);
  const [open, setOpen] = useState(false);

  const selected = OPTIONS.find((o) => o.value === memberType);

  return (
    <div className={styles.container}>
      <label className={styles.label}>Select Member Type</label>

      <div className={styles.dropdownWrap}>
        <button
          type="button"
          className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
          onClick={() => setOpen(!open)}
        >
          <div className={styles.triggerLeft}>
            <span className={styles.iconBox}><FaUserTie /></span>
            <span className={selected ? styles.selectedText : styles.placeholder}>
              {selected ? selected.label : 'Choose member type'}
            </span>
          </div>
          <FaChevronDown className={`${styles.chevron} ${open ? styles.chevronUp : ''}`} />
        </button>

        {open && (
          <div className={styles.menu}>
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.option} ${memberType === opt.value ? styles.optionSelected : ''}`}
                onClick={() => { dispatch(setMemberType(opt.value)); setOpen(false); }}
              >
                <span className={styles.optIconBox}><opt.Icon /></span>
                <span className={styles.optLabel}>{opt.label}</span>
                {memberType === opt.value && <FaCheck className={styles.checkIcon} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        className={`${styles.nextBtn} ${!memberType ? styles.disabled : ''}`}
        disabled={!memberType}
        onClick={() => memberType && dispatch(nextStep())}
      >
        Next Step <FaArrowRight className={styles.btnArrow} />
      </button>

      <div className={styles.loginLinkRow}>
        <span>Already have an account?</span>
        <button
          type="button"
          className={styles.loginLink}
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Step1;
