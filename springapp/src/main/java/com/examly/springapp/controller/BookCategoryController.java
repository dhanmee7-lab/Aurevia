package com.examly.springapp.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import com.examly.springapp.model.BookCategory;
import com.examly.springapp.service.BookCategoryService;
import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/api/book-categories")
public class BookCategoryController {
   @Autowired
   private BookCategoryService bookCategoryService;

   @PostMapping
   public ResponseEntity<?> addBookCategory(@RequestBody(required = false) BookCategory bookcategory){
    if (bookcategory == null) {
        return ResponseEntity.badRequest().build();
    }
    return ResponseEntity.status(HttpStatus.CREATED).body(bookCategoryService.save(bookcategory));
   }

   @GetMapping
   public ResponseEntity<?> getAllCategories(){
    List<BookCategory> categories = bookCategoryService.findAll();
    if (categories.isEmpty()) {
        return ResponseEntity.noContent().build();
    }
    return ResponseEntity.ok(categories);
   }

   @GetMapping("/{id}")
   public ResponseEntity<?> getBookCategoryById(@PathVariable Long id){
    BookCategory category = bookCategoryService.findById(id);
    if (category == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Book category not found");
    }
    return ResponseEntity.ok(category);
   }

   @PutMapping("/{id}")
   public ResponseEntity<?> updateBookCategory(@PathVariable Long id, @RequestBody BookCategory bookCategory){
     bookCategory.setCategoryId(id);
     return ResponseEntity.ok(bookCategoryService.save(bookCategory));
   }

   @DeleteMapping("/{id}")
   public ResponseEntity<?> deleteBookCategory(@PathVariable Long id){
    bookCategoryService.deleteById(id);
    return ResponseEntity.ok().build();
   }

   @GetMapping("/page/{page}/{size}")
   public ResponseEntity<?> getBookCategoriesPaginated(@PathVariable int page, @PathVariable int size){
    Page<BookCategory> categories = bookCategoryService.findAll(page, size);
    return ResponseEntity.ok(categories);
   }
}
