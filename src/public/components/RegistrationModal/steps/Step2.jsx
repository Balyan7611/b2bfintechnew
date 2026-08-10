import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setMobile, generateAndSendOtp, setOtpVerified, nextStep } from '../../../../store/slices/registrationSlice';
import { FaMobileAlt, FaCheckCircle, FaCopy, FaCheck } from 'react-icons/fa';
import styles from './Step2.module.css';

const Step2 = () => {
  const dispatch = useDispatch();
  const { mobile, generatedOtp, isOtpSent } = useSelector((s) => s.registration);

  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (isOtpSent && refs[0].current) refs[0].current.focus();
  }, [isOtpSent]); 
  useEffect(() => {
    if (success) {
      dispatch(setOtpVerified());
      const t = setTimeout(() => dispatch(nextStep()), 1400);
      return () => clearTimeout(t);
    }
  }, [success, dispatch]);

  const handleDigit = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setError(false);
    if (val && i < 3) refs[i + 1].current.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const next = text.padEnd(4, '').split('').slice(0, 4);
    setDigits(next);
    if (text.length === 4) refs[3].current.focus();
    e.preventDefault();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    if (digits.join('') === generatedOtp) {
      setSuccess(true);
    } else {
      setError(true);
      setDigits(['', '', '', '']);
      setTimeout(() => refs[0].current?.focus(), 50);
    }
  };

  const allFilled = digits.every((d) => d !== '');

  return (
    <div className={styles.container}>

            <div className={styles.group}>
        <label className={styles.label}>Mobile Number</label>
        <div className={styles.inputRow}>
          <span className={styles.iconBox}><FaMobileAlt /></span>
          <input
            className={styles.input}
            type="tel"
            maxLength={10}
            placeholder="Enter 10-digit number"
            value={mobile}
            onChange={(e) => dispatch(setMobile(e.target.value.replace(/\D/g, '').slice(0, 10)))}
            disabled={isOtpSent}
          />
        </div>
        {!isOtpSent && (
          <button
            className={`${styles.btn} ${mobile.length !== 10 ? styles.disabled : ''}`}
            disabled={mobile.length !== 10}
            onClick={() => dispatch(generateAndSendOtp())}
          >
            Send OTP
          </button>
        )}
      </div>

            {isOtpSent && !success && (
        <div className={styles.otpAlert}>
          <div className={styles.otpAlertLeft}>
            <span className={styles.otpAlertLabel}>Your OTP</span>
            <span className={styles.otpCode}>{generatedOtp}</span>
          </div>
          <button className={`${styles.copyBtn} ${copied ? styles.copiedBtn : ''}`} onClick={handleCopy} type="button" title="Copy OTP">
            {copied ? <><FaCheck /> Copied</> : <><FaCopy /> Copy</>}
          </button>
        </div>
      )}

            {isOtpSent && !success && (
        <div className={styles.group}>
          <label className={styles.label}>Enter OTP</label>
          <div className={`${styles.otpBoxes} ${error ? styles.shake : ''}`} onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={refs[i]}
                className={`${styles.otpBox} ${error ? styles.otpError : ''}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigit(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
              />
            ))}
          </div>
          {error && <p className={styles.errorMsg}>Wrong OTP. Try again.</p>}
          <button
            className={`${styles.btn} ${!allFilled ? styles.disabled : ''}`}
            disabled={!allFilled}
            onClick={handleVerify}
          >
            Verify OTP
          </button>
        </div>
      )}

            {success && (
        <div className={styles.successBox}>
          <FaCheckCircle className={styles.successIcon} />
          <div>
            <p className={styles.successText}>Mobile Verified!</p>
            <p className={styles.successSub}>Moving to next step...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2;
