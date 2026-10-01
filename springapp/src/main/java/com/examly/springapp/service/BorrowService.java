package com.examly.springapp.service;

import com.examly.springapp.model.Borrow;
import java.util.List;

public interface BorrowService {
    Borrow save(Borrow borrow);
    List<Borrow> findAll();
    Borrow findById(Long id);
    void deleteById(Long id);
    
    Borrow issueBook(Long bookId, Long memberId, int days);
    Borrow returnBook(Long borrowId);
    List<Borrow> findActiveBorrows();
    List<Borrow> findOverdueBorrows();
    List<Borrow> findByMemberId(Long memberId);
}
