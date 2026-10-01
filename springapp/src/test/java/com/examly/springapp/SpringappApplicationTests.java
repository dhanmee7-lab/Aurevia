package com.examly.springapp;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import java.io.File;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;

import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.http.MediaType;



@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class SpringappApplicationTests {

//DAY 3 
@Autowired
    private MockMvc mockMvc;


@Test
@Order(1)
    void Day3_test_Controller_Directory_Exists() {
        assertTrue(new File("src/main/java/com/examly/springapp/controller").isDirectory());
    }

    @Test
	@Order(2)

    void Day3_test_Model_Directory_Exists() {
        assertTrue(new File("src/main/java/com/examly/springapp/model").isDirectory());
    }

    @Test
	@Order(3)
    void Day3_test_Service_Directory_Exists() {
        assertTrue(new File("src/main/java/com/examly/springapp/service").isDirectory());
    }

    @Test
	@Order(4)
    void Day3_test_Repository_Directory_Exists() {
        assertTrue(new File("src/main/java/com/examly/springapp/repository").isDirectory());
    }  

        // DAY 4 TESTCASES - HOTEL APP

        @Test
        @Order(5)
        void Day4_test_BookCategoryModel_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/model/BookCategory.java").isFile());
        }
        
        @Test
        @Order(6)
        void Day4_test_BookModel_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/model/Book.java").isFile());
        }
        
        @Test
        @Order(7)
        void Day4_test_BorrowModel_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/model/Borrow.java").isFile());
        }
        
        @Test
        @Order(8)
        void Day4_test_MemberModel_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/model/Member.java").isFile());
        }
        
        @Test
        @Order(9)
        void Day4_test_FineModel_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/model/Fine.java").isFile());
        }
        
    
        @Test
        @Order(10)
        void Day4_test_Book_Has_Entity_Annotation() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.model.Book");
                Class<?> annotation = Class.forName("jakarta.persistence.Entity");
        
                assertTrue(clazz.isAnnotationPresent((Class<? extends Annotation>) annotation),
                        "@Entity annotation is missing on Book class");
        
            } catch (ClassNotFoundException e) {
                fail("Book class not found.");
            } catch (Exception e) {
                fail("Unable to check @Entity annotation on Book.");
            }
        }
        
        
        @Test
        @Order(11)
        void Day4_test_Book_Has_Id_Annotation_On_Field() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.model.Book");
                Class<?> idAnnotation = Class.forName("jakarta.persistence.Id");
        
                boolean found = false;
        
                for (var field : clazz.getDeclaredFields()) {
                    if (field.isAnnotationPresent((Class<? extends Annotation>) idAnnotation)) {
                        found = true;
                        break;
                    }
                }
        
                assertTrue(found, "No field in Book class is annotated with @Id");
        
            } catch (ClassNotFoundException e) {
                fail("Book class not found.");
            } catch (Exception e) {
                fail("Unable to verify @Id annotation in Book class.");
            }
        }
        
	    //Day 5 Tetscases
        @Test
        @Order(12)
        void Day5_testBookCategoryRepo_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/repository/BookCategoryRepo.java").isFile());
        }
        

        @Test
        @Order(13)
        void Day5_testBookRepo_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/repository/BookRepo.java").isFile());
        }
        

        @Test
        @Order(14)
        void Day5_testBorrowRepo_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/repository/BorrowRepo.java").isFile());
        }
        
        @Test
        @Order(15)
        void Day5_testFineRepo_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/repository/FineRepo.java").isFile());
        }
        

        @Test
        @Order(16)
        void Day5_testMemberRepo_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/repository/MemberRepo.java").isFile());
        }
        

        @Test
        @Order(17)
        void Day5_test_BookRepo_Has_Repository_Annotation() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.repository.BookRepo");
                Class<?> annotation = Class.forName("org.springframework.stereotype.Repository");
        
                assertTrue(
                    clazz.isAnnotationPresent((Class<? extends Annotation>) annotation),
                    "@Repository annotation is missing on BookRepo class"
                );
        
            } catch (ClassNotFoundException e) {
                fail("BookRepo class not found.");
            } catch (Exception e) {
                fail("Unable to verify @Repository annotation on BookRepo.");
            }
        }
        
        
        @Test
        @Order(18)
        void Day5_test_BookCategoryRepo_Has_Repository_Annotation() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.repository.BookCategoryRepo");
                Class<?> annotation = Class.forName("org.springframework.stereotype.Repository");
        
                assertTrue(
                    clazz.isAnnotationPresent((Class<? extends Annotation>) annotation),
                    "@Repository annotation is missing on BookCategoryRepo class"
                );
        
            } catch (ClassNotFoundException e) {
                fail("BookCategoryRepo class not found.");
            } catch (Exception e) {
                fail("Unable to verify @Repository annotation on BookCategoryRepo.");
            }
        }
        
        
        @Test
        @Order(19)
        void Day5_test_MemberRepo_Has_Repository_Annotation() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.repository.MemberRepo");
                Class<?> annotation = Class.forName("org.springframework.stereotype.Repository");
        
                assertTrue(
                    clazz.isAnnotationPresent((Class<? extends Annotation>) annotation),
                    "@Repository annotation is missing on MemberRepo class"
                );
        
            } catch (ClassNotFoundException e) {
                fail("MemberRepo class not found.");
            } catch (Exception e) {
                fail("Unable to verify @Repository annotation on MemberRepo.");
            }
        }
        
        

        @Test
        @Order(20)
        void Day5_test_BorrowRepo_Has_Repository_Annotation() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.repository.BorrowRepo");
                Class<?> annotation = Class.forName("org.springframework.stereotype.Repository");
        
                assertTrue(
                    clazz.isAnnotationPresent((Class<? extends Annotation>) annotation),
                    "@Repository annotation is missing on BorrowRepo class"
                );
        
            } catch (ClassNotFoundException e) {
                fail("BorrowRepo class not found.");
            } catch (Exception e) {
                fail("Unable to verify @Repository annotation on BorrowRepo.");
            }
        }
        

        @Test
        @Order(21)
        void Day5_test_FineRepo_Has_Repository_Annotation() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.repository.FineRepo");
                Class<?> annotation = Class.forName("org.springframework.stereotype.Repository");
        
                assertTrue(
                    clazz.isAnnotationPresent((Class<? extends Annotation>) annotation),
                    "@Repository annotation is missing on FineRepo class"
                );
        
            } catch (ClassNotFoundException e) {
                fail("FineRepo class not found.");
            } catch (Exception e) {
                fail("Unable to verify @Repository annotation on FineRepo.");
            }
        }
        
        

        // DAY 6 — Controller existence test cases
        @Test
        @Order(22)
        void Day6_test_BookCategoryController_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/controller/BookCategoryController.java").isFile());
        }
        
        @Test
        @Order(23)
        void Day6_test_BookController_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/controller/BookController.java").isFile());
        }
        
        @Test
        @Order(24)
        void Day6_test_MemberController_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/controller/MemberController.java").isFile());
        }
        
        @Test
        @Order(25)
        void Day6_test_BorrowController_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/controller/BorrowController.java").isFile());
        }
        
        @Test
        @Order(26)
        void Day6_test_FineController_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/controller/FineController.java").isFile());
        }
        

        @Test
        @Order(27)
        void Day6_test_BookCategoryController_Has_RestController_Annotation() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.controller.BookCategoryController");
                Class<?> annotation = Class.forName("org.springframework.web.bind.annotation.RestController");
        
                assertTrue(
                    clazz.isAnnotationPresent((Class<? extends Annotation>) annotation),
                    "@RestController annotation is missing on BookCategoryController"
                );
        
            } catch (ClassNotFoundException e) {
                fail("BookCategoryController class not found.");
            } catch (Exception e) {
                fail("Unable to verify @RestController on BookCategoryController.");
            }
        }
        
        
	
        @Test
        @Order(28)
        void Day6_test_BookController_Has_RestController_Annotation() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.controller.BookController");
                Class<?> annotation = Class.forName("org.springframework.web.bind.annotation.RestController");
        
                assertTrue(
                    clazz.isAnnotationPresent((Class<? extends Annotation>) annotation),
                    "@RestController annotation is missing on BookController"
                );
        
            } catch (ClassNotFoundException e) {
                fail("BookController class not found.");
            } catch (Exception e) {
                fail("Unable to verify @RestController on BookController.");
            }
        }
        
        @Test
        @Order(29)
        void Day6_test_BookCategoryController_Has_PostMapping() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.controller.BookCategoryController");
                Class<?> postMapping = Class.forName("org.springframework.web.bind.annotation.PostMapping");
        
                boolean found = false;
        
                for (Method method : clazz.getDeclaredMethods()) {
                    if (method.isAnnotationPresent((Class<? extends Annotation>) postMapping)) {
                        found = true;
                        break;
                    }
                }
        
                assertTrue(found, "No @PostMapping found in BookCategoryController");
        
            } catch (ClassNotFoundException e) {
                fail("BookCategoryController class not found.");
            } catch (Exception e) {
                fail("Unable to verify @PostMapping in BookCategoryController.");
            }
        }
        
        
        @Test
        @Order(30)
        void Day6_test_BookCategoryController_Has_GetMapping() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.controller.BookCategoryController");
                Class<?> getMapping = Class.forName("org.springframework.web.bind.annotation.GetMapping");
        
                boolean found = false;
        
                for (Method method : clazz.getDeclaredMethods()) {
                    if (method.isAnnotationPresent((Class<? extends Annotation>) getMapping)) {
                        found = true;
                        break;
                    }
                }
        
                assertTrue(found, "No @GetMapping found in BookCategoryController");
        
            } catch (ClassNotFoundException e) {
                fail("BookCategoryController class not found.");
            } catch (Exception e) {
                fail("Unable to verify @GetMapping in BookCategoryController.");
            }
        }
        

        @Test
        @Order(31)
        void Day6_test_BookCategoryController_Has_PutMapping() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.controller.BookCategoryController");
                Class<?> putMapping = Class.forName("org.springframework.web.bind.annotation.PutMapping");
        
                boolean found = false;
                for (Method method : clazz.getDeclaredMethods()) {
                    if (method.isAnnotationPresent((Class<? extends Annotation>) putMapping)) {
                        found = true;
                        break;
                    }
                }
        
                assertTrue(found, "No @PutMapping found in BookCategoryController");
        
            } catch (ClassNotFoundException e) {
                fail("BookCategoryController class not found.");
            } catch (Exception e) {
                fail("Unable to verify @PutMapping in BookCategoryController.");
            }
        }
        
        
        @Test
        @Order(32)
        void Day6_test_BookCategoryController_Has_DeleteMapping() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.controller.BookCategoryController");
                Class<?> deleteMapping = Class.forName("org.springframework.web.bind.annotation.DeleteMapping");
        
                boolean found = false;
                for (Method method : clazz.getDeclaredMethods()) {
                    if (method.isAnnotationPresent((Class<? extends Annotation>) deleteMapping)) {
                        found = true;
                        break;
                    }
                }
        
                assertTrue(found, "No @DeleteMapping found in BookCategoryController");
        
            } catch (ClassNotFoundException e) {
                fail("BookCategoryController class not found.");
            } catch (Exception e) {
                fail("Unable to verify @DeleteMapping in BookCategoryController.");
            }
        }
        
        @Test
        @Order(33)
        public void Day6_testCreateCategory_NoBody_StatusBadRequest() throws Exception {
        
            mockMvc.perform(MockMvcRequestBuilders.post("/api/book-categories")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(MockMvcResultMatchers.status().isBadRequest());
        }
        
        @Test
        @Order(34)
        public void Day6_testGetAllCategories_StatusNoContent() throws Exception {
        
            mockMvc.perform(MockMvcRequestBuilders.get("/api/book-categories"))
                    .andExpect(MockMvcResultMatchers.status().isNoContent());
        }
        


        @Test
        @Order(35)
        public void Day6_testGetCategoryById_StatusNotFound() throws Exception {
        
            mockMvc.perform(MockMvcRequestBuilders.get("/api/book-categories/999"))
                    .andExpect(MockMvcResultMatchers.status().isNotFound())
                    .andExpect(MockMvcResultMatchers.content()
                            .string(org.hamcrest.Matchers.containsString("Book category not found")));
        }
        
        
        @Test
        @Order(36)
        void Day7_test_BookCategoryController_Has_RequestMapping() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.controller.BookCategoryController");
                Class<?> requestMapping = Class.forName("org.springframework.web.bind.annotation.RequestMapping");
        
                boolean found = false;
        
                if (clazz.isAnnotationPresent((Class<? extends Annotation>) requestMapping)) {
                    found = true;
                }
        
                for (Method m : clazz.getDeclaredMethods()) {
                    if (m.isAnnotationPresent((Class<? extends Annotation>) requestMapping)) {
                        found = true;
                        break;
                    }
                }
        
                assertTrue(found, "No @RequestMapping found on BookCategoryController");
        
            } catch (ClassNotFoundException e) {
                fail("BookCategoryController class not found.");
            } catch (Exception e) {
                fail("Unable to verify @RequestMapping on BookCategoryController.");
            }
        }
        
        @Test
        @Order(37)
        void Day7_test_BookCategoryController_Has_PathVariable() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.controller.BookCategoryController");
                Class<?> pathVariable = Class.forName("org.springframework.web.bind.annotation.PathVariable");
        
                boolean found = false;
        
                for (Method method : clazz.getDeclaredMethods()) {
                    for (Parameter param : method.getParameters()) {
                        if (param.isAnnotationPresent((Class<? extends Annotation>) pathVariable)) {
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
        
                assertTrue(found, "No @PathVariable found in BookCategoryController");
        
            } catch (ClassNotFoundException e) {
                fail("BookCategoryController class not found.");
            } catch (Exception e) {
                fail("Unable to verify @PathVariable in BookCategoryController.");
            }
        }
        
        

        @Test
        @Order(38)
        void Day7_test_BookController_Has_RequestMapping() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.controller.BookController");
                Class<?> requestMapping = Class.forName("org.springframework.web.bind.annotation.RequestMapping");
        
                boolean found = false;
        
                if (clazz.isAnnotationPresent((Class<? extends Annotation>) requestMapping)) {
                    found = true;
                }
        
                for (Method m : clazz.getDeclaredMethods()) {
                    if (m.isAnnotationPresent((Class<? extends Annotation>) requestMapping)) {
                        found = true;
                        break;
                    }
                }
        
                assertTrue(found, "No @RequestMapping found on BookController");
        
            } catch (ClassNotFoundException e) {
                fail("BookController class not found.");
            } catch (Exception e) {
                fail("Unable to verify @RequestMapping on BookController.");
            }
        }
        
        
        @Test
        @Order(39)
        void Day7_test_BorrowController_Has_RequestMapping() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.controller.BorrowController");
                Class<?> requestMapping = Class.forName("org.springframework.web.bind.annotation.RequestMapping");
        
                boolean found = false;
        
                if (clazz.isAnnotationPresent((Class<? extends Annotation>) requestMapping)) {
                    found = true;
                }
        
                for (Method m : clazz.getDeclaredMethods()) {
                    if (m.isAnnotationPresent((Class<? extends Annotation>) requestMapping)) {
                        found = true;
                        break;
                    }
                }
        
                assertTrue(found, "No @RequestMapping found on BorrowController");
        
            } catch (ClassNotFoundException e) {
                fail("BorrowController class not found.");
            } catch (Exception e) {
                fail("Unable to verify @RequestMapping on BorrowController.");
            }
        }
        
        @Test
        @Order(40)
        void Day7_test_BookController_Has_PathVariable() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.controller.BookController");
                Class<?> pathVariable = Class.forName("org.springframework.web.bind.annotation.PathVariable");
        
                boolean found = false;
        
                for (Method method : clazz.getDeclaredMethods()) {
                    for (Parameter param : method.getParameters()) {
                        if (param.isAnnotationPresent((Class<? extends Annotation>) pathVariable)) {
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
        
                assertTrue(found, "No @PathVariable found in BookController");
        
            } catch (ClassNotFoundException e) {
                fail("BookController class not found.");
            } catch (Exception e) {
                fail("Unable to verify @PathVariable in BookController.");
            }
        }

        @Test
        @Order(41)
        void Day7_test_BorrowController_Has_PathVariable() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.controller.BorrowController");
                Class<?> pathVariable = Class.forName("org.springframework.web.bind.annotation.PathVariable");
        
                boolean found = false;
        
                for (Method method : clazz.getDeclaredMethods()) {
                    for (Parameter param : method.getParameters()) {
                        if (param.isAnnotationPresent((Class<? extends Annotation>) pathVariable)) {
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
        
                assertTrue(found, "No @PathVariable found in BorrowController");
        
            } catch (ClassNotFoundException e) {
                fail("BorrowController class not found.");
            } catch (Exception e) {
                fail("Unable to verify @PathVariable in BorrowController.");
            }
        }
        
        @Test
        @Order(42)
        void Day7_test_FineController_Has_RequestMapping() {
            try {
                Class<?> clazz = Class.forName("com.examly.springapp.controller.FineController");
                Class<?> requestMapping = Class.forName("org.springframework.web.bind.annotation.RequestMapping");
        
                boolean found = false;
        
                // Class-level check
                if (clazz.isAnnotationPresent((Class<? extends Annotation>) requestMapping)) {
                    found = true;
                }
        
                // Method-level check
                for (Method m : clazz.getDeclaredMethods()) {
                    if (m.isAnnotationPresent((Class<? extends Annotation>) requestMapping)) {
                        found = true;
                        break;
                    }
                }
        
                assertTrue(found, "No @RequestMapping found on FineController");
        
            } catch (ClassNotFoundException e) {
                fail("FineController class not found.");
            } catch (Exception e) {
                fail("Unable to verify @RequestMapping in FineController.");
            }
        }
        
        @Test
        @Order(43)
        void Day8_test_BookCategoryService_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/service/BookCategoryService.java").isFile());
        }
        
        
        @Test
        @Order(44)
        void Day8_test_BookService_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/service/BookService.java").isFile());
        }
        
        @Test
        @Order(45)
        void Day8_test_MemberService_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/service/MemberService.java").isFile());
        }
        
        
        @Test
        @Order(46)
        void Day8_test_BorrowService_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/service/BorrowService.java").isFile());
        }
        
        
        @Test
        @Order(47)
        void Day8_test_FineService_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/service/FineService.java").isFile());
        }
        
        @Test
        @Order(48)
        void Day8_test_BookCategoryServiceImpl_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/service/BookCategoryServiceImpl.java").isFile());
        }


        @Test
        @Order(49)
        void Day8_test_BookServiceImpl_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/service/BookServiceImpl.java").isFile());
        }
        

        @Test
        @Order(50)
        void Day8_test_MemberServiceImpl_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/service/MemberServiceImpl.java").isFile());
        }


        @Test
        @Order(51)
        void Day8_test_BorrowServiceImpl_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/service/BorrowServiceImpl.java").isFile());
        }
        
        @Test
        @Order(52)
        void Day8_test_FineServiceImpl_File_Exists() {
            assertTrue(new File("src/main/java/com/examly/springapp/service/FineServiceImpl.java").isFile());
        }
        

            @Test
            @Order(53)
            public void Day8_testAddBookCategory() throws Exception {
                String requestBody = "{ \"categoryName\": \"Fiction\" }";
            
                mockMvc.perform(MockMvcRequestBuilders.post("/api/book-categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(MockMvcResultMatchers.status().isCreated())
                        .andExpect(MockMvcResultMatchers.jsonPath("$.categoryName").value("Fiction"))
                        .andReturn();
            }
            
            @Test
            @Order(54)
            public void Day8_testGetAllBookCategories() throws Exception {
                mockMvc.perform(MockMvcRequestBuilders.get("/api/book-categories")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(MockMvcResultMatchers.status().isOk())
                        .andExpect(MockMvcResultMatchers.jsonPath("$[0].categoryName").value("Fiction"))
                        .andReturn();
            }
            
            

            @Test
            @Order(55)
            public void Day8_testGetBookCategoryById() throws Exception {
                mockMvc.perform(MockMvcRequestBuilders.get("/api/book-categories/1")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(MockMvcResultMatchers.status().isOk())
                        .andExpect(MockMvcResultMatchers.jsonPath("$.categoryName").value("Fiction"))
                        .andReturn();
            }
            
            
            @Test
            @Order(56)
            public void Day8_testUpdateBookCategory() throws Exception {
                String requestBody = "{ \"categoryName\": \"History\" }";
            
                mockMvc.perform(MockMvcRequestBuilders.put("/api/book-categories/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(MockMvcResultMatchers.status().isOk())
                        .andExpect(MockMvcResultMatchers.jsonPath("$.categoryName").value("History"))
                        .andReturn();
            }
            

            @Test
            @Order(57)
            public void Day9_testPagination_PageNumberApplied() throws Exception {
            
                mockMvc.perform(MockMvcRequestBuilders.get("/api/book-categories/page/0/5")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(MockMvcResultMatchers.status().isOk())
                        .andExpect(MockMvcResultMatchers.jsonPath("$.pageable.pageNumber").value(0));
            }
            

            @Test
            @Order(58)
            public void Day9_testPagination_PageSizeApplied() throws Exception {
            
                mockMvc.perform(MockMvcRequestBuilders.get("/api/book-categories/page/1/10")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(MockMvcResultMatchers.status().isOk())
                        .andExpect(MockMvcResultMatchers.jsonPath("$.pageable.pageSize").value(10));
            }
            

            @Test
            @Order(59)
            public void Day9_testPagination_SortingPresent() throws Exception {
            
                mockMvc.perform(MockMvcRequestBuilders.get("/api/book-categories/page/0/5")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(MockMvcResultMatchers.status().isOk())
                        .andExpect(MockMvcResultMatchers.jsonPath("$.pageable.sort").exists())
                        .andExpect(MockMvcResultMatchers.jsonPath("$.pageable.sort.sorted").isBoolean());
            }
            
            @Test
            @Order(60)
            public void Day9_testPagination_ContentArrayExists() throws Exception {
            
                mockMvc.perform(MockMvcRequestBuilders.get("/api/book-categories/page/0/5")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(MockMvcResultMatchers.status().isOk())
                        .andExpect(MockMvcResultMatchers.jsonPath("$.content").isArray());
            }
            

            @Test
            @Order(61)
            public void Day9_testPagination_TotalElementsExists() throws Exception {
            
                mockMvc.perform(MockMvcRequestBuilders.get("/api/book-categories/page/0/5")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(MockMvcResultMatchers.status().isOk())
                        .andExpect(MockMvcResultMatchers.jsonPath("$.totalElements").exists());
            }
            

            @Test
            @Order(62)
            public void Day9_testPagination_TotalPagesExists() throws Exception {
            
                mockMvc.perform(MockMvcRequestBuilders.get("/api/book-categories/page/0/5")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(MockMvcResultMatchers.status().isOk())
                        .andExpect(MockMvcResultMatchers.jsonPath("$.totalPages").exists());
            }
            
            @Test
            @Order(63)
            public void Day10_testAddBook() throws Exception {
            
                String requestBody = "{ \"title\": \"Clean Code\", \"author\": \"Robert Martin\", \"available\": true, \"bookCategory\": { \"categoryId\": 1 } }";
            
                mockMvc.perform(MockMvcRequestBuilders.post("/api/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(MockMvcResultMatchers.status().isCreated())
                        .andExpect(MockMvcResultMatchers.jsonPath("$.title").value("Clean Code"))
                        .andExpect(MockMvcResultMatchers.jsonPath("$.author").value("Robert Martin"))
                        .andReturn();
            }
            
            @Test
            @Order(64)
            public void Day10_testGetAllBooks() throws Exception {
                mockMvc.perform(MockMvcRequestBuilders.get("/api/books")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(MockMvcResultMatchers.status().isOk())
                        .andExpect(MockMvcResultMatchers.jsonPath("$[0].title").value("Clean Code"))
                        .andExpect(MockMvcResultMatchers.jsonPath("$[0].author").value("Robert Martin"))
                        .andReturn();
            }
            

            @Test
            @Order(65)
            public void Day10_testGetBookById() throws Exception {
                mockMvc.perform(MockMvcRequestBuilders.get("/api/books/1")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(MockMvcResultMatchers.status().isOk())
                        .andExpect(MockMvcResultMatchers.jsonPath("$.title").value("Clean Code"))
                        .andExpect(MockMvcResultMatchers.jsonPath("$.author").value("Robert Martin"))
                        .andReturn();
            }
            
            @Test
            @Order(66)
            public void Day10_testUpdateBook() throws Exception {
            
                String requestBody = "{ \"title\": \"Effective Java\", \"author\": \"Joshua Bloch\", \"available\": false, \"bookCategory\": { \"categoryId\": 1 } }";
            
                mockMvc.perform(MockMvcRequestBuilders.put("/api/books/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(MockMvcResultMatchers.status().isOk())
                        .andExpect(MockMvcResultMatchers.jsonPath("$.title").value("Effective Java"))
                        .andExpect(MockMvcResultMatchers.jsonPath("$.author").value("Joshua Bloch"))
                        .andReturn();
            }
            

            @Test
            @Order(67)
            public void Day10_testAddMember() throws Exception {
            
                String requestBody = "{ \"name\": \"Ravi Kumar\", \"phone\": \"9876543210\", \"email\": \"ravi@gmail.com\" }";
            
                mockMvc.perform(MockMvcRequestBuilders.post("/api/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.name").value("Ravi Kumar"))
                        .andExpect(jsonPath("$.phone").value("9876543210"))
                        .andExpect(jsonPath("$.email").value("ravi@gmail.com"))
                        .andReturn();
            }
            
            
            @Test
            @Order(68)
            public void Day10_testGetAllMembers() throws Exception {
            
                mockMvc.perform(MockMvcRequestBuilders.get("/api/members")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$[0].name").value("Ravi Kumar"))
                        .andReturn();
            }
            
            @Test
            @Order(69)
            public void Day10_testGetMemberById() throws Exception {
            
                mockMvc.perform(MockMvcRequestBuilders.get("/api/members/1")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.memberId").value(1))
                        .andReturn();
            }
            
            

            @Test
            @Order(70)
            public void Day10_testUpdateMember() throws Exception {
            
                String requestBody = "{ \"name\": \"Ravi Sharma\", \"phone\": \"9123456789\", \"email\": \"ravi@library.com\" }";
            
                mockMvc.perform(MockMvcRequestBuilders.put("/api/members/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.name").value("Ravi Sharma"))
                        .andExpect(jsonPath("$.phone").value("9123456789"))
                        .andExpect(jsonPath("$.email").value("ravi@library.com"))
                        .andReturn();
            }
            

            @Test
            @Order(71)
            public void Day11_testGetMembersByPhone() throws Exception {
            
                mockMvc.perform(MockMvcRequestBuilders.get("/api/members/phone/9123456789")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$[0].name").value("Ravi Sharma"))
                        .andExpect(jsonPath("$[0].phone").value("9123456789"))
                        .andReturn();
            }
            
            @Test
            @Order(72)
            public void Day12_testGetBooksByCategoryName() throws Exception {
            
                mockMvc.perform(MockMvcRequestBuilders.get("/api/books/category/History")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$[0].title").value("Effective Java"))
                        .andExpect(jsonPath("$[0].author").value("Joshua Bloch"))
                        .andReturn();
            }
            

            @Test
            @Order(73)
            public void Day12_testGetMemberByEmail() throws Exception {
            
                mockMvc.perform(MockMvcRequestBuilders.get("/api/members/email/ravi@library.com")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$[0].email").value("ravi@library.com"))
                        .andReturn();
            }
            
            @Test
            @Order(74)
            public void Day12_testGetMemberByPhone_NotFound() throws Exception {
            
                mockMvc.perform(MockMvcRequestBuilders.get("/api/members/phone/9999999999")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(status().isNoContent())
                        .andExpect(content().string("No member found with phone: 9999999999"));
            }
            


            @Test
            @Order(75)
            public void Day12_testGetBookByTitle() throws Exception {
            
                mockMvc.perform(MockMvcRequestBuilders.get("/api/books/title/Effective Java")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$[0].title").value("Effective Java"))
                        .andReturn();
            }
            
            @Test
            @Order(76)
            public void Day12_testGetBookByTitle_NotFound() throws Exception {
            
                mockMvc.perform(MockMvcRequestBuilders.get("/api/books/title/Unknown Book")
                        .accept(MediaType.APPLICATION_JSON))
                        .andExpect(status().isNotFound())
                        .andExpect(content().string("No book found with title: Unknown Book"));
            }
            

@Test
@Order(77)
    void Day13_test_execption_Directory_Exists() {
        assertTrue(new File("src/main/java/com/examly/springapp/exception").isDirectory());
    }


	
@Test
@Order(78)
void Day13_test_GloabalEception_File_Exists() {
    assertTrue(new File("src/main/java/com/examly/springapp/exception/GlobalExceptionHandler.java").isFile());
}


@Test
@Order(79)
    void Day14_test_configuartion_Directory_Exists() {
        assertTrue(new File("src/main/java/com/examly/springapp/configuration").isDirectory());
    }

@Test
@Order(80)
public void Day15_testAOPLogFileExists() {

    assertTrue(new File("src/main/java/com/examly/springapp/aop").isDirectory());
   
}

}
