package com.tasty.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.Locale;

/** Refuses to start the production profile with development placeholders still in place. */
@Slf4j
@Component
@Profile("prod")
@RequiredArgsConstructor
public class ProductionSafetyCheck implements ApplicationRunner {

    private final JwtProperties jwtProperties;
    private final CorsProperties corsProperties;

    @Override
    public void run(ApplicationArguments args) {
        String secret = jwtProperties.secret() == null ? "" : jwtProperties.secret().toLowerCase(Locale.ROOT);
        if (secret.contains("dev-only") || secret.contains("change-me")) {
            throw new IllegalStateException("JWT_SECRET still holds a development placeholder. Generate one with `openssl rand -base64 48`.");
        }
        if (corsProperties.allowedOrigins().stream().anyMatch(origin -> origin.contains("localhost"))) {
            log.warn("CORS_ALLOWED_ORIGINS contains localhost in production: {}", corsProperties.allowedOrigins());
        }
    }
}
