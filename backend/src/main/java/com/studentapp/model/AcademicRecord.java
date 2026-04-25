package com.studentapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "academic_records")
public class AcademicRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private Student student;

    @NotBlank(message = "Degree/Standard type is required")
    @Column(name = "degree_type", nullable = false)
    private String degreeType; // e.g., "10th Standard", "12th Standard", "Undergraduate", "Postgraduate"

    @NotBlank(message = "Institution name is required")
    @Column(name = "institution_name", nullable = false)
    private String institutionName;

    @NotBlank(message = "Board/University is required")
    @Column(name = "board_or_university")
    private String boardOrUniversity;

    @NotNull(message = "Year of passing is required")
    @Min(value = 1980, message = "Invalid year")
    @Max(value = 2030, message = "Invalid year")
    @Column(name = "year_of_passing")
    private Integer yearOfPassing;

    @NotNull(message = "Percentage or CGPA is required")
    @DecimalMin(value = "0.0", message = "Must be at least 0.0")
    @DecimalMax(value = "100.0", message = "Must not exceed 100.0")
    @Column(name = "score")
    private Double score;

    @Column(name = "score_type")
    private String scoreType; // "PERCENTAGE" or "CGPA"

    public AcademicRecord() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public String getDegreeType() { return degreeType; }
    public void setDegreeType(String degreeType) { this.degreeType = degreeType; }

    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }

    public String getBoardOrUniversity() { return boardOrUniversity; }
    public void setBoardOrUniversity(String boardOrUniversity) { this.boardOrUniversity = boardOrUniversity; }

    public Integer getYearOfPassing() { return yearOfPassing; }
    public void setYearOfPassing(Integer yearOfPassing) { this.yearOfPassing = yearOfPassing; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public String getScoreType() { return scoreType; }
    public void setScoreType(String scoreType) { this.scoreType = scoreType; }
}
