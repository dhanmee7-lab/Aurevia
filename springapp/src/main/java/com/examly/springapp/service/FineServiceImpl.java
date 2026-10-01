package com.examly.springapp.service;

import com.examly.springapp.model.Fine;
import com.examly.springapp.repository.FineRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class FineServiceImpl implements FineService {

    @Autowired
    private FineRepo repo;

    @Override
    public Fine save(Fine fine) {
        if (fine.getFineDate() == null) {
            fine.setFineDate(LocalDate.now());
        }
        if (fine.getPaid() == null) {
            fine.setPaid(false);
        }
        return repo.save(fine);
    }

    @Override
    public List<Fine> findAll() {
        return repo.findAll();
    }

    @Override
    public Fine findById(Long id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    @Override
    public Fine payFine(Long fineId) {
        Fine fine = repo.findById(fineId)
                .orElseThrow(() -> new IllegalArgumentException("Fine not found with ID: " + fineId));
        fine.setPaid(true);
        fine.setPaidDate(LocalDate.now());
        return repo.save(fine);
    }

    @Override
    public List<Fine> findUnpaidFines() {
        return repo.findByPaid(false);
    }

    @Override
    public List<Fine> findByMemberId(Long memberId) {
        return repo.findByMemberMemberId(memberId);
    }

    @Override
    public Double getTotalCollected() {
        Double total = repo.sumPaidFines();
        return total != null ? total : 0.0;
    }

    @Override
    public Double getTotalPending() {
        Double total = repo.sumUnpaidFines();
        return total != null ? total : 0.0;
    }
}
