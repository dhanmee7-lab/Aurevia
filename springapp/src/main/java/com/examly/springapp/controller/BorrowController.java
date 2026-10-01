package com.examly.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.examly.springapp.model.Borrow;
import com.examly.springapp.service.BorrowService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrows")
public class BorrowController {

    @Autowired
    private BorrowService service;

    @GetMapping
    public ResponseEntity<List<Borrow>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        Borrow borrow = service.findById(id);
        return borrow != null ? ResponseEntity.ok(borrow) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> post(@RequestBody(required = false) Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) {
            return ResponseEntity.badRequest().body("Request body is required");
        }

        try {
            Long bookId = null;
            Long memberId = null;
            int days = 14;

            if (payload.containsKey("bookId") && payload.get("bookId") != null) {
                bookId = Long.valueOf(payload.get("bookId").toString());
            } else if (payload.containsKey("book") && payload.get("book") instanceof Map) {
                Map<?, ?> bookMap = (Map<?, ?>) payload.get("book");
                if (bookMap.containsKey("bookId") && bookMap.get("bookId") != null) {
                    bookId = Long.valueOf(bookMap.get("bookId").toString());
                }
            }

            if (payload.containsKey("memberId") && payload.get("memberId") != null) {
                memberId = Long.valueOf(payload.get("memberId").toString());
            } else if (payload.containsKey("member") && payload.get("member") instanceof Map) {
                Map<?, ?> memberMap = (Map<?, ?>) payload.get("member");
                if (memberMap.containsKey("memberId") && memberMap.get("memberId") != null) {
                    memberId = Long.valueOf(memberMap.get("memberId").toString());
                }
            }

            if (payload.containsKey("days") && payload.get("days") != null) {
                days = Integer.parseInt(payload.get("days").toString());
            }

            if (bookId == null || memberId == null) {
                return ResponseEntity.badRequest().body("Both bookId and memberId must be provided");
            }

            Borrow created = service.issueBook(bookId, memberId, days);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<?> returnBook(@PathVariable Long id) {
        try {
            Borrow returned = service.returnBook(id);
            return ResponseEntity.ok(returned);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> put(@PathVariable Long id, @RequestBody Borrow borrow) {
        borrow.setBorrowId(id);
        return ResponseEntity.ok(service.save(borrow));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/active")
    public ResponseEntity<List<Borrow>> getActiveBorrows() {
        return ResponseEntity.ok(service.findActiveBorrows());
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<Borrow>> getOverdueBorrows() {
        return ResponseEntity.ok(service.findOverdueBorrows());
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<Borrow>> getByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(service.findByMemberId(memberId));
    }
}
