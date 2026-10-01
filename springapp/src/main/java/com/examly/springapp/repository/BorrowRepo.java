package com.examly.springapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.examly.springapp.model.Borrow;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BorrowRepo extends JpaRepository<Borrow, Long> {
    List<Borrow> findByStatus(String status);
    List<Borrow> findByMemberMemberId(Long memberId);
    List<Borrow> findByBookBookId(Long bookId);
    List<Borrow> findByStatusAndDueDateBefore(String status, LocalDate date);
    long countByStatus(String status);
}
