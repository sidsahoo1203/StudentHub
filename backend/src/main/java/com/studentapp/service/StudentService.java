package com.studentapp.service;

import com.studentapp.model.AcademicRecord;
import com.studentapp.model.ApplicationStatus;
import com.studentapp.model.Student;
import com.studentapp.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    public Student createStudent(Student student) {
        evaluateEligibility(student);
        return studentRepository.save(student);
    }

    public Student updateStudent(Long id, Student studentDetails) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        student.setFirstName(studentDetails.getFirstName());
        student.setLastName(studentDetails.getLastName());
        student.setEmail(studentDetails.getEmail());
        student.setPhone(studentDetails.getPhone());
        student.setDateOfBirth(studentDetails.getDateOfBirth());
        student.setGender(studentDetails.getGender());
        student.setAddress(studentDetails.getAddress());
        student.setCity(studentDetails.getCity());
        student.setState(studentDetails.getState());
        student.setPincode(studentDetails.getPincode());
        student.setCourse(studentDetails.getCourse());
        student.setDepartment(studentDetails.getDepartment());
        
        student.setGuardianName(studentDetails.getGuardianName());
        student.setGuardianPhone(studentDetails.getGuardianPhone());
        student.setStatementOfPurpose(studentDetails.getStatementOfPurpose());
        if(studentDetails.getFeeStatus() != null) {
            student.setFeeStatus(studentDetails.getFeeStatus());
        }
        
        // Update Academic Records
        student.setAcademicRecords(studentDetails.getAcademicRecords());
        
        student.setApplicationStatus(studentDetails.getApplicationStatus());
        student.setNotes(studentDetails.getNotes());

        evaluateEligibility(student);

        return studentRepository.save(student);
    }

    private void evaluateEligibility(Student student) {
        String course = student.getCourse();
        List<AcademicRecord> records = student.getAcademicRecords();
        
        if (records == null || records.isEmpty()) {
            student.setEligibilityStatus("NEEDS_REVIEW");
            student.setEligibilityReason("No academic records provided.");
            return;
        }

        if ("B.Tech".equalsIgnoreCase(course)) {
            boolean has12th = false;
            boolean meetsCriteria = false;
            for (AcademicRecord ar : records) {
                if ("12th Standard".equalsIgnoreCase(ar.getDegreeType())) {
                    has12th = true;
                    if (ar.getScore() != null && ar.getScore() >= 60.0) {
                        meetsCriteria = true;
                    }
                }
            }
            if (!has12th) {
                student.setEligibilityStatus("NOT_ELIGIBLE");
                student.setEligibilityReason("Missing 12th Standard record.");
            } else if (!meetsCriteria) {
                student.setEligibilityStatus("NOT_ELIGIBLE");
                student.setEligibilityReason("12th Standard score below 60%.");
            } else {
                student.setEligibilityStatus("ELIGIBLE");
                student.setEligibilityReason("Meets all criteria for B.Tech.");
            }
        } 
        else if ("M.Tech".equalsIgnoreCase(course) || "MBA".equalsIgnoreCase(course)) {
            boolean hasUG = false;
            boolean meetsCriteria = false;
            double minScore = "M.Tech".equalsIgnoreCase(course) ? 60.0 : 50.0; // Assume CGPA is scaled to percentage conceptually here or checked directly
            
            for (AcademicRecord ar : records) {
                if ("Undergraduate".equalsIgnoreCase(ar.getDegreeType())) {
                    hasUG = true;
                    double effectiveScore = ar.getScore();
                    if ("CGPA".equalsIgnoreCase(ar.getScoreType())) {
                        effectiveScore = ar.getScore() * 10; // Simple conversion for baseline check
                    }
                    if (effectiveScore >= minScore) {
                        meetsCriteria = true;
                    }
                }
            }
            
            if (!hasUG) {
                student.setEligibilityStatus("NOT_ELIGIBLE");
                student.setEligibilityReason("Missing Undergraduate record.");
            } else if (!meetsCriteria) {
                student.setEligibilityStatus("NOT_ELIGIBLE");
                student.setEligibilityReason("Undergraduate score does not meet minimum requirement (" + minScore + "% or equivalent CGPA).");
            } else {
                student.setEligibilityStatus("ELIGIBLE");
                student.setEligibilityReason("Meets all criteria for " + course + ".");
            }
        } 
        else {
            student.setEligibilityStatus("NEEDS_REVIEW");
            student.setEligibilityReason("Manual review required for custom course.");
        }
    }

    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        studentRepository.delete(student);
    }

    public List<Student> searchStudents(String keyword) {
        return studentRepository.searchStudents(keyword);
    }

    public List<Student> getStudentsByStatus(ApplicationStatus status) {
        return studentRepository.findByApplicationStatus(status);
    }

    public List<Student> getStudentsByDepartment(String department) {
        return studentRepository.findByDepartment(department);
    }

    public List<Student> getStudentsByCourse(String course) {
        return studentRepository.findByCourse(course);
    }

    public Student updateStatus(Long id, ApplicationStatus status) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        student.setApplicationStatus(status);
        return studentRepository.save(student);
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", studentRepository.count());
        stats.put("pending", studentRepository.countByStatus(ApplicationStatus.PENDING));
        stats.put("underReview", studentRepository.countByStatus(ApplicationStatus.UNDER_REVIEW));
        stats.put("approved", studentRepository.countByStatus(ApplicationStatus.APPROVED));
        stats.put("rejected", studentRepository.countByStatus(ApplicationStatus.REJECTED));
        stats.put("waitlisted", studentRepository.countByStatus(ApplicationStatus.WAITLISTED));
        stats.put("departmentStats", studentRepository.countByDepartment());
        stats.put("courseStats", studentRepository.countByCourse());
        return stats;
    }

    public boolean emailExists(String email) {
        return studentRepository.existsByEmail(email);
    }
}
