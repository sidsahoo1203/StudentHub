package com.studentapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Embeddable
public class SchoolingDetail {

    @NotBlank(message = "Qualification is required")
    @Column(name = "qualification")
    private String qualification;

    @NotBlank(message = "School name is required")
    @Column(name = "school_name")
    private String schoolName;

    @NotBlank(message = "Board is required")
    @Column(name = "board")
    private String board;

    @NotNull(message = "Percentage is required")
    @DecimalMin(value = "0.0", message = "Percentage must be at least 0")
    @DecimalMax(value = "100.0", message = "Percentage must not exceed 100")
    @Column(name = "percentage")
    private Double percentage;

    @NotNull(message = "Passing year is required")
    @Min(value = 1990, message = "Passing year is invalid")
    @Max(value = 2100, message = "Passing year is invalid")
    @Column(name = "passing_year")
    private Integer passingYear;

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public String getSchoolName() {
        return schoolName;
    }

    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }

    public String getBoard() {
        return board;
    }

    public void setBoard(String board) {
        this.board = board;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public Integer getPassingYear() {
        return passingYear;
    }

    public void setPassingYear(Integer passingYear) {
        this.passingYear = passingYear;
    }
}
