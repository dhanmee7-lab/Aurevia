package com.examly.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.examly.springapp.repository.BookCategoryRepo;
import com.examly.springapp.repository.BookRepo;
import com.examly.springapp.repository.BorrowRepo;
import com.examly.springapp.repository.MemberRepo;
import com.examly.springapp.service.FineService;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private BookRepo bookRepo;

    @Autowired
    private BookCategoryRepo categoryRepo;

    @Autowired
    private MemberRepo memberRepo;

    @Autowired
    private BorrowRepo borrowRepo;

    @Autowired
    private FineService fineService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalBooks = bookRepo.count();
        long availableBooks = bookRepo.countByAvailable(true);
        long borrowedBooks = totalBooks - availableBooks;

        long totalCategories = categoryRepo.count();
        long totalMembers = memberRepo.count();
        long activeBorrows = borrowRepo.countByStatus("BORROWED");
        long overdueBorrows = borrowRepo.findByStatusAndDueDateBefore("BORROWED", LocalDate.now()).size();

        Double finesCollected = fineService.getTotalCollected();
        Double finesPending = fineService.getTotalPending();

        stats.put("totalBooks", totalBooks);
        stats.put("availableBooks", availableBooks);
        stats.put("borrowedBooks", borrowedBooks);
        stats.put("totalCategories", totalCategories);
        stats.put("totalMembers", totalMembers);
        stats.put("activeBorrows", activeBorrows);
        stats.put("overdueBorrows", overdueBorrows);
        stats.put("finesCollected", finesCollected != null ? finesCollected : 0.0);
        stats.put("finesPending", finesPending != null ? finesPending : 0.0);

        return ResponseEntity.ok(stats);
    }
}
