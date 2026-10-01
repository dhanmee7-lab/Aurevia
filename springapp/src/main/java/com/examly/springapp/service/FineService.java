package com.examly.springapp.service;

import com.examly.springapp.model.Fine;
import java.util.List;

public interface FineService {
    Fine save(Fine fine);
    List<Fine> findAll();
    Fine findById(Long id);
    void deleteById(Long id);

    Fine payFine(Long fineId);
    List<Fine> findUnpaidFines();
    List<Fine> findByMemberId(Long memberId);
    Double getTotalCollected();
    Double getTotalPending();
}
