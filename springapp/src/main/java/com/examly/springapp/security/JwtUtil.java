package com.examly.springapp.security;

import com.examly.springapp.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    // 256-bit secure secret key for HMAC-SHA256
    private static final String DEFAULT_SECRET = "AureviaSecureJwtSecretKeyForSchoolLibraryManagementSystem2026!#$";
    private static final long DEFAULT_EXPIRATION_MS = 24 * 60 * 60 * 1000L; // 24 hours
    private static final long REMEMBER_ME_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000L; // 7 days

    private final Key signingKey;

    public JwtUtil() {
        this.signingKey = Keys.hmacShaKeyFor(DEFAULT_SECRET.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user, boolean rememberMe) {
        long expirationMs = rememberMe ? REMEMBER_ME_EXPIRATION_MS : DEFAULT_EXPIRATION_MS;
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("fullName", user.getFullName());
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole());
        claims.put("status", user.getStatus());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getUsername())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getUsernameFromToken(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String getRoleFromToken(String token) {
        Claims claims = extractAllClaims(token);
        return (String) claims.get("role");
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = extractAllClaims(token);
        Object id = claims.get("userId");
        if (id instanceof Number) {
            return ((Number) id).longValue();
        }
        return null;
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public long getExpirationTimeSeconds(boolean rememberMe) {
        return (rememberMe ? REMEMBER_ME_EXPIRATION_MS : DEFAULT_EXPIRATION_MS) / 1000L;
    }
}
