import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../services/api';
import { FiSearch, FiEdit2, FiTrash2, FiEye, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, [filterStatus]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            let res;
            if (filterStatus !== 'ALL') {
                res = await studentService.getByStatus(filterStatus);
            } else {
                res = await studentService.getAll();
            }
            setStudents(res.data);
        } catch (err) {
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            fetchStudents();
            return;
        }
        try {
            setLoading(true);
            const res = await studentService.search(searchTerm);
            setStudents(res.data);
        } catch (err) {
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete application for ${name}?`)) {
            try {
                await studentService.delete(id);
                toast.success('Student deleted successfully');
                fetchStudents();
            } catch (err) {
                toast.error('Failed to delete student');
            }
        }
    };

    const getStatusBadgeClass = (status) => {
        return `badge badge-${status.toLowerCase()}`;
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Applications</h1>
                    <p className="text-muted" style={{ marginTop: '0.5rem' }}>Manage all student applications efficiently.</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/students/new')}>
                    + Add New
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <form className="search-bar" onSubmit={handleSearch} style={{ flex: '1', minWidth: '250px' }}>
                        <FiSearch color="#64748b" />
                        <input
                            type="text"
                            placeholder="Search by name, email, course..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FiFilter color="#64748b" />
                        <select
                            className="form-control"
                            style={{ width: 'auto', padding: '0.5rem 1rem' }}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="WAITLISTED">Waitlisted</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="glass-panel table-container">
                {loading ? (
                    <div className="loader-container" style={{ height: '300px' }}>
                        <div className="loader"></div>
                    </div>
                ) : students.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                        <p>No students found matching your criteria.</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Course</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td>#{student.id}</td>
                                    <td style={{ fontWeight: '500' }}>{student.firstName} {student.lastName}<br /><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{student.email}</span></td>
                                    <td>{student.course}</td>
                                    <td>{student.department}</td>
                                    <td>
                                        <span className={getStatusBadgeClass(student.applicationStatus)}>
                                            {student.applicationStatus.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn btn-secondary btn-icon"
                                                onClick={() => navigate(`/students/${student.id}`)}
                                                title="View Details"
                                            >
                                                <FiEye size={16} />
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-icon"
                                                onClick={() => navigate(`/students/${student.id}/edit`)}
                                                title="Edit"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button
                                                className="btn btn-danger btn-icon"
                                                onClick={() => handleDelete(student.id, `${student.firstName} ${student.lastName}`)}
                                                title="Delete"
                                            >
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StudentList;
