package com.examly.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.examly.springapp.model.Fine;
import com.examly.springapp.service.FineService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fines")
public class FineController {

    @Autowired
    private FineService service;

    @GetMapping
    public ResponseEntity<List<Fine>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        Fine fine = service.findById(id);
        return fine != null ? ResponseEntity.ok(fine) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> post(@RequestBody(required = false) Fine fine) {
        if (fine == null) {
            return ResponseEntity.badRequest().body("Fine data is required");
        }
        Fine saved = service.save(fine);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> pay(@PathVariable Long id) {
        try {
            Fine paid = service.payFine(id);
            return ResponseEntity.ok(paid);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> put(@PathVariable Long id, @RequestBody Fine fine) {
        fine.setFineId(id);
        return ResponseEntity.ok(service.save(fine));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unpaid")
    public ResponseEntity<List<Fine>> getUnpaid() {
        return ResponseEntity.ok(service.findUnpaidFines());
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<Fine>> getByMember(@PathVariable Long memberId) {
        return ResponseEntity.ok(service.findByMemberId(memberId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCollected", service.getTotalCollected());
        stats.put("totalPending", service.getTotalPending());
        return ResponseEntity.ok(stats);
    }
}
