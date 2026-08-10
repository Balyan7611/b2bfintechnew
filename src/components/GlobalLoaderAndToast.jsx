import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearNotification } from '../store/slices/uiSlice';
import { FaSpinner, FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import styles from './GlobalLoaderAndToast.module.css';

export const GlobalLoaderAndToast = () => {
    const dispatch = useDispatch();
    const globalLoading = useSelector((state) => state.ui.globalLoading);
    const globalNotification = useSelector((state) => state.ui.globalNotification);

    useEffect(() => {
        if (globalNotification) {
                        const timer = setTimeout(() => {
                dispatch(clearNotification());
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [globalNotification, dispatch]);

    return (
        <>
                        {globalLoading && (
                <div className={styles.loaderOverlay}>
                    <div className={styles.loaderContent}>
                        <FaSpinner className={styles.spinner} />
                        <span className={styles.loaderText}>Processing...</span>
                    </div>
                </div>
            )}

                        {globalNotification && (
                <div 
                    className={`${styles.toast} ${
                        globalNotification.type === 'success' ? styles.toastSuccess : styles.toastError
                    }`}
                >
                    <div className={styles.toastIconBox}>
                        {globalNotification.type === 'success' ? (
                            <FaCheckCircle className={styles.successIcon} />
                        ) : (
                            <FaExclamationCircle className={styles.errorIcon} />
                        )}
                    </div>
                    <div className={styles.toastMessage}>
                        {globalNotification.message}
                    </div>
                    <button 
                        className={styles.closeBtn} 
                        onClick={() => dispatch(clearNotification())}
                    >
                        <FaTimes />
                    </button>
                </div>
            )}
        </>
    );
};

export default GlobalLoaderAndToast;
