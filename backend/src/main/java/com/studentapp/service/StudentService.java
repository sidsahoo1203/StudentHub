package com.studentapp.service;

import com.studentapp.model.ApplicationStatus;
import com.studentapp.model.SchoolingDetail;
import com.studentapp.model.Student;
import com.studentapp.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StudentService {

    private static final String STUDENT_NOT_FOUND = "Student not found with id: ";
    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    public Student createStudent(Student student) {
        applyApplicationRules(student);
        return studentRepository.save(student);
    }

    public Student updateStudent(Long id, Student studentDetails) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(STUDENT_NOT_FOUND + id));

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
        student.setSchoolingDetails(studentDetails.getSchoolingDetails());
        student.setCgpa(studentDetails.getCgpa());
        student.setApplicationStatus(studentDetails.getApplicationStatus());
        student.setNotes(studentDetails.getNotes());

        applyApplicationRules(student);

        return studentRepository.save(student);
    }

    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(STUDENT_NOT_FOUND + id));
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
                .orElseThrow(() -> new RuntimeException(STUDENT_NOT_FOUND + id));
        validateStatusChange(student, status);
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

    private void applyApplicationRules(Student student) {
        if (student.getApplicationStatus() == null) {
            student.setApplicationStatus(ApplicationStatus.PENDING);
        }
        validateStatusChange(student, student.getApplicationStatus());
    }

    private void validateStatusChange(Student student, ApplicationStatus targetStatus) {
        if (targetStatus == ApplicationStatus.APPROVED && !meetsEligibilityCriteria(student)) {
            throw new IllegalArgumentException(
                    "Application cannot be approved. Applicant does not meet academic criteria for the selected course."
            );
        }

        if (targetStatus == ApplicationStatus.REJECTED
                && (student.getNotes() == null || student.getNotes().trim().length() < 10)) {
            throw new IllegalArgumentException(
                    "A rejection reason is required in notes (minimum 10 characters)."
            );
        }
    }

    private boolean meetsEligibilityCriteria(Student student) {
        if (student.getCgpa() == null || student.getCourse() == null) {
            return false;
        }

        String normalizedCourse = student.getCourse().trim().toUpperCase();
        double minCgpa = getMinimumCgpaForCourse(normalizedCourse);

        List<Double> schoolingPercentages = student.getSchoolingDetails() == null
                ? Collections.emptyList()
                : student.getSchoolingDetails().stream()
                .map(SchoolingDetail::getPercentage)
                .filter(Objects::nonNull)
                .toList();

        // Backward compatibility for legacy records created before schooling details were introduced.
        if (schoolingPercentages.isEmpty()) {
            return student.getCgpa() >= minCgpa;
        }

        double minSchoolingPercentage = normalizedCourse.startsWith("M") ? 60.0 : 50.0;
        boolean schoolingEligible = schoolingPercentages.stream().allMatch(value -> value >= minSchoolingPercentage);

        return student.getCgpa() >= minCgpa && schoolingEligible;
    }

    private double getMinimumCgpaForCourse(String course) {
        String normalizedCourse = course.trim().toUpperCase();
        return switch (normalizedCourse) {
            case "M.TECH", "MBA", "MCA" -> 7.0;
            case "B.TECH", "BCA", "BBA" -> 6.0;
            default -> 6.5;
        };
    }
}
