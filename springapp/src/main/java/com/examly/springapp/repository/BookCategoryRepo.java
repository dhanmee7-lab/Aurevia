package com.examly.springapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.examly.springapp.model.BookCategory;

@Repository
public interface BookCategoryRepo extends JpaRepository<BookCategory, Long> {
}
