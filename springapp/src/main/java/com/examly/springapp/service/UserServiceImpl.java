package com.examly.springapp.service;

import com.examly.springapp.dto.AuthResponse;
import com.examly.springapp.dto.LoginRequest;
import com.examly.springapp.dto.RegisterRequest;
import com.examly.springapp.dto.UserResponse;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.security.JwtUtil;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_.-]{3,30}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^[0-9+\\-\\s()]{7,20}$");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostConstruct
    public void init() {
        seedDefaultUsersIfEmpty();
    }

    @Override
    @Transactional
    public synchronized void seedDefaultUsersIfEmpty() {
        if (!userRepository.existsByUsernameIgnoreCase("admin")) {
            User admin = new User(
                    "System Administrator",
                    "admin",
                    "admin@aurevia.edu",
                    "9876543210",
                    passwordEncoder.encode("Admin@1234!"),
                    "ADMIN",
                    "ACTIVE"
            );
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsernameIgnoreCase("librarian")) {
            User librarian = new User(
                    "Senior Librarian",
                    "librarian",
                    "librarian@aurevia.edu",
                    "9876543211",
                    passwordEncoder.encode("Librarian@1234!"),
                    "LIBRARIAN",
                    "ACTIVE"
            );
            userRepository.save(librarian);
        }

        if (!userRepository.existsByUsernameIgnoreCase("student")) {
            User student = new User(
                    "Ravi Kumar",
                    "student",
                    "student@aurevia.edu",
                    "9876543212",
                    passwordEncoder.encode("Student@1234!"),
                    "STUDENT",
                    "ACTIVE"
            );
            userRepository.save(student);
        }
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        validateRegistrationRequest(request, false);

        String role = "STUDENT";
        if (request.getRole() != null && !request.getRole().isBlank()) {
            String requestedRole = request.getRole().trim().toUpperCase();
            if ("ADMIN".equals(requestedRole) || "LIBRARIAN".equals(requestedRole)) {
                throw new IllegalArgumentException("Registration with " + requestedRole + " role is not permitted through public sign-up. Only authorized administrators can create " + requestedRole + " accounts.");
            }
        }

        String passwordHash = passwordEncoder.encode(request.getPassword().trim());

        User user = new User(
                request.getFullName().trim(),
                request.getUsername().trim(),
                request.getEmail().trim().toLowerCase(),
                request.getPhone() != null ? request.getPhone().trim() : null,
                passwordHash,
                role,
                "ACTIVE"
        );

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser, false);
        long expiresIn = jwtUtil.getExpirationTimeSeconds(false);

        return new AuthResponse(token, "Bearer", expiresIn, UserResponse.fromUser(savedUser));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        if (request.getUsernameOrEmail() == null || request.getUsernameOrEmail().trim().isBlank()) {
            throw new IllegalArgumentException("Username or email is required.");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }

        String identifier = request.getUsernameOrEmail().trim();

        User user = userRepository.findByUsernameIgnoreCase(identifier)
                .or(() -> userRepository.findByEmailIgnoreCase(identifier))
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid username or password.");
        }

        if ("DISABLED".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalStateException("Your account has been disabled. Please contact the library administrator.");
        }

        boolean rememberMe = request.getRememberMe() != null && request.getRememberMe();
        String token = jwtUtil.generateToken(user, rememberMe);
        long expiresIn = jwtUtil.getExpirationTimeSeconds(rememberMe);

        return new AuthResponse(token, "Bearer", expiresIn, UserResponse.fromUser(user));
    }

    @Override
    public UserResponse getCurrentUser(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Authentication token is required.");
        }

        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }

        if (!jwtUtil.validateToken(token)) {
            throw new IllegalArgumentException("Session expired or token is invalid. Please login again.");
        }

        String username = jwtUtil.getUsernameFromToken(token);
        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new IllegalArgumentException("Account not found."));

        if ("DISABLED".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalStateException("Your account has been disabled.");
        }

        return UserResponse.fromUser(user);
    }

    @Override
    public UserResponse verifyToken(String token) {
        return getCurrentUser(token);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(Long id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        if (status == null || (!status.equalsIgnoreCase("ACTIVE") && !status.equalsIgnoreCase("DISABLED"))) {
            throw new IllegalArgumentException("Invalid status. Expected ACTIVE or DISABLED.");
        }

        user.setStatus(status.toUpperCase());
        User updated = userRepository.save(user);
        return UserResponse.fromUser(updated);
    }

    @Override
    @Transactional
    public UserResponse createUserByAdmin(RegisterRequest request) {
        validateRegistrationRequest(request, true);

        String role = (request.getRole() != null && !request.getRole().isBlank()) 
                ? request.getRole().trim().toUpperCase() 
                : "STUDENT";

        String passwordHash = passwordEncoder.encode(request.getPassword().trim());

        User user = new User(
                request.getFullName().trim(),
                request.getUsername().trim(),
                request.getEmail().trim().toLowerCase(),
                request.getPhone() != null ? request.getPhone().trim() : null,
                passwordHash,
                role,
                "ACTIVE"
        );

        User saved = userRepository.save(user);
        return UserResponse.fromUser(saved);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        if ("ADMIN".equalsIgnoreCase(user.getRole()) && "admin".equalsIgnoreCase(user.getUsername())) {
            throw new IllegalArgumentException("Primary system administrator cannot be deleted.");
        }
        userRepository.delete(user);
    }

    private void validateRegistrationRequest(RegisterRequest request, boolean isAdminCreation) {
        if (request == null) {
            throw new IllegalArgumentException("Registration request cannot be empty.");
        }

        // Full Name
        if (request.getFullName() == null || request.getFullName().trim().isBlank()) {
            throw new IllegalArgumentException("Full Name is required.");
        }
        if (request.getFullName().trim().length() < 2) {
            throw new IllegalArgumentException("Full Name must be at least 2 characters long.");
        }
        if (request.getFullName().trim().length() > 100) {
            throw new IllegalArgumentException("Full Name cannot exceed 100 characters.");
        }

        // Username
        if (request.getUsername() == null || request.getUsername().trim().isBlank()) {
            throw new IllegalArgumentException("Username is required.");
        }
        String username = request.getUsername().trim();
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            throw new IllegalArgumentException("Username must be between 3 and 30 characters and contain only letters, numbers, underscores, and hyphens.");
        }
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username already exists.");
        }

        // Email
        if (request.getEmail() == null || request.getEmail().trim().isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        String email = request.getEmail().trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Enter a valid email address.");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email already registered.");
        }

        // Phone
        if (request.getPhone() != null && !request.getPhone().trim().isBlank()) {
            if (!PHONE_PATTERN.matcher(request.getPhone().trim()).matches()) {
                throw new IllegalArgumentException("Enter a valid phone number.");
            }
        }

        // Password
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required.");
        }
        String password = request.getPassword();
        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must contain at least 8 characters.");
        }
        if (!Pattern.compile("[A-Z]").matcher(password).find()) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter.");
        }
        if (!Pattern.compile("[a-z]").matcher(password).find()) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter.");
        }
        if (!Pattern.compile("[0-9]").matcher(password).find()) {
            throw new IllegalArgumentException("Password must contain at least one number.");
        }
        if (!Pattern.compile("[@$!%*?&^#~_\\-\\+=<>]").matcher(password).find()) {
            throw new IllegalArgumentException("Password must contain at least one special character (@$!%*?& etc.).");
        }

        // Confirm Password
        if (request.getConfirmPassword() == null || !request.getConfirmPassword().equals(password)) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        // Public role restriction
        if (!isAdminCreation && request.getRole() != null) {
            String role = request.getRole().trim().toUpperCase();
            if ("ADMIN".equals(role)) {
                throw new IllegalArgumentException("Registration with ADMIN role is not permitted through public sign-up.");
            }
        }
    }
}
