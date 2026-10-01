package com.examly.springapp.service;

import com.examly.springapp.model.Book;
import com.examly.springapp.repository.BookRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookServiceImpl implements BookService {
    @Autowired
    private BookRepo repo;

    public Book save(Book book) {
        return repo.save(book);
    }

    public List<Book> findAll() {
        return repo.findAll();
    }

    public Book findById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    public List<Book> findByCategoryName(String categoryName) {
        return repo.findByBookCategoryCategoryName(categoryName);
    }

    public List<Book> findByTitle(String title) {
        return repo.findByTitle(title);
    }
}
