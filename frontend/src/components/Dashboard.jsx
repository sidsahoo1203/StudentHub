import React, { useState, useEffect } from 'react';
import { studentService } from '../services/api';
import { FiUsers, FiClock, FiCheckCircle, FiXCircle, FiList } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await studentService.getDashboardStats();
            setStats(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load dashboard statistics.');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loader-container">
                <div className="loader"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-400">
                <p>{error}</p>
                <button onClick={fetchStats} className="btn btn-primary mt-4">Retry</button>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>Dashboard Overview</h1>
                    <p className="text-muted" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                        Welcome back, here is what's happening today.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/students/new')}>
                    + New Application
                </button>
            </div>

            <div className="stats-grid mt-6">
                <div className="glass-panel stat-card" style={{ borderLeft: '4px solid #4F46E5' }}>
                    <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.2)', color: '#818cf8' }}>
                        <FiUsers />
                    </div>
                    <div className="stat-info">
                        <h3>Total Applications</h3>
                        <p>{stats.totalStudents || 0}</p>
                    </div>
                </div>

                <div className="glass-panel stat-card" style={{ borderLeft: '4px solid #10B981' }}>
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                        <FiCheckCircle />
                    </div>
                    <div className="stat-info">
                        <h3>Approved</h3>
                        <p>{stats.approved || 0}</p>
                    </div>
                </div>

                <div className="glass-panel stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                        <FiClock />
                    </div>
                    <div className="stat-info">
                        <h3>Pending</h3>
                        <p>{stats.pending || 0}</p>
                    </div>
                </div>

                <div className="glass-panel stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                        <FiXCircle />
                    </div>
                    <div className="stat-info">
                        <h3>Rejected</h3>
                        <p>{stats.rejected || 0}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 mt-8" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiList size={20} /> Department Distribution
                    </h2>
                    <div style={{ marginTop: '1.5rem' }}>
                        {stats.departmentStats && stats.departmentStats.length > 0 ? (
                            <ul style={{ listStyle: 'none' }}>
                                {stats.departmentStats.map((item, idx) => (
                                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px dashed var(--border)' }}>
                                        <span style={{ color: 'var(--text-main)' }}>{item[0]}</span>
                                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontWeight: 'bold' }}>{item[1]}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>No department data available.</p>
                        )}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiList size={20} /> Course Distribution
                    </h2>
                    <div style={{ marginTop: '1.5rem' }}>
                        {stats.courseStats && stats.courseStats.length > 0 ? (
                            <ul style={{ listStyle: 'none' }}>
                                {stats.courseStats.map((item, idx) => (
                                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px dashed var(--border)' }}>
                                        <span style={{ color: 'var(--text-main)' }}>{item[0]}</span>
                                        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontWeight: 'bold' }}>{item[1]}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>No course data available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
