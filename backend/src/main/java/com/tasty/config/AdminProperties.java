package com.tasty.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Optional bootstrap administrator, typically supplied through environment variables in production. */
@ConfigurationProperties(prefix = "tasty.admin")
public record AdminProperties(String email, String password, String name) {

    public boolean isConfigured() {
        return email != null && !email.isBlank() && password != null && !password.isBlank();
    }
}
