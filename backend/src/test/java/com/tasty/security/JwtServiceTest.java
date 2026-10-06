package com.tasty.security;

import com.tasty.config.JwtProperties;
import com.tasty.entity.Role;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-0123456789abcdefghijklmnopqrstuvwxyz";
    private static final AppUserDetails USER = new AppUserDetails(7L, "Ada", "ada@tasty.local", "hash", Role.EDITOR);

    @Test
    void issuedTokensVerifyAndCarryTheUser() {
        JwtService service = new JwtService(new JwtProperties(SECRET, Duration.ofHours(1), "tasty-api"));
        JwtService.IssuedToken token = service.issue(USER);

        var claims = service.verify(token.token()).orElseThrow();
        assertThat(claims.getSubject()).isEqualTo("ada@tasty.local");
        assertThat(claims.get("role", String.class)).isEqualTo("EDITOR");
        assertThat(token.expiresAt()).isAfter(Instant.now());
    }

    @Test
    void expiredTokensAreRejected() {
        Clock past = Clock.fixed(Instant.now().minus(Duration.ofHours(3)), ZoneOffset.UTC);
        JwtService issuer = new JwtService(new JwtProperties(SECRET, Duration.ofHours(1), "tasty-api"), past);
        JwtService verifier = new JwtService(new JwtProperties(SECRET, Duration.ofHours(1), "tasty-api"));

        assertThat(verifier.verify(issuer.issue(USER).token())).isEmpty();
    }

    @Test
    void tokensSignedWithAnotherKeyOrIssuerAreRejected() {
        JwtService service = new JwtService(new JwtProperties(SECRET, Duration.ofHours(1), "tasty-api"));
        JwtService otherKey = new JwtService(new JwtProperties(SECRET + "-other", Duration.ofHours(1), "tasty-api"));
        JwtService otherIssuer = new JwtService(new JwtProperties(SECRET, Duration.ofHours(1), "someone-else"));

        assertThat(service.verify(otherKey.issue(USER).token())).isEmpty();
        assertThat(service.verify(otherIssuer.issue(USER).token())).isEmpty();
        assertThat(service.verify("garbage")).isEmpty();
    }

    @Test
    void refusesWeakSecrets() {
        assertThatThrownBy(() -> new JwtService(new JwtProperties("too-short", Duration.ofHours(1), "tasty-api")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT_SECRET");
        assertThatThrownBy(() -> new JwtService(new JwtProperties(null, Duration.ofHours(1), "tasty-api")))
                .isInstanceOf(IllegalStateException.class);
    }
}
