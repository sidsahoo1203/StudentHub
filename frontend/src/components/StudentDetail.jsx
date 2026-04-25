import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../services/api';
import { FiArrowLeft, FiEdit2, FiTrash2, FiClock, FiCalendar, FiMapPin, FiBookOpen, FiAward, FiAlertTriangle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        fetchStudent();
    }, [id]);

    const fetchStudent = async () => {
        try {
            const res = await studentService.getById(id);
            setStudent(res.data);
        } catch (err) {
            toast.error('Failed to load student details');
            navigate('/students');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setStatusUpdating(true);
        try {
            await studentService.updateStatus(id, newStatus);
            setStudent(prev => ({ ...prev, applicationStatus: newStatus }));
            toast.success('Application status updated');
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this application? This cannot be undone.')) {
            try {
                await studentService.delete(id);
                toast.success('Student deleted successfully');
                navigate('/students');
            } catch (err) {
                toast.error('Failed to delete application');
            }
        }
    };

    const getStatusBadgeClass = (status) => {
        if (!status) return 'badge badge-pending';
        return `badge badge-${status.toLowerCase()}`;
    };

    const renderEligibilityAlert = () => {
        if (!student.eligibilityStatus) return null;
        
        let color, Icon, bg;
        if (student.eligibilityStatus === 'ELIGIBLE') {
            color = '#34d399'; bg = 'rgba(16, 185, 129, 0.1)'; Icon = FiCheckCircle;
        } else if (student.eligibilityStatus === 'NOT_ELIGIBLE') {
            color = '#f87171'; bg = 'rgba(239, 68, 68, 0.1)'; Icon = FiXCircle;
        } else {
            color = '#fbbf24'; bg = 'rgba(245, 158, 11, 0.1)'; Icon = FiAlertTriangle;
        }

        return (
            <div style={{ background: bg, border: `1px solid ${color}`, padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Icon color={color} size={20} style={{ marginTop: '2px' }} />
                <div>
                    <h4 style={{ color: color, marginBottom: '0.25rem', fontWeight: '600', textTransform: 'capitalize' }}>
                        System Validation: {student.eligibilityStatus.replace('_', ' ')}
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{student.eligibilityReason}</p>
                </div>
            </div>
        );
    };

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;
    if (!student) return null;

    return (
        <div>
            <div className="page-header" style={{ alignItems: 'flex-start' }}>
                <div>
                    <button className="btn btn-secondary" style={{ marginBottom: '1rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => navigate('/students')}>
                        <FiArrowLeft /> Back to List
                    </button>
                    <h1>{student.firstName} {student.lastName}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                        <p className="text-muted">{student.email}</p>
                        <span className={getStatusBadgeClass(student.applicationStatus)}>
                            {student.applicationStatus.replace('_', ' ')}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => navigate(`/students/${id}/edit`)}>
                        <FiEdit2 /> Edit
                    </button>
                    <button className="btn btn-danger" onClick={handleDelete}>
                        <FiTrash2 /> Delete
                    </button>
                </div>
            </div>

            <div className="detail-grid mt-6">
                <div>
                    {renderEligibilityAlert()}

                    <div className="glass-panel detail-section">
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiBookOpen color="var(--primary)" /> Application Details
                        </h3>
                        <div className="form-row">
                            <div className="detail-item">
                                <div className="detail-label">Course Applied For</div>
                                <div className="detail-value">{student.course}</div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">Department</div>
                                <div className="detail-value">{student.department}</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel detail-section">
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiAward color="var(--primary)" /> Academic History
                        </h3>
                        {student.academicRecords && student.academicRecords.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {student.academicRecords.map((record, index) => (
                                    <div key={index} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <strong style={{ fontSize: '1.1rem' }}>{record.degreeType}</strong>
                                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                                Class of {record.yearOfPassing}
                                            </span>
                                        </div>
                                        <p style={{ margin: '0.25rem 0', color: 'var(--text-main)' }}>{record.institutionName}</p>
                                        <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{record.boardOrUniversity}</p>
                                        <div style={{ marginTop: '0.75rem', fontWeight: '600' }}>
                                            Score: {record.score} {record.scoreType === 'PERCENTAGE' ? '%' : 'CGPA'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted italic">No academic records provided.</p>
                        )}
                    </div>

                    <div className="glass-panel detail-section">
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiCalendar color="var(--primary)" /> Personal Information
                        </h3>
                        <div className="form-row">
                            <div className="detail-item">
                                <div className="detail-label">Date of Birth</div>
                                <div className="detail-value">{new Date(student.dateOfBirth).toLocaleDateString()}</div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">Gender</div>
                                <div className="detail-value">{student.gender}</div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">Phone</div>
                                <div className="detail-value">{student.phone}</div>
                            </div>
                        </div>
                        <div className="form-row mt-4">
                            <div className="detail-item">
                                <div className="detail-label">Guardian/Parent Name</div>
                                <div className="detail-value">{student.guardianName || 'N/A'}</div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">Guardian Phone</div>
                                <div className="detail-value">{student.guardianPhone || 'N/A'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel detail-section">
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiBookOpen color="var(--primary)" /> Statement of Purpose
                        </h3>
                        <p style={{ lineHeight: '1.6', color: 'var(--text-main)', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                            {student.statementOfPurpose || 'No Statement of Purpose provided.'}
                        </p>
                    </div>

                    <div className="glass-panel detail-section">
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiMapPin color="var(--primary)" /> Address details
                        </h3>
                        <div className="detail-item">
                            <div className="detail-label">Full Address</div>
                            <div className="detail-value">{student.address}</div>
                        </div>
                        <div className="form-row mt-4">
                            <div className="detail-item"><div className="detail-label">City</div><div className="detail-value">{student.city}</div></div>
                            <div className="detail-item"><div className="detail-label">State</div><div className="detail-value">{student.state}</div></div>
                            <div className="detail-item"><div className="detail-label">Pincode</div><div className="detail-value">{student.pincode}</div></div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="glass-panel detail-section" style={{ background: 'rgba(79, 70, 229, 0.05)', borderColor: 'rgba(79, 70, 229, 0.2)' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: '#818cf8' }}>Application Fee</h3>
                        <div style={{ padding: '0.75rem', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', marginBottom: '2rem',
                            background: student.feeStatus === 'PAID' ? 'rgba(52, 211, 153, 0.2)' : student.feeStatus === 'WAIVED' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                            color: student.feeStatus === 'PAID' ? '#34d399' : student.feeStatus === 'WAIVED' ? '#60a5fa' : '#fbbf24'
                        }}>
                            {student.feeStatus || 'PENDING'}
                        </div>

                        <h3 style={{ marginBottom: '1.5rem', color: '#818cf8' }}>Application Status</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button className={`btn ${student.applicationStatus === 'PENDING' ? 'btn-primary' : 'btn-secondary'}`} style={student.applicationStatus === 'PENDING' ? { background: '#fbbf24', color: '#000' } : {}} onClick={() => handleStatusUpdate('PENDING')} disabled={statusUpdating}>Set as Pending</button>
                            <button className={`btn ${student.applicationStatus === 'UNDER_REVIEW' ? 'btn-primary' : 'btn-secondary'}`} style={student.applicationStatus === 'UNDER_REVIEW' ? { background: '#60a5fa' } : {}} onClick={() => handleStatusUpdate('UNDER_REVIEW')} disabled={statusUpdating}>Mark Under Review</button>
                            <button className={`btn ${student.applicationStatus === 'APPROVED' ? 'btn-primary' : 'btn-secondary'}`} style={student.applicationStatus === 'APPROVED' ? { background: '#34d399' } : {}} onClick={() => handleStatusUpdate('APPROVED')} disabled={statusUpdating}>Approve Application</button>
                            <button className={`btn ${student.applicationStatus === 'WAITLISTED' ? 'btn-primary' : 'btn-secondary'}`} style={student.applicationStatus === 'WAITLISTED' ? { background: '#c084fc' } : {}} onClick={() => handleStatusUpdate('WAITLISTED')} disabled={statusUpdating}>Move to Waitlist</button>
                            <button className={`btn ${student.applicationStatus === 'REJECTED' ? 'btn-primary' : 'btn-secondary'}`} style={student.applicationStatus === 'REJECTED' ? { background: '#f87171' } : {}} onClick={() => handleStatusUpdate('REJECTED')} disabled={statusUpdating}>Reject Application</button>
                        </div>
                        {student.createdAt && (
                            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <FiClock /> Submitted on {new Date(student.createdAt).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                    <div className="glass-panel detail-section mt-6">
                        <h3 style={{ marginBottom: '1rem' }}>Admin Notes</h3>
                        {student.notes ? (
                            <p style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', lineHeight: '1.5' }}>{student.notes}</p>
                        ) : <p className="text-muted italic" style={{ fontStyle: 'italic' }}>No notes added yet.</p>}
                        <button className="btn btn-secondary mt-4 w-full" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate(`/students/${id}/edit`)}>Update Notes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;
