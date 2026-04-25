import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../services/api';
import { FiSave, FiArrowLeft, FiArrowRight, FiAlertCircle, FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';

const StudentForm = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: '',
        guardianName: '', guardianPhone: '',
        address: '', city: '', state: '', pincode: '',
        course: '', department: '', applicationStatus: 'PENDING',
        notes: '', statementOfPurpose: '', feeStatus: 'PENDING',
        academicRecords: []
    });

    const AVAILABLE_COURSES = ['B.Tech', 'M.Tech', 'MBA', 'PhD', 'B.Sc', 'M.Sc'];
    const DEGREE_TYPES = ['10th Standard', '12th Standard', 'Undergraduate', 'Postgraduate', 'Diploma'];

    useEffect(() => {
        if (isEdit) {
            fetchStudent();
        } else {
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

    const validateStep = (step) => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.firstName) newErrors.firstName = 'Required';
            if (!formData.lastName) newErrors.lastName = 'Required';
            if (!formData.email) newErrors.email = 'Required';
            else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email';
            if (!formData.phone) newErrors.phone = 'Required';
            if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Required';
            if (!formData.gender) newErrors.gender = 'Required';
        } else if (step === 2) {
            if (!formData.address) newErrors.address = 'Required';
            if (!formData.city) newErrors.city = 'Required';
            if (!formData.state) newErrors.state = 'Required';
            if (!formData.pincode) newErrors.pincode = 'Required';
        } else if (step === 3) {
            if (!formData.course) newErrors.course = 'Required';
            if (!formData.department) newErrors.department = 'Required';
            if (formData.academicRecords.length === 0) {
                newErrors.academicRecords = 'At least one record is required';
            } else {
                formData.academicRecords.forEach((record, index) => {
                    if (!record.degreeType || !record.institutionName || !record.yearOfPassing || !record.score) {
                        newErrors[`academicRecord_${index}`] = 'Please fill all required fields';
                    }
                });
            }
        } else if (step === 4) {
            if (!formData.statementOfPurpose || formData.statementOfPurpose.length < 50) {
                newErrors.statementOfPurpose = 'SOP must be at least 50 characters';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) setCurrentStep(prev => prev + 1);
        else toast.error("Please complete all required fields");
    };
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(4)) {
            toast.error('Please complete the final step');
            return;
        }

        setSubmitting(true);
        try {
            if (isEdit) {
                await studentService.update(id, formData);
                toast.success('Application updated successfully');
            } else {
                await studentService.create(formData);
                toast.success('Application submitted successfully');
            }
            navigate('/students');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    const steps = ["Personal Info", "Contact Details", "Academics", "SOP & Review"];

    return (
        <div>
            <div className="page-header" style={{ alignItems: 'flex-start' }}>
                <div>
                    <h1>{isEdit ? 'Edit Application' : 'New Admission Application'}</h1>
                    <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                        Complete the wizard to submit the university application.
                    </p>
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/students')}>
                    <FiArrowLeft /> Cancel
                </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '2px', background: 'var(--border)', zIndex: 1 }}></div>
                    <div style={{ position: 'absolute', top: '15px', left: '0', width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`, height: '2px', background: 'var(--primary)', zIndex: 1, transition: 'all 0.3s' }}></div>
                    
                    {steps.map((label, i) => {
                        const stepNum = i + 1;
                        const isActive = currentStep === stepNum;
                        const isCompleted = currentStep > stepNum;
                        return (
                            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                                <div style={{ 
                                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                                    background: isActive || isCompleted ? 'var(--primary)' : 'var(--bg-dark)',
                                    border: `2px solid ${isActive || isCompleted ? 'var(--primary)' : 'var(--border)'}`,
                                    color: isActive || isCompleted ? '#fff' : 'var(--text-muted)',
                                    transition: 'all 0.3s'
                                }}>
                                    {isCompleted ? <FiCheck /> : stepNum}
                                </div>
                                <span style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: isActive ? '#fff' : 'var(--text-muted)' }}>{label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <form>
                    {/* STEP 1 */}
                    {currentStep === 1 && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Step 1: Personal & Guardian Information</h3>
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
                                    <label className="form-label">Date of Birth *</label>
                                    <input type="date" name="dateOfBirth" className="form-control" style={{ colorScheme: 'dark' }} value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''} onChange={handleChange} />
                                    {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Gender *</label>
                                    <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                                        <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                                    </select>
                                    {errors.gender && <span className="error-text">{errors.gender}</span>}
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Guardian/Parent Name</label>
                                    <input type="text" name="guardianName" className="form-control" value={formData.guardianName || ''} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Guardian Phone</label>
                                    <input type="text" name="guardianPhone" className="form-control" value={formData.guardianPhone || ''} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {currentStep === 2 && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Step 2: Contact Details</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Applicant Email *</label>
                                    <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} disabled={isEdit} />
                                    {errors.email && <span className="error-text">{errors.email}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Applicant Phone *</label>
                                    <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
                                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Full Address *</label>
                                <input type="text" name="address" className="form-control" value={formData.address} onChange={handleChange} />
                                {errors.address && <span className="error-text">{errors.address}</span>}
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <input type="text" name="city" className="form-control" value={formData.city} onChange={handleChange} />
                                    {errors.city && <span className="error-text">{errors.city}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State *</label>
                                    <input type="text" name="state" className="form-control" value={formData.state} onChange={handleChange} />
                                    {errors.state && <span className="error-text">{errors.state}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Pincode *</label>
                                    <input type="text" name="pincode" className="form-control" value={formData.pincode} onChange={handleChange} />
                                    {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 */}
                    {currentStep === 3 && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Step 3: Program & Academics</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Target Course *</label>
                                    <select name="course" className="form-control" value={formData.course} onChange={handleChange}>
                                        <option value="">Select Course</option>
                                        {AVAILABLE_COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {errors.course && <span className="error-text">{errors.course}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Target Department *</label>
                                    <input type="text" name="department" className="form-control" placeholder="e.g. Computer Science" value={formData.department} onChange={handleChange} />
                                    {errors.department && <span className="error-text">{errors.department}</span>}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '2rem' }}>
                                <h4>Academic History</h4>
                                <button type="button" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={addAcademicRecord}>
                                    <FiPlus /> Add Degree/School
                                </button>
                            </div>
                            
                            {errors.academicRecords && <div className="error-text mb-4">{errors.academicRecords}</div>}

                            {formData.academicRecords.map((record, index) => (
                                <div key={index} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <h4 style={{ color: 'var(--primary)' }}>Record #{index + 1}</h4>
                                        {formData.academicRecords.length > 1 && (
                                            <button type="button" className="btn-icon" style={{ color: '#f87171', background: 'none', border: 'none' }} onClick={() => removeAcademicRecord(index)}>
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Degree Level *</label>
                                            <select name="degreeType" className="form-control" value={record.degreeType} onChange={(e) => handleAcademicRecordChange(index, e)}>
                                                <option value="">Select</option>
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
                                            <label className="form-label">Graduation Year *</label>
                                            <input type="number" name="yearOfPassing" className="form-control" min="1980" max="2030" value={record.yearOfPassing} onChange={(e) => handleAcademicRecordChange(index, e)} />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Score *</label>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input type="number" step="0.1" name="score" className="form-control" value={record.score} onChange={(e) => handleAcademicRecordChange(index, e)} />
                                                <select name="scoreType" className="form-control" style={{ width: '80px' }} value={record.scoreType} onChange={(e) => handleAcademicRecordChange(index, e)}>
                                                    <option value="PERCENTAGE">%</option>
                                                    <option value="CGPA">CGPA</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    {errors[`academicRecord_${index}`] && <span className="error-text">{errors[`academicRecord_${index}`]}</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* STEP 4 */}
                    {currentStep === 4 && (
                        <div className="animate-fade-in">
                            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Step 4: SOP & Admin Review</h3>
                            
                            <div className="form-group">
                                <label className="form-label">Statement of Purpose (SOP) *</label>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Explain why you want to join this program. (Min 50 chars)</p>
                                <textarea name="statementOfPurpose" className="form-control" rows="8" value={formData.statementOfPurpose || ''} onChange={handleChange} placeholder="I am applying to this prestigious institution because..."></textarea>
                                {errors.statementOfPurpose && <span className="error-text">{errors.statementOfPurpose}</span>}
                            </div>

                            {isEdit && (
                                <div className="form-row mt-4 p-4" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Fee Status</label>
                                        <select name="feeStatus" className="form-control" value={formData.feeStatus} onChange={handleChange}>
                                            <option value="PENDING">Pending</option>
                                            <option value="PAID">Paid</option>
                                            <option value="WAIVED">Waived</option>
                                        </select>
                                    </div>
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
                            
                            {isEdit && (
                                <div className="form-group mt-4">
                                    <label className="form-label">Admin Internal Notes</label>
                                    <textarea name="notes" className="form-control" rows="3" value={formData.notes || ''} onChange={handleChange}></textarea>
                                </div>
                            )}

                            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', marginTop: '2rem' }}>
                                <p style={{ color: '#34d399', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>
                                    Please review all information before submitting. The system will automatically run eligibility checks on submission.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={prevStep} disabled={currentStep === 1 || submitting}>
                            <FiArrowLeft /> Previous
                        </button>
                        
                        {currentStep < 4 ? (
                            <button type="button" className="btn btn-primary" onClick={nextStep}>
                                Next Step <FiArrowRight />
                            </button>
                        ) : (
                            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Processing...' : <><FiSave /> {isEdit ? 'Finalize Edit' : 'Submit Application'}</>}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;
