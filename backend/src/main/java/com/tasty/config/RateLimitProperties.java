package com.tasty.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "tasty.rate-limit")
public record RateLimitProperties(int loginAttempts, Duration loginWindow, int contactSubmissions, Duration contactWindow) {

    public RateLimitProperties {
        if (loginAttempts <= 0) {
            loginAttempts = 10;
        }
        if (loginWindow == null) {
            loginWindow = Duration.ofMinutes(15);
        }
        if (contactSubmissions <= 0) {
            contactSubmissions = 5;
        }
        if (contactWindow == null) {
            contactWindow = Duration.ofMinutes(10);
        }
    }
}
