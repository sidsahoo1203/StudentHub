import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../services/api';
import { FiSave, FiArrowLeft, FiAlertCircle, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const StudentForm = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        course: '',
        department: '',
        applicationStatus: 'PENDING',
        notes: '',
        academicRecords: []
    });

    const AVAILABLE_COURSES = ['B.Tech', 'M.Tech', 'MBA', 'PhD', 'B.Sc', 'M.Sc'];
    const DEGREE_TYPES = ['10th Standard', '12th Standard', 'Undergraduate', 'Postgraduate', 'Diploma'];

    useEffect(() => {
        if (isEdit) {
            fetchStudent();
        } else {
            // Initialize with one empty academic record
            setFormData(prev => ({
                ...prev,
                academicRecords: [{ degreeType: '', institutionName: '', boardOrUniversity: '', yearOfPassing: '', score: '', scoreType: 'PERCENTAGE' }]
            }));
        }
    }, [id]);

    const fetchStudent = async () => {
        try {
            const res = await studentService.getById(id);
            setFormData(res.data);
        } catch (err) {
            toast.error('Failed to fetch student data');
            navigate('/students');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleAcademicRecordChange = (index, e) => {
        const { name, value } = e.target;
        const newRecords = [...formData.academicRecords];
        newRecords[index] = { ...newRecords[index], [name]: value };
        setFormData(prev => ({ ...prev, academicRecords: newRecords }));
    };

    const addAcademicRecord = () => {
        setFormData(prev => ({
            ...prev,
            academicRecords: [...prev.academicRecords, { degreeType: '', institutionName: '', boardOrUniversity: '', yearOfPassing: '', score: '', scoreType: 'PERCENTAGE' }]
        }));
    };

    const removeAcademicRecord = (index) => {
        const newRecords = formData.academicRecords.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, academicRecords: newRecords }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Email invalid';
        if (!formData.phone) newErrors.phone = 'Phone required';
        else if (!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = 'Must be 10 digits';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'DOB required';
        if (!formData.gender) newErrors.gender = 'Gender required';
        if (!formData.course) newErrors.course = 'Course required';
        if (!formData.department) newErrors.department = 'Department required';
        if (!formData.address) newErrors.address = 'Address required';
        if (!formData.city) newErrors.city = 'City required';
        if (!formData.state) newErrors.state = 'State required';
        if (!formData.pincode) newErrors.pincode = 'Pincode required';
        
        if (formData.academicRecords.length === 0) {
            newErrors.academicRecords = 'At least one academic record is required';
        } else {
            formData.academicRecords.forEach((record, index) => {
                if (!record.degreeType || !record.institutionName || !record.yearOfPassing || !record.score) {
                    newErrors[`academicRecord_${index}`] = 'Please fill all required fields in the academic record';
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix validation errors');
            return;
        }

        setSubmitting(true);
        try {
            if (isEdit) {
                await studentService.update(id, formData);
                toast.success('Student updated and eligibility evaluated successfully');
            } else {
                await studentService.create(formData);
                toast.success('Student application created successfully');
            }
            navigate('/students');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="loader-container"><div className="loader"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1>{isEdit ? 'Edit Application' : 'New Application'}</h1>
                    <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                        {isEdit ? 'Update existing student records' : 'Enter details for the new student applicant'}
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/students')}>
                    <FiArrowLeft /> Back to List
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                    {Object.keys(errors).length > 0 && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <FiAlertCircle color="#ef4444" size={20} style={{ marginTop: '2px' }} />
                            <div><h4 style={{ color: '#f87171', marginBottom: '0.5rem', fontWeight: '600' }}>Please correct the errors below</h4></div>
                        </div>
                    )}

                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Personal Information</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">First Name *</label>
                            <input type="text" name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} />
                            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Name *</label>
                            <input type="text" name="lastName" className="form-control" value={formData.lastName} onChange={handleChange} />
                            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} disabled={isEdit} />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone *</label>
                            <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Date of Birth *</label>
                            <input type="date" name="dateOfBirth" className="form-control" style={{ colorScheme: 'dark' }} value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''} onChange={handleChange} />
                            {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender *</label>
                            <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.gender && <span className="error-text">{errors.gender}</span>}
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '1.5rem', marginTop: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Application Details</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Course Applied For *</label>
                            <select name="course" className="form-control" value={formData.course} onChange={handleChange}>
                                <option value="">Select Course</option>
                                {AVAILABLE_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.course && <span className="error-text">{errors.course}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Department *</label>
                            <input type="text" name="department" className="form-control" placeholder="e.g. Computer Science" value={formData.department} onChange={handleChange} />
                            {errors.department && <span className="error-text">{errors.department}</span>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', marginTop: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0 }}>Academic History</h3>
                        <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={addAcademicRecord}>
                            <FiPlus /> Add Record
                        </button>
                    </div>

                    {errors.academicRecords && <div className="error-text mb-4">{errors.academicRecords}</div>}

                    {formData.academicRecords.map((record, index) => (
                        <div key={index} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h4 style={{ color: 'var(--primary)' }}>Record #{index + 1}</h4>
                                {formData.academicRecords.length > 1 && (
                                    <button type="button" className="btn-icon" style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => removeAcademicRecord(index)}>
                                        <FiTrash2 />
                                    </button>
                                )}
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Degree/Standard *</label>
                                    <select name="degreeType" className="form-control" value={record.degreeType} onChange={(e) => handleAcademicRecordChange(index, e)}>
                                        <option value="">Select Level</option>
                                        {DEGREE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Institution Name *</label>
                                    <input type="text" name="institutionName" className="form-control" value={record.institutionName} onChange={(e) => handleAcademicRecordChange(index, e)} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Board/University *</label>
                                    <input type="text" name="boardOrUniversity" className="form-control" value={record.boardOrUniversity} onChange={(e) => handleAcademicRecordChange(index, e)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Year of Passing *</label>
                                    <input type="number" name="yearOfPassing" className="form-control" min="1980" max="2030" value={record.yearOfPassing} onChange={(e) => handleAcademicRecordChange(index, e)} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Score/Marks *</label>
                                    <input type="number" step="0.1" name="score" className="form-control" value={record.score} onChange={(e) => handleAcademicRecordChange(index, e)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Score Type</label>
                                    <select name="scoreType" className="form-control" value={record.scoreType} onChange={(e) => handleAcademicRecordChange(index, e)}>
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="CGPA">CGPA</option>
                                    </select>
                                </div>
                            </div>
                            {errors[`academicRecord_${index}`] && <span className="error-text">{errors[`academicRecord_${index}`]}</span>}
                        </div>
                    ))}

                    <h3 style={{ marginBottom: '1.5rem', marginTop: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Address & Additional Info</h3>
                    <div className="form-group">
                        <label className="form-label">Full Address *</label>
                        <input type="text" name="address" className="form-control" value={formData.address} onChange={handleChange} />
                        {errors.address && <span className="error-text">{errors.address}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">City *</label>
                            <input type="text" name="city" className="form-control" value={formData.city} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">State *</label>
                            <input type="text" name="state" className="form-control" value={formData.state} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Pincode *</label>
                            <input type="text" name="pincode" className="form-control" value={formData.pincode} onChange={handleChange} />
                        </div>
                    </div>

                    {isEdit && (
                        <div className="form-row mt-4">
                            <div className="form-group">
                                <label className="form-label">Application Status</label>
                                <select name="applicationStatus" className="form-control" value={formData.applicationStatus} onChange={handleChange}>
                                    <option value="PENDING">Pending</option>
                                    <option value="UNDER_REVIEW">Under Review</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="WAITLISTED">Waitlisted</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Admin Notes</label>
                        <textarea name="notes" className="form-control" rows="4" value={formData.notes || ''} onChange={handleChange}></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/students')} disabled={submitting}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : <><FiSave /> {isEdit ? 'Update Application' : 'Submit Application'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;
