package com.examly.springapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import com.examly.springapp.model.*;
import com.examly.springapp.repository.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/demo")
public class DemoDataController {

    @Autowired
    private BookCategoryRepo categoryRepo;

    @Autowired
    private BookRepo bookRepo;

    @Autowired
    private MemberRepo memberRepo;

    @Autowired
    private BorrowRepo borrowRepo;

    @Autowired
    private FineRepo fineRepo;

    @Autowired
    private com.examly.springapp.service.UserService userService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> res = new HashMap<>();
        long bookCount = bookRepo.count();
        res.put("seeded", bookCount > 0);
        res.put("bookCount", bookCount);
        res.put("memberCount", memberRepo.count());
        res.put("categoryCount", categoryRepo.count());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/seed")
    @Transactional
    public ResponseEntity<Map<String, Object>> seedData() {
        // Categories
        BookCategory cs = new BookCategory("Computer Science");
        cs.setDescription("Algorithms, Software Engineering, Programming Languages, and Cloud");
        BookCategory fiction = new BookCategory("Fiction & Literature");
        fiction.setDescription("Classic and contemporary literary works and novels");
        BookCategory science = new BookCategory("Science & Technology");
        science.setDescription("Physics, Astronomy, Biology, and Emerging Tech");
        BookCategory math = new BookCategory("Mathematics");
        math.setDescription("Pure and Applied Mathematics, Calculus, and Statistics");
        BookCategory history = new BookCategory("World History");
        history.setDescription("Ancient, Medieval, and Modern World History");
        BookCategory philosophy = new BookCategory("Philosophy");
        philosophy.setDescription("Ethics, Logic, Classical and Modern Philosophy");

        List<BookCategory> savedCats = categoryRepo.saveAll(Arrays.asList(cs, fiction, science, math, history, philosophy));
        Map<String, BookCategory> catMap = new HashMap<>();
        for (BookCategory c : savedCats) {
            catMap.put(c.getCategoryName(), c);
        }

        // Books
        Book b1 = new Book("Clean Code: A Handbook of Agile Software Craftsmanship", "Robert C. Martin", true, catMap.get("Computer Science"));
        b1.setIsbn("978-0132350884");
        b1.setPublisher("Prentice Hall");
        b1.setPublicationYear(2008);
        b1.setLocationRack("Rack CS-101");
        b1.setDescription("Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.");
        b1.setCoverImageUrl("https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=300");

        Book b2 = new Book("Effective Java", "Joshua Bloch", true, catMap.get("Computer Science"));
        b2.setIsbn("978-0134685991");
        b2.setPublisher("Addison-Wesley");
        b2.setPublicationYear(2018);
        b2.setLocationRack("Rack CS-102");
        b2.setDescription("The definitive guide to Java platform best practices by the architect of core Java libraries.");
        b2.setCoverImageUrl("https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300");

        Book b3 = new Book("Design Patterns: Elements of Reusable Object-Oriented Software", "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides", true, catMap.get("Computer Science"));
        b3.setIsbn("978-0201633610");
        b3.setPublisher("Addison-Wesley");
        b3.setPublicationYear(1994);
        b3.setLocationRack("Rack CS-103");
        b3.setDescription("Captures a wealth of experience in design object-oriented software patterns.");
        b3.setCoverImageUrl("https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300");

        Book b4 = new Book("To Kill a Mockingbird", "Harper Lee", true, catMap.get("Fiction & Literature"));
        b4.setIsbn("978-0061120084");
        b4.setPublisher("Harper Perennial");
        b4.setPublicationYear(1960);
        b4.setLocationRack("Rack LIT-201");
        b4.setDescription("The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.");
        b4.setCoverImageUrl("https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300");

        Book b5 = new Book("1984", "George Orwell", true, catMap.get("Fiction & Literature"));
        b5.setIsbn("978-0451524935");
        b5.setPublisher("Signet Classic");
        b5.setPublicationYear(1949);
        b5.setLocationRack("Rack LIT-202");
        b5.setDescription("A startling and haunting novel that creates an imaginary world that is completely convincing.");
        b5.setCoverImageUrl("https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=300");

        Book b6 = new Book("A Brief History of Time", "Stephen Hawking", true, catMap.get("Science & Technology"));
        b6.setIsbn("978-0553380163");
        b6.setPublisher("Bantam Books");
        b6.setPublicationYear(1988);
        b6.setLocationRack("Rack SCI-301");
        b6.setDescription("A landmark volume in science writing by one of the great minds of our time exploring the universe.");
        b6.setCoverImageUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300");

        Book b7 = new Book("Sapiens: A Brief History of Humankind", "Yuval Noah Harari", true, catMap.get("World History"));
        b7.setIsbn("978-0062316097");
        b7.setPublisher("Harper");
        b7.setPublicationYear(2014);
        b7.setLocationRack("Rack HIST-401");
        b7.setDescription("From a renowned historian comes a groundbreaking narrative of humanity’s creation and evolution.");
        b7.setCoverImageUrl("https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=300");

        Book b8 = new Book("Introduction to Algorithms", "Thomas H. Cormen, Charles E. Leiserson", true, catMap.get("Mathematics"));
        b8.setIsbn("978-0262033848");
        b8.setPublisher("MIT Press");
        b8.setPublicationYear(2009);
        b8.setLocationRack("Rack MATH-501");
        b8.setDescription("Comprehensive textbook covering modern study of computer algorithms with depth and rigor.");
        b8.setCoverImageUrl("https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300");

        List<Book> savedBooks = bookRepo.saveAll(Arrays.asList(b1, b2, b3, b4, b5, b6, b7, b8));

        // Members
        Member m1 = new Member("Ravi Kumar", "9876543210", "ravi.kumar@school.edu");
        m1.setMembershipType("STUDENT");
        Member m2 = new Member("Prof. Anita Sharma", "9123456789", "anita.sharma@school.edu");
        m2.setMembershipType("FACULTY");
        Member m3 = new Member("Alex Chen", "9845123456", "alex.chen@school.edu");
        m3.setMembershipType("STUDENT");
        Member m4 = new Member("Sophia Martinez", "9712345678", "sophia.m@school.edu");
        m4.setMembershipType("STUDENT");
        Member m5 = new Member("Dr. Robert Wilson", "9900112233", "robert.wilson@school.edu");
        m5.setMembershipType("FACULTY");

        List<Member> savedMembers = memberRepo.saveAll(Arrays.asList(m1, m2, m3, m4, m5));

        // Active Borrow (Clean Code borrowed by Ravi, due in 7 days)
        Book borrowedBook1 = savedBooks.get(0);
        borrowedBook1.setAvailable(false);
        bookRepo.save(borrowedBook1);

        Borrow borrow1 = new Borrow();
        borrow1.setBook(borrowedBook1);
        borrow1.setMember(savedMembers.get(0));
        borrow1.setBorrowDate(LocalDate.now().minusDays(7));
        borrow1.setDueDate(LocalDate.now().plusDays(7));
        borrow1.setStatus("BORROWED");
        borrow1.setFineAmount(0.0);
        borrowRepo.save(borrow1);

        // Overdue Borrow (1984 borrowed by Alex, due 5 days ago)
        Book borrowedBook2 = savedBooks.get(4);
        borrowedBook2.setAvailable(false);
        bookRepo.save(borrowedBook2);

        Borrow borrow2 = new Borrow();
        borrow2.setBook(borrowedBook2);
        borrow2.setMember(savedMembers.get(2));
        borrow2.setBorrowDate(LocalDate.now().minusDays(19));
        borrow2.setDueDate(LocalDate.now().minusDays(5));
        borrow2.setStatus("BORROWED");
        borrow2.setFineAmount(25.0); // 5 days * 5.0
        borrowRepo.save(borrow2);

        // Fine for the overdue borrow
        Fine fine1 = new Fine(borrow2, savedMembers.get(2), 25.0, "Late return: 5 days overdue");
        fineRepo.save(fine1);

        // Paid fine history
        Fine fine2 = new Fine(null, savedMembers.get(0), 15.0, "Past late return - 3 days overdue (Paid)");
        fine2.setPaid(true);
        fine2.setPaidDate(LocalDate.now().minusDays(10));
        fineRepo.save(fine2);

        userService.seedDefaultUsersIfEmpty();

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Library sample data seeded successfully!");
        result.put("booksSeeded", savedBooks.size());
        result.put("categoriesSeeded", savedCats.size());
        result.put("membersSeeded", savedMembers.size());
        result.put("usersSeeded", 3);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reset")
    @Transactional
    public ResponseEntity<Map<String, Object>> resetData() {
        fineRepo.deleteAll();
        borrowRepo.deleteAll();
        bookRepo.deleteAll();
        categoryRepo.deleteAll();
        memberRepo.deleteAll();

        Map<String, Object> result = new HashMap<>();
        result.put("message", "All library database records have been cleared.");
        return ResponseEntity.ok(result);
    }
}
