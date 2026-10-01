package com.examly.springapp.service;

import com.examly.springapp.model.BookCategory;
import org.springframework.data.domain.Page;
import java.util.List;

public interface BookCategoryService {
    BookCategory save(BookCategory bookCategory);
    List<BookCategory> findAll();
    BookCategory findById(Long id);
    void deleteById(Long id);
    Page<BookCategory> findAll(int page, int size);
}
