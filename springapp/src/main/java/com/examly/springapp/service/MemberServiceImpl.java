package com.examly.springapp.service;

import com.examly.springapp.model.Member;
import com.examly.springapp.repository.MemberRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MemberServiceImpl implements MemberService {
    @Autowired
    private MemberRepo repo;

    public Member save(Member member) {
        return repo.save(member);
    }

    public List<Member> findAll() {
        return repo.findAll();
    }

    public Member findById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    public List<Member> findByPhone(String phone) {
        return repo.findByPhone(phone);
    }

    public List<Member> findByEmail(String email) {
        return repo.findByEmail(email);
    }
}
