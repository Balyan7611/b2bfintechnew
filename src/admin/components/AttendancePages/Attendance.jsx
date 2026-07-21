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

    // ─── Mock Employees (initial) ──────────────────────────
    useEffect(() => {
        const mockEmployees = [
            { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', contact: '9876543210', department: 'Engineering', designation: 'Senior Developer' },
            { id: 2, name: 'Priya Patel', email: 'priya@example.com', contact: '9876543211', department: 'Design', designation: 'UI/UX Designer' },
            { id: 3, name: 'Amit Kumar', email: 'amit@example.com', contact: '9876543212', department: 'Marketing', designation: 'Marketing Lead' },
            { id: 4, name: 'Sneha Reddy', email: 'sneha@example.com', contact: '9876543213', department: 'Engineering', designation: 'Frontend Developer' },
            { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', contact: '9876543214', department: 'HR', designation: 'HR Manager' },
            { id: 6, name: 'Ananya Gupta', email: 'ananya@example.com', contact: '9876543215', department: 'Engineering', designation: 'Backend Developer' },
            { id: 7, name: 'Deepak Verma', email: 'deepak@example.com', contact: '9876543216', department: 'Finance', designation: 'Finance Analyst' },
        ];
        setEmployees(mockEmployees);

        const todayStr = new Date().toISOString().split('T')[0];
        const mockAttendance = {};
        mockEmployees.forEach(emp => {
            const statuses = ['present', 'present', 'present', 'absent', 'halfday'];
            mockAttendance[emp.id] = statuses[Math.floor(Math.random() * statuses.length)];
        });
        setAttendance({ [todayStr]: mockAttendance });
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
    const addEmployee = (e) => {
        e.preventDefault();
        const newEmployee = {
            id: Date.now(),
            ...employeeForm,
        };
        setEmployees([...employees, newEmployee]);
        setEmployeeForm({ name: '', email: '', contact: '', department: '', designation: '' });
        setShowAddEmployee(false);
    };

    const editEmployee = (employee) => {
        setEditingEmployee(employee);
        setEmployeeForm(employee);
        setShowAddEmployee(true);
    };

    const updateEmployee = (e) => {
        e.preventDefault();
        setEmployees(employees.map(emp =>
            emp.id === editingEmployee.id ? { ...emp, ...employeeForm } : emp
        ));
        setEmployeeForm({ name: '', email: '', contact: '', department: '', designation: '' });
        setEditingEmployee(null);
        setShowAddEmployee(false);
    };

    const deleteEmployee = (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            setEmployees(employees.filter(emp => emp.id !== id));
            const newAttendance = { ...attendance };
            Object.keys(newAttendance).forEach(date => {
                if (newAttendance[date][id]) delete newAttendance[date][id];
            });
            setAttendance(newAttendance);
        }
    };

    // Filter employees for main table
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.contact.includes(searchTerm);
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
                        <button className={styles.iconBtn} onClick={() => { setShowAddEmployee(true); setEditingEmployee(null); setEmployeeForm({ name: '', email: '', contact: '', department: '', designation: '' }); }} title="Add Employee">
                            <FaUserPlus />
                        </button>
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
                                    <td colSpan="7" className={styles.emptyRow}>No employees found. Add some!</td>
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
                                                    <button onClick={() => editEmployee(emp)} title="Edit Employee">
                                                        <FaUserEdit />
                                                    </button>
                                                    <button onClick={() => { setShowHistory(true); setHistoryEmployeeFilter(emp.id); setHistoryDepartmentFilter('all'); }} title="View Employee History">
                                                        <FaHistory />
                                                    </button>
                                                    <button onClick={() => deleteEmployee(emp.id)} title="Delete Employee">
                                                        <FaTrashAlt />
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

            {/* ─── Employee Modal ───────────────────────────── */}
            {showAddEmployee && (
                <div className={styles.modalOverlay} onClick={() => setShowAddEmployee(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
                            <button className={styles.closeBtn} onClick={() => setShowAddEmployee(false)}>×</button>
                        </div>
                        <form onSubmit={editingEmployee ? updateEmployee : addEmployee} className={styles.employeeForm}>
                            <div className={styles.formGroup}>
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    value={employeeForm.name}
                                    onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={employeeForm.email}
                                        onChange={e => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Contact *</label>
                                    <input
                                        type="text"
                                        value={employeeForm.contact}
                                        onChange={e => setEmployeeForm({ ...employeeForm, contact: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Department</label>
                                    <input
                                        type="text"
                                        value={employeeForm.department}
                                        onChange={e => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                                        placeholder="e.g., Engineering"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Designation</label>
                                    <input
                                        type="text"
                                        value={employeeForm.designation}
                                        onChange={e => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
                                        placeholder="e.g., Senior Developer"
                                    />
                                </div>
                            </div>
                            <button type="submit" className={styles.primaryBtn}>
                                {editingEmployee ? 'Update Employee' : 'Add Employee'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;