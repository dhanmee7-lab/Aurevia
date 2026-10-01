package com.examly.springapp.dto;

public class LoginRequest {

    private String usernameOrEmail;
    private String password;
    private Boolean rememberMe = false;

    public LoginRequest() {}

    public LoginRequest(String usernameOrEmail, String password, Boolean rememberMe) {
        this.usernameOrEmail = usernameOrEmail;
        this.password = password;
        this.rememberMe = rememberMe != null && rememberMe;
    }

    public String getUsernameOrEmail() {
        return usernameOrEmail;
    }

    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getRememberMe() {
        return rememberMe != null && rememberMe;
    }

    public void setRememberMe(Boolean rememberMe) {
        this.rememberMe = rememberMe != null && rememberMe;
    }
}
