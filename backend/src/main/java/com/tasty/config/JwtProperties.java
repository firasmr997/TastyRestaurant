package com.tasty.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "tasty.jwt")
public record JwtProperties(String secret, Duration expiration, String issuer) {

    public JwtProperties {
        if (expiration == null) {
            expiration = Duration.ofHours(12);
        }
        if (issuer == null || issuer.isBlank()) {
            issuer = "tasty-api";
        }
    }
}
