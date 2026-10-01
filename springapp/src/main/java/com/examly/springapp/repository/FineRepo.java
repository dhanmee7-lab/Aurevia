package com.examly.springapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.examly.springapp.model.Fine;
import java.util.List;

@Repository
public interface FineRepo extends JpaRepository<Fine, Long> {
    List<Fine> findByPaid(Boolean paid);
    List<Fine> findByMemberMemberId(Long memberId);
    List<Fine> findByBorrowBorrowId(Long borrowId);

    @Query("SELECT COALESCE(SUM(f.amount), 0.0) FROM Fine f WHERE f.paid = true")
    Double sumPaidFines();

    @Query("SELECT COALESCE(SUM(f.amount), 0.0) FROM Fine f WHERE f.paid = false")
    Double sumUnpaidFines();
}
