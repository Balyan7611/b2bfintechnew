import React, { useState, useEffect } from 'react';
import {
    FaHardHat,
    FaUserPlus,
    FaUserEdit,
    FaTrashAlt,
    FaSave,
    FaCalendarAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaHistory,
    FaFilter,
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaTimes,
} from 'react-icons/fa';
import { API } from '../../../api/endpoints';
import styles from './Attendance.module.css';

const Attendance = () => {
    // ─── State ──────────────────────────────────────────────
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState({}); // { 'YYYY-MM-DD': { employeeId: 'present'|'absent'|'halfday' } }
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showAddEmployee, setShowAddEmployee] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [employeeForm, setEmployeeForm] = useState({
        name: '',
        email: '',
        contact: '',
        department: '',
        designation: '',
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('all');
    const [showHistory, setShowHistory] = useState(false);
    const [historyDate, setHistoryDate] = useState(new Date());
    const [historyEmployeeFilter, setHistoryEmployeeFilter] = useState(null); // null = all employees
    const [historyDepartmentFilter, setHistoryDepartmentFilter] = useState('all');

    // ─── Fetch Members (Dynamic) ──────────────────────────
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await API.member.getAll({ pageSize: 5000 });
                let fetchedMembers = [];
                if (res) {
                    if (Array.isArray(res)) fetchedMembers = res;
                    else if (Array.isArray(res.data)) fetchedMembers = res.data;
                    else if (res.data && Array.isArray(res.data.items)) fetchedMembers = res.data.items;
                    else if (res.data && Array.isArray(res.data.data)) fetchedMembers = res.data.data;
                    else if (Array.isArray(res.items)) fetchedMembers = res.items;
                    else if (res.data && res.data.memberList && Array.isArray(res.data.memberList)) fetchedMembers = res.data.memberList;
                    else if (res.memberList && Array.isArray(res.memberList)) fetchedMembers = res.memberList;
                }
                
                const mappedMembers = fetchedMembers.map(m => {
                    const fname = m.firstName || m.FirstName || m.first_name || '';
                    const lname = m.lastName || m.LastName || m.last_name || '';
                    const mname = m.name || m.Name || m.name_ || '';
                    const email = m.email || m.Email || m.emailId || m.email_id || '';
                    const mobile = m.mobile || m.Mobile || m.phone || m.contact || '';
                    const role = m.role || m.Role || m.roleName || m.RoleName || m.userType || m.department || 'Member';
                    const pack = m.package || m.Package || m.packageName || m.designation || 'Standard';

                    return {
                        id: m.id || m.Id || m.memberId || m.MemberId,
                        name: mname || `${fname} ${lname}`.trim() || 'Unknown User',
                        email: email,
                        contact: mobile,
                        department: role,
                        designation: pack,
                        original: m
                    };
                });
                
                setEmployees(mappedMembers);

                // Setup default attendance state for today
                const todayStr = new Date().toISOString().split('T')[0];
                const initialAttendance = {};
                mappedMembers.forEach(emp => {
                    if (emp.id) {
                        initialAttendance[emp.id] = 'not marked';
                    }
                });
                setAttendance(prev => ({ ...prev, [todayStr]: prev[todayStr] || initialAttendance }));
            } catch (err) {
                console.error("Failed to fetch members:", err);
            }
        };
        fetchMembers();
    }, []);

    // ─── Handlers ────────────────────────────────────────────

    const formatDate = (date) => date.toISOString().split('T')[0];
    const dateStr = formatDate(selectedDate);
    const todayStr = formatDate(new Date());

    const getAttendanceForDate = (dateStr) => attendance[dateStr] || {};
    const currentDayAttendance = getAttendanceForDate(dateStr);

    const updateAttendance = (employeeId, status) => {
        setAttendance(prev => {
            const updated = { ...prev };
            if (!updated[dateStr]) updated[dateStr] = {};
            updated[dateStr] = { ...updated[dateStr], [employeeId]: status };
            return updated;
        });
    };

    const saveAttendance = () => {
        console.log('Saving attendance for', dateStr, currentDayAttendance);
        alert(`Attendance for ${dateStr} saved successfully!`);
    };

    // Employee CRUD
    // Edit / Delete (Optional now that it's synced)
    const editEmployee = (employee) => {
        // Normally we'd redirect to a member edit page
        alert(`Cannot edit member ${employee.name} here. Use the main Member Management section.`);
    };

    // Filter employees for main table
    const filteredEmployees = employees.filter(emp => {
        if (!emp || !emp.id) return false;
        
        const empName = (emp.name || '').toLowerCase();
        const empEmail = (emp.email || '').toLowerCase();
        const empContact = (emp.contact || '').toLowerCase();
        const searchLower = (searchTerm || '').toLowerCase();

        const matchesSearch = empName.includes(searchLower) ||
            empEmail.includes(searchLower) ||
            empContact.includes(searchLower);
            
        const matchesDept = filterDepartment === 'all' || emp.department === filterDepartment;
        return matchesSearch && matchesDept;
    });

    const departments = ['all', ...new Set(employees.map(e => e.department))];

    // History data for a given month with filters
    const getMonthHistory = () => {
        const year = historyDate.getFullYear();
        const month = historyDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const historyData = [];

        // Get list of employees to show (filtered)
        let targetEmployees = employees;
        if (historyEmployeeFilter !== null) {
            targetEmployees = employees.filter(e => e.id === historyEmployeeFilter);
        } else if (historyDepartmentFilter !== 'all') {
            targetEmployees = employees.filter(e => e.department === historyDepartmentFilter);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateObj = new Date(year, month, day);
            const dateStrLocal = formatDate(dateObj);
            const dayAttendance = attendance[dateStrLocal] || {};
            targetEmployees.forEach(emp => {
                const status = dayAttendance[emp.id] || 'not marked';
                historyData.push({
                    date: dateStrLocal,
                    employeeId: emp.id,
                    employeeName: emp.name,
                    department: emp.department,
                    status,
                });
            });
        }
        return historyData;
    };

    const historyData = getMonthHistory();

    // ─── Render Helpers ──────────────────────────────────────

    const StatusBadge = ({ status }) => {
        const statusMap = {
            present: { label: 'Present', icon: <FaCheckCircle />, className: styles.present },
            absent: { label: 'Absent', icon: <FaTimesCircle />, className: styles.absent },
            halfday: { label: 'Half Day', icon: <FaClock />, className: styles.halfday },
            'not marked': { label: 'Not Marked', icon: <FaClock />, className: styles.notMarked },
        };
        const info = statusMap[status] || statusMap['not marked'];
        return (
            <span className={`${styles.statusBadge} ${info.className}`}>
                {info.icon} {info.label}
            </span>
        );
    };

    // Clear history employee filter
    const clearHistoryEmployeeFilter = () => setHistoryEmployeeFilter(null);

    // ─── Main Render ──────────────────────────────────────────

    return (
        <div className={styles.attendanceContainer}>
            {/* ─── Banner ────────────────────────────────────── */}
            <div className={styles.banner}>
                <div className={styles.bannerContent}>
                    <div className={styles.bannerLeft}>
                        <div className={styles.bannerIcon}>
                            <FaHardHat />
                        </div>
                        <div>
                            <h1>Attendance Management</h1>
                            <p>
                                <FaCalendarAlt /> Admin Panel · Manage employee attendance
                            </p>
                        </div>
                    </div>
                    <div className={styles.bannerRight}>
                        <div className={styles.dateDisplay}>
                            <button onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() - 1)))}>
                                <FaChevronLeft />
                            </button>
                            <span>{selectedDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            <button onClick={() => setSelectedDate(prev => new Date(prev.setDate(prev.getDate() + 1)))}>
                                <FaChevronRight />
                            </button>
                            {dateStr !== todayStr && (
                                <button className={styles.todayBtn} onClick={() => setSelectedDate(new Date())}>
                                    Today
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Main Table ────────────────────────────────── */}
            <div className={styles.attendanceTableWrapper}>
                <div className={styles.tableHeader}>
                    <h3>Employees · Mark Attendance</h3>
                    <div className={styles.tableFilters}>
                        <div className={styles.searchBox}>
                            <FaSearch />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            className={styles.filterSelect}
                        >
                            {departments.map(dept => (
                                <option key={dept} value={dept}>
                                    {dept === 'all' ? 'All Departments' : dept}
                                </option>
                            ))}
                        </select>
                        <button className={styles.iconBtn} onClick={saveAttendance} title="Save Attendance">
                            <FaSave />
                        </button>
                        <button className={`${styles.iconBtn} ${showHistory ? styles.activeIcon : ''}`} onClick={() => { setShowHistory(!showHistory); if (showHistory) { setHistoryEmployeeFilter(null); setHistoryDepartmentFilter('all'); } }} title="View History">
                            <FaHistory />
                        </button>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.attendanceTable}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Contact</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className={styles.emptyRow}>No members found. (Checking API sync...)</td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp, index) => {
                                    const currentStatus = currentDayAttendance[emp.id] || 'not marked';
                                    return (
                                        <tr key={emp.id}>
                                            <td>{index + 1}</td>
                                            <td><strong>{emp.name}</strong></td>
                                            <td>{emp.email}</td>
                                            <td>{emp.contact}</td>
                                            <td>{emp.department}</td>
                                            <td>
                                                <select
                                                    value={currentStatus}
                                                    onChange={(e) => updateAttendance(emp.id, e.target.value)}
                                                    className={styles.statusSelect}
                                                >
                                                    <option value="present">Present</option>
                                                    <option value="absent">Absent</option>
                                                    <option value="halfday">Half Day</option>
                                                    <option value="not marked">Not Marked</option>
                                                </select>
                                            </td>
                                            <td>
                                                <div className={styles.actionIcons}>
                                                    <button onClick={() => { setShowHistory(true); setHistoryEmployeeFilter(emp.id); setHistoryDepartmentFilter('all'); }} title="View Attendance History">
                                                        <FaHistory />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Summary Row */}
                <div className={styles.summaryRow}>
                    <span>Total: {employees.length}</span>
                    <span>Present: {Object.values(currentDayAttendance).filter(s => s === 'present').length}</span>
                    <span>Absent: {Object.values(currentDayAttendance).filter(s => s === 'absent').length}</span>
                    <span>Half Day: {Object.values(currentDayAttendance).filter(s => s === 'halfday').length}</span>
                    <span>Not Marked: {employees.length - Object.values(currentDayAttendance).filter(s => s !== 'not marked').length}</span>
                </div>
            </div>

            {/* ─── History Section ──────────────────────────── */}
            {showHistory && (
                <div className={styles.historySection}>
                    <div className={styles.historyHeader}>
                        <h3>
                            <FaHistory /> Attendance History
                            {historyEmployeeFilter !== null && (
                                <span className={styles.filterChip}>
                                    Employee: {employees.find(e => e.id === historyEmployeeFilter)?.name}
                                    <FaTimes onClick={clearHistoryEmployeeFilter} className={styles.chipClose} />
                                </span>
                            )}
                        </h3>
                        <div className={styles.historyControls}>
                            <select
                                value={historyDepartmentFilter}
                                onChange={(e) => { setHistoryDepartmentFilter(e.target.value); setHistoryEmployeeFilter(null); }}
                                className={styles.filterSelect}
                            >
                                <option value="all">All Departments</option>
                                {departments.filter(d => d !== 'all').map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                            <div className={styles.monthNavigator}>
                                <button onClick={() => setHistoryDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
                                    <FaChevronLeft />
                                </button>
                                <span>{historyDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                <button onClick={() => setHistoryDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                                    <FaChevronRight />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.historyTableWrapper}>
                        <table className={styles.historyTable}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Employee</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyData.length === 0 ? (
                                    <tr><td colSpan="4" className={styles.emptyRow}>No records for this period</td></tr>
                                ) : (
                                    historyData.map((record, idx) => (
                                        <tr key={idx}>
                                            <td>{record.date}</td>
                                            <td>{record.employeeName}</td>
                                            <td>{record.department}</td>
                                            <td><StatusBadge status={record.status} /></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Attendance;