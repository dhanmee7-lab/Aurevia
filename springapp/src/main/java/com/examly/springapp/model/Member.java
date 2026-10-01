package com.examly.springapp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import java.time.LocalDate;

@Entity
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberId;
    private String name;
    private String phone;
    private String email;
    private String membershipType; // STUDENT, FACULTY, STAFF
    private String status;         // ACTIVE, SUSPENDED, EXPIRED
    private LocalDate joinDate;

    public Member() {
        this.membershipType = "STUDENT";
        this.status = "ACTIVE";
        this.joinDate = LocalDate.now();
    }

    public Member(String name, String phone, String email) {
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.membershipType = "STUDENT";
        this.status = "ACTIVE";
        this.joinDate = LocalDate.now();
    }

    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMembershipType() { return membershipType; }
    public void setMembershipType(String membershipType) { this.membershipType = membershipType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getJoinDate() { return joinDate; }
    public void setJoinDate(LocalDate joinDate) { this.joinDate = joinDate; }
}
