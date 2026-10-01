package com.examly.springapp.service;

import com.examly.springapp.model.Book;
import java.util.List;

public interface BookService {
    Book save(Book book);
    List<Book> findAll();
    Book findById(Long id);
    void deleteById(Long id);
    List<Book> findByCategoryName(String categoryName);
    List<Book> findByTitle(String title);
}
