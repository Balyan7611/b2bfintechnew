import React, { useState } from 'react';
import {
  FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { FaFileExcel, FaFilePdf, FaFileCsv, FaCopy, FaPrint, FaRegMessage } from 'react-icons/fa';
import styles from '../MemberPages/MemberPages.module.css';

const SMSTemplate = () => {
  const templates = [];

  return (
    <div className={styles.container}>
      <div className={styles.cardFullMobile}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '25px 30px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0D1B3E' }}>Manage SMS Templates</h3>
          <button className={styles.addBtn} style={{ height: '42px', padding: '0 22px', fontSize: '0.85rem', borderRadius: '10px', background: '#1756AA', fontWeight: 700 }}>
            <FiPlus /> <span>New Template</span>
          </button>
        </div>

        {/* TOOLBAR */}
        <div style={{ padding: '0 30px 25px 30px' }}>
          <div style={{ background: '#F8FAFF', borderRadius: '20px', padding: '25px', border: '1px solid #EEF3FC' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '25px', color: '#4E6080', fontSize: '0.9rem', fontWeight: 600 }}>
              Show <select className={styles.selectEntries} style={{ margin: '0', width: '70px', height: '38px', borderRadius: '10px' }}><option value={10}>10</option></select> entries
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '25px' }}>
              <button className="global-export-btn btn-copy" style={{ width: '42px', height: '42px', borderRadius: '10px' }}><FaCopy /></button>
              <button className="global-export-btn btn-excel" style={{ width: '42px', height: '42px', borderRadius: '10px' }}><FaFileExcel /></button>
              <button className="global-export-btn btn-pdf" style={{ width: '42px', height: '42px', borderRadius: '10px' }}><FaFilePdf /></button>
              <button className="global-export-btn btn-csv" style={{ width: '42px', height: '42px', borderRadius: '10px' }}><FaFileCsv /></button>
              <button className="global-export-btn btn-print" style={{ width: '42px', height: '42px', borderRadius: '10px' }}><FaPrint /></button>
            </div>
            <div className="global-search-box" style={{ maxWidth: '100%', width: '100%', margin: '0' }}>
              <FiSearch style={{ left: '18px' }} />
              <input type="text" placeholder="Search templates..." style={{ borderRadius: '12px', height: '48px', paddingLeft: '50px', border: '1.5px solid #E2E8F0' }} />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className={styles.tableWrapper} style={{ borderTop: '1px solid #F1F5F9' }}>
          <table className={styles.table} style={{ minWidth: '1300px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #0D1B5E 0%, #1a2f8a 100%)' }}>
                <th style={{ width: '80px', paddingLeft: '30px' }}>S.NO</th>
                <th style={{ width: '120px', textAlign: 'center' }}>ACTION</th>
                <th style={{ width: '250px' }}>CATEGORY NAME</th>
                <th style={{ width: '500px' }}>TEMPLATE CONTENT</th>
                <th style={{ width: '150px', textAlign: 'center' }}>TEMPLATE ID</th>
                <th style={{ textAlign: 'right', width: '200px', paddingRight: '30px' }}>ADD DATE</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr>
                  <td colSpan="100%" style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>No data available</td>
                </tr>
              ) : templates.map((tpl, idx) => (
                <tr key={tpl.id} className={styles.hoverRow}>
                  <td style={{ paddingLeft: '30px', fontWeight: 700, color: '#A0AEC0' }}>0{idx + 1}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className={styles.editBtn} style={{ width: '34px', height: '34px' }}><FiEdit /></button>
                      <button className={styles.deleteBtn} style={{ background: 'rgba(229, 62, 62, 0.08)', color: '#E53E3E', border: 'none', width: '34px', height: '34px' }}><FiTrash2 /></button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FaRegMessage style={{ color: '#1756AA' }} />
                      <span style={{ color: '#1756AA', fontSize: '0.95rem', fontWeight: 800 }}>{tpl.category}</span></div></td>
                  <td>
                    <div style={{ padding: '10px 15px', background: '#F8FAFF', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.85rem', color: '#4E6080', fontWeight: 600, lineHeight: 1.6 }}>
                      {tpl.content}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ background: '#F1F5F9', color: '#1756AA', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'monospace' }}>
                      {tpl.templateId}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#718096', fontSize: '0.85rem', paddingRight: '30px' }}>{tpl.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '0.9rem', color: '#718096', fontWeight: 600 }}>Showing 1 of 1 records</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="global-page-btn" style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fff', border: '1.5px solid #E2E8F0' }}><FiChevronLeft /></button>
            <div style={{ width: '42px', height: '42px', background: '#1756AA', color: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>1</div>
            <button className="global-page-btn" style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fff', border: '1.5px solid #E2E8F0' }}><FiChevronRight /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSTemplate;
