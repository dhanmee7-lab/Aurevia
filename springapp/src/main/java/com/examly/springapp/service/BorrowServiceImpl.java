package com.examly.springapp.service;

import com.examly.springapp.model.Book;
import com.examly.springapp.model.Borrow;
import com.examly.springapp.model.Fine;
import com.examly.springapp.model.Member;
import com.examly.springapp.repository.BookRepo;
import com.examly.springapp.repository.BorrowRepo;
import com.examly.springapp.repository.FineRepo;
import com.examly.springapp.repository.MemberRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@Transactional
public class BorrowServiceImpl implements BorrowService {

    @Autowired
    private BorrowRepo repo;

    @Autowired
    private BookRepo bookRepo;

    @Autowired
    private MemberRepo memberRepo;

    @Autowired
    private FineRepo fineRepo;

    @Override
    public Borrow save(Borrow borrow) {
        if (borrow.getBorrowDate() == null) {
            borrow.setBorrowDate(LocalDate.now());
        }
        if (borrow.getDueDate() == null) {
            borrow.setDueDate(borrow.getBorrowDate().plusDays(14));
        }
        if (borrow.getStatus() == null) {
            borrow.setStatus("BORROWED");
        }
        if (borrow.getBook() != null && borrow.getBook().getBookId() != null) {
            Book book = bookRepo.findById(borrow.getBook().getBookId()).orElse(null);
            if (book != null) {
                borrow.setBook(book);
                if ("BORROWED".equalsIgnoreCase(borrow.getStatus())) {
                    book.setAvailable(false);
                    bookRepo.save(book);
                }
            }
        }
        if (borrow.getMember() != null && borrow.getMember().getMemberId() != null) {
            Member member = memberRepo.findById(borrow.getMember().getMemberId()).orElse(null);
            if (member != null) {
                borrow.setMember(member);
            }
        }
        return repo.save(borrow);
    }

    @Override
    public List<Borrow> findAll() {
        return repo.findAll();
    }

    @Override
    public Borrow findById(Long id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public void deleteById(Long id) {
        Borrow borrow = repo.findById(id).orElse(null);
        if (borrow != null && borrow.getBook() != null && "BORROWED".equalsIgnoreCase(borrow.getStatus())) {
            Book book = borrow.getBook();
            book.setAvailable(true);
            bookRepo.save(book);
        }
        repo.deleteById(id);
    }

    @Override
    public Borrow issueBook(Long bookId, Long memberId, int days) {
        Book book = bookRepo.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + bookId));

        if (Boolean.FALSE.equals(book.getAvailable())) {
            throw new IllegalStateException("Book '" + book.getTitle() + "' is currently checked out.");
        }

        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found with ID: " + memberId));

        Borrow borrow = new Borrow();
        borrow.setBook(book);
        borrow.setMember(member);
        borrow.setBorrowDate(LocalDate.now());
        borrow.setDueDate(LocalDate.now().plusDays(days > 0 ? days : 14));
        borrow.setStatus("BORROWED");
        borrow.setFineAmount(0.0);

        book.setAvailable(false);
        bookRepo.save(book);

        return repo.save(borrow);
    }

    @Override
    public Borrow returnBook(Long borrowId) {
        Borrow borrow = repo.findById(borrowId)
                .orElseThrow(() -> new IllegalArgumentException("Borrow transaction not found with ID: " + borrowId));

        if ("RETURNED".equalsIgnoreCase(borrow.getStatus())) {
            throw new IllegalStateException("This book has already been returned.");
        }

        LocalDate today = LocalDate.now();
        borrow.setReturnDate(today);
        borrow.setStatus("RETURNED");

        Book book = borrow.getBook();
        if (book != null) {
            book.setAvailable(true);
            bookRepo.save(book);
        }

        // Calculate fine if overdue ($1.00 or 5.0 per day)
        if (borrow.getDueDate() != null && today.isAfter(borrow.getDueDate())) {
            long overdueDays = ChronoUnit.DAYS.between(borrow.getDueDate(), today);
            double fineAmount = overdueDays * 5.0; // 5.0 per day
            borrow.setFineAmount(fineAmount);

            Fine fine = new Fine(borrow, borrow.getMember(), fineAmount, "Late return: " + overdueDays + " day(s) overdue");
            fineRepo.save(fine);
        }

        return repo.save(borrow);
    }

    @Override
    public List<Borrow> findActiveBorrows() {
        return repo.findByStatus("BORROWED");
    }

    @Override
    public List<Borrow> findOverdueBorrows() {
        return repo.findByStatusAndDueDateBefore("BORROWED", LocalDate.now());
    }

    @Override
    public List<Borrow> findByMemberId(Long memberId) {
        return repo.findByMemberMemberId(memberId);
    }
}
