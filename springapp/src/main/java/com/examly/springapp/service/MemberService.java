package com.examly.springapp.service;

import com.examly.springapp.model.Member;
import java.util.List;

public interface MemberService {
    Member save(Member member);
    List<Member> findAll();
    Member findById(Long id);
    void deleteById(Long id);
    List<Member> findByPhone(String phone);
    List<Member> findByEmail(String email);
}
