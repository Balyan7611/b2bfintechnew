import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Step4.module.css';

const Step4 = ({ onComplete }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 3000;
    const raf = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (elapsed < duration) {
        requestAnimationFrame(raf);
      } else {
        onComplete();
        navigate('/register');
      }
    };
    const id = requestAnimationFrame(raf);
    return () => cancelAnimationFrame(id);
  }, [onComplete, navigate]);
  return (
    <div className={styles.container}>
            <div className={styles.checkWrap}>
        <svg viewBox="0 0 80 80" className={styles.checkSvg}>
          <circle className={styles.bgCircle} cx="40" cy="40" r="37" />
          <circle className={styles.circle} cx="40" cy="40" r="37" fill="none" />
          <path className={styles.tick} fill="none" d="M22 41l12 12 24-24" />
        </svg>
      </div>

      <h3 className={styles.title}>Registration Successful!</h3>
      <p className={styles.sub}>Redirecting to complete your profile...</p>

            <div className={styles.countdownWrap}>
        <div className={styles.countdownBar} style={{ width: `${progress}%` }} />
      </div>
      <p className={styles.countdownLabel}>{Math.ceil(3 - (progress / 100) * 3)}s</p>
    </div>
  );
};

export default Step4;
