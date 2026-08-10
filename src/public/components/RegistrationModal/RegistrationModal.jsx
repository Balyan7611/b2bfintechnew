import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeModal } from '../../../store/slices/registrationSlice';
import { FaTimes } from 'react-icons/fa';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import styles from './RegistrationModal.module.css';

const STEP_LABELS = ['Member Type', 'Verify Mobile', 'PAN Check', 'Complete'];

const RegistrationModal = () => {
  const dispatch = useDispatch();
  const { isOpen, currentStep } = useSelector((s) => s.registration);

  const handleClose = useCallback(() => dispatch(closeModal()), [dispatch]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1 />;
      case 2: return <Step2 />;
      case 3: return <Step3 />;
      case 4: return <Step4 onComplete={handleClose} />;
      default: return null;
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Registration Details</h2>
          <div className={styles.headerRight}>
            <span className={styles.stepIndicator}>Step {currentStep} of 4</span>
            <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
              <FaTimes />
            </button>
          </div>
        </div>

                <div className={styles.progressBar}>
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              className={`${styles.seg} ${i < currentStep - 1 ? styles.segDone : ''} ${i === currentStep - 1 ? styles.segActive : ''}`}
            />
          ))}
        </div>

                <div className={styles.stepLabels}>
          {STEP_LABELS.map((label, i) => (
            <span
              key={i}
              className={`${styles.stepLabel} ${i === currentStep - 1 ? styles.labelActive : ''} ${i < currentStep - 1 ? styles.labelDone : ''}`}
            >
              {i < currentStep - 1 ? '✓ ' : ''}{label}
            </span>
          ))}
        </div>

                <div className={styles.body} key={currentStep}>
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;
