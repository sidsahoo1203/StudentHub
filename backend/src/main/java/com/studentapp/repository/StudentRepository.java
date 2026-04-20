package com.studentapp.repository;

import com.studentapp.model.ApplicationStatus;
import com.studentapp.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByApplicationStatus(ApplicationStatus status);

    List<Student> findByDepartment(String department);

    List<Student> findByCourse(String course);

    @Query("SELECT s FROM Student s WHERE " +
            "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.course) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.department) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Student> searchStudents(@Param("keyword") String keyword);

    boolean existsByEmail(String email);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.applicationStatus = :status")
    long countByStatus(@Param("status") ApplicationStatus status);

    @Query("SELECT s.department, COUNT(s) FROM Student s GROUP BY s.department")
    List<Object[]> countByDepartment();

    @Query("SELECT s.course, COUNT(s) FROM Student s GROUP BY s.course")
    List<Object[]> countByCourse();
}
