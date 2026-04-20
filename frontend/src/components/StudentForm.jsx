import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../services/api';
import { FiSave, FiArrowLeft, FiAlertCircle, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const COURSE_OPTIONS = ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'BCA', 'BBA'];
const QUALIFICATION_OPTIONS = ['10th', '12th', 'Diploma', 'UG', 'PG'];

const getDefaultSchoolingDetail = () => ({
    qualification: '',
    schoolName: '',
    board: '',
    percentage: '',
    passingYear: ''
});

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
        schoolingDetails: [getDefaultSchoolingDetail()],
        cgpa: '',
        applicationStatus: 'PENDING',
        notes: ''
    });

    useEffect(() => {
        if (isEdit) {
            fetchStudent();
        }
    }, [id]);

    const fetchStudent = async () => {
        try {
            const res = await studentService.getById(id);
            setFormData({
                ...res.data,
                schoolingDetails: res.data.schoolingDetails?.length
                    ? res.data.schoolingDetails
                    : [getDefaultSchoolingDetail()]
            });
        } catch (err) {
            toast.error('Failed to fetch student data');
            navigate('/students');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleSchoolingChange = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            schoolingDetails: prev.schoolingDetails.map((entry, entryIndex) =>
                entryIndex === index ? { ...entry, [field]: value } : entry
            )
        }));
    };

    const addSchoolingDetail = () => {
        setFormData((prev) => ({
            ...prev,
            schoolingDetails: [...prev.schoolingDetails, getDefaultSchoolingDetail()]
        }));
    };

    const removeSchoolingDetail = (index) => {
        if (formData.schoolingDetails.length === 1) {
            toast.info('At least one schooling detail is required');
            return;
        }

        setFormData((prev) => ({
            ...prev,
            schoolingDetails: prev.schoolingDetails.filter((_, entryIndex) => entryIndex !== index)
        }));
    };

    const getMinimumCgpaForCourse = (course) => {
        const normalizedCourse = course?.trim().toUpperCase();
        if (['M.TECH', 'MBA', 'MCA'].includes(normalizedCourse)) return 7.0;
        if (['B.TECH', 'BCA', 'BBA'].includes(normalizedCourse)) return 6.0;
        return 6.5;
    };

    const meetsEligibilityCriteria = () => {
        if (!formData.cgpa || !formData.course) {
            return false;
        }

        const minCgpa = getMinimumCgpaForCourse(formData.course);
        const minSchoolingPercentage = formData.course?.startsWith('M') ? 60 : 50;
        const schoolingEligible = formData.schoolingDetails.every(
            (entry) => Number(entry.percentage) >= minSchoolingPercentage
        );

        return Number(formData.cgpa) >= minCgpa && schoolingEligible;
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
        else if (!/^[0-9]{6}$/.test(formData.pincode)) newErrors.pincode = 'Must be 6 digits';
        if (formData.cgpa && (Number(formData.cgpa) < 0 || Number(formData.cgpa) > 10)) {
            newErrors.cgpa = 'CGPA should be between 0 and 10';
        }

        const currentYear = new Date().getFullYear();
        formData.schoolingDetails.forEach((entry, index) => {
            if (!entry.qualification) newErrors[`schooling.${index}.qualification`] = 'Qualification is required';
            if (!entry.schoolName) newErrors[`schooling.${index}.schoolName`] = 'School name is required';
            if (!entry.board) newErrors[`schooling.${index}.board`] = 'Board is required';
            if (entry.percentage === '' || entry.percentage === null) {
                newErrors[`schooling.${index}.percentage`] = 'Percentage is required';
            } else if (Number(entry.percentage) < 0 || Number(entry.percentage) > 100) {
                newErrors[`schooling.${index}.percentage`] = 'Percentage must be between 0 and 100';
            }
            if (!entry.passingYear) {
                newErrors[`schooling.${index}.passingYear`] = 'Passing year is required';
            } else if (Number(entry.passingYear) < 1990 || Number(entry.passingYear) > currentYear) {
                newErrors[`schooling.${index}.passingYear`] = `Passing year must be between 1990 and ${currentYear}`;
            }
        });

        if (isEdit && formData.applicationStatus === 'REJECTED' && (!formData.notes || formData.notes.trim().length < 10)) {
            newErrors.notes = 'Add a rejection reason in notes (minimum 10 characters)';
        }

        if (isEdit && formData.applicationStatus === 'APPROVED' && !meetsEligibilityCriteria()) {
            newErrors.applicationStatus = 'Applicant does not meet course-wise approval criteria';
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
        const payload = {
            ...formData,
            cgpa: formData.cgpa === '' ? null : Number(formData.cgpa),
            schoolingDetails: formData.schoolingDetails.map((entry) => ({
                ...entry,
                percentage: Number(entry.percentage),
                passingYear: Number(entry.passingYear)
            }))
        };

        try {
            if (isEdit) {
                await studentService.update(id, payload);
                toast.success('Student updated successfully');
            } else {
                await studentService.create(payload);
                toast.success('Student created successfully');
            }
            navigate('/students');
        } catch (err) {
            const apiErrors = err.response?.data?.errors;
            if (apiErrors) {
                setErrors(apiErrors);
                toast.error('Validation failed');
            } else {
                toast.error(err.response?.data?.error || 'Operation failed');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loader-container">
                <div className="loader"></div>
            </div>
        );
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
                            <div>
                                <h4 style={{ color: '#f87171', marginBottom: '0.5rem', fontWeight: '600' }}>Please correct the errors below</h4>
                            </div>
                        </div>
                    )}

                    <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Personal Information</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">First Name *</label>
                            <input
                                type="text"
                                name="firstName"
                                className={`form-control ${errors.firstName ? 'border-red-500' : ''}`}
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Name *</label>
                            <input
                                type="text"
                                name="lastName"
                                className="form-control"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isEdit}
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone *</label>
                            <input
                                type="text"
                                name="phone"
                                className="form-control"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Date of Birth *</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                className="form-control"
                                style={{ colorScheme: 'dark' }}
                                value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                                onChange={handleChange}
                            />
                            {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender *</label>
                            <select
                                name="gender"
                                className="form-control"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.gender && <span className="error-text">{errors.gender}</span>}
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '1.5rem', marginTop: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Academic Details</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Course Applied For *</label>
                            <select
                                name="course"
                                className="form-control"
                                value={formData.course}
                                onChange={handleChange}
                            >
                                <option value="">Select Course</option>
                                {COURSE_OPTIONS.map((course) => (
                                    <option key={course} value={course}>{course}</option>
                                ))}
                            </select>
                            {errors.course && <span className="error-text">{errors.course}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Department *</label>
                            <input
                                type="text"
                                name="department"
                                className="form-control"
                                placeholder="e.g. Computer Science"
                                value={formData.department}
                                onChange={handleChange}
                            />
                            {errors.department && <span className="error-text">{errors.department}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Current CGPA</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                name="cgpa"
                                className="form-control"
                                value={formData.cgpa || ''}
                                onChange={handleChange}
                            />
                            {errors.cgpa && <span className="error-text">{errors.cgpa}</span>}
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0 }}>Schooling Details *</h4>
                            <button type="button" className="btn btn-secondary" onClick={addSchoolingDetail}>
                                <FiPlus /> Add Schooling
                            </button>
                        </div>

                        {formData.schoolingDetails.map((entry, index) => (
                            <div key={index} style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Qualification</label>
                                        <select
                                            className="form-control"
                                            value={entry.qualification}
                                            onChange={(e) => handleSchoolingChange(index, 'qualification', e.target.value)}
                                        >
                                            <option value="">Select qualification</option>
                                            {QUALIFICATION_OPTIONS.map((qualification) => (
                                                <option key={qualification} value={qualification}>{qualification}</option>
                                            ))}
                                        </select>
                                        {errors[`schooling.${index}.qualification`] && <span className="error-text">{errors[`schooling.${index}.qualification`]}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">School / College Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={entry.schoolName}
                                            onChange={(e) => handleSchoolingChange(index, 'schoolName', e.target.value)}
                                        />
                                        {errors[`schooling.${index}.schoolName`] && <span className="error-text">{errors[`schooling.${index}.schoolName`]}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Board / University</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={entry.board}
                                            onChange={(e) => handleSchoolingChange(index, 'board', e.target.value)}
                                        />
                                        {errors[`schooling.${index}.board`] && <span className="error-text">{errors[`schooling.${index}.board`]}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Percentage</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            className="form-control"
                                            value={entry.percentage}
                                            onChange={(e) => handleSchoolingChange(index, 'percentage', e.target.value)}
                                        />
                                        {errors[`schooling.${index}.percentage`] && <span className="error-text">{errors[`schooling.${index}.percentage`]}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Passing Year</label>
                                        <input
                                            type="number"
                                            min="1990"
                                            max={new Date().getFullYear()}
                                            className="form-control"
                                            value={entry.passingYear}
                                            onChange={(e) => handleSchoolingChange(index, 'passingYear', e.target.value)}
                                        />
                                        {errors[`schooling.${index}.passingYear`] && <span className="error-text">{errors[`schooling.${index}.passingYear`]}</span>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-danger" onClick={() => removeSchoolingDetail(index)}>
                                        <FiTrash2 /> Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ marginBottom: '1.5rem', marginTop: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Address & Additional Info</h3>

                    <div className="form-group">
                        <label className="form-label">Full Address *</label>
                        <input
                            type="text"
                            name="address"
                            className="form-control"
                            value={formData.address}
                            onChange={handleChange}
                        />
                        {errors.address && <span className="error-text">{errors.address}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">City *</label>
                            <input
                                type="text"
                                name="city"
                                className="form-control"
                                value={formData.city}
                                onChange={handleChange}
                            />
                            {errors.city && <span className="error-text">{errors.city}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">State *</label>
                            <input
                                type="text"
                                name="state"
                                className="form-control"
                                value={formData.state}
                                onChange={handleChange}
                            />
                            {errors.state && <span className="error-text">{errors.state}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Pincode *</label>
                            <input
                                type="text"
                                name="pincode"
                                className="form-control"
                                value={formData.pincode}
                                onChange={handleChange}
                            />
                            {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                        </div>
                    </div>

                    {isEdit && (
                        <div className="form-row mt-4">
                            <div className="form-group">
                                <label className="form-label">Application Status</label>
                                <select
                                    name="applicationStatus"
                                    className="form-control"
                                    value={formData.applicationStatus}
                                    onChange={handleChange}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="UNDER_REVIEW">Under Review</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="WAITLISTED">Waitlisted</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                                {errors.applicationStatus && <span className="error-text">{errors.applicationStatus}</span>}
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Admin Notes</label>
                        <textarea
                            name="notes"
                            className="form-control"
                            rows="4"
                            value={formData.notes || ''}
                            onChange={handleChange}
                            placeholder="Internal notes about this applicant..."
                        ></textarea>
                        {errors.notes && <span className="error-text">{errors.notes}</span>}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/students')} disabled={submitting}>
                            Cancel
                        </button>
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
