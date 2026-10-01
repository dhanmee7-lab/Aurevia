package com.examly.springapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.examly.springapp.model.Book;
import java.util.List;

@Repository
public interface BookRepo extends JpaRepository<Book, Long> {
    List<Book> findByBookCategoryCategoryName(String categoryName);
    List<Book> findByTitle(String title);
    List<Book> findByAvailable(Boolean available);
    long countByAvailable(Boolean available);
    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);
}
