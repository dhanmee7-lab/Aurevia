package com.examly.springapp.service;

import com.examly.springapp.model.BookCategory;
import com.examly.springapp.repository.BookCategoryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookCategoryServiceImpl implements BookCategoryService {
    @Autowired
    private BookCategoryRepo repo;

    public BookCategory save(BookCategory bookCategory) {
        return repo.save(bookCategory);
    }

    public List<BookCategory> findAll() {
        return repo.findAll();
    }

    public BookCategory findById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    public Page<BookCategory> findAll(int page, int size) {
        return repo.findAll(PageRequest.of(page, size));
    }
}
