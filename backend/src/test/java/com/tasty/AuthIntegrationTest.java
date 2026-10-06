package com.tasty;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Authentication and authorization")
class AuthIntegrationTest extends AbstractIntegrationTest {

    @Test
    void loginReturnsJwtAndUser() throws Exception {
        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"ADMIN@tasty.local\",\"password\":\"Admin123!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value(ADMIN_EMAIL))
                .andExpect(jsonPath("$.data.user.role").value("ADMIN"))
                .andExpect(jsonPath("$.data.user.password").doesNotExist());
    }

    @Test
    void wrongPasswordIsRejectedWithoutRevealingWhichFieldWasWrong() throws Exception {
        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@tasty.local\",\"password\":\"wrong-password\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));

        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"nobody@tasty.local\",\"password\":\"whatever1\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void loginValidatesInput() throws Exception {
        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"not-an-email\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[*].field", hasItem("email")))
                .andExpect(jsonPath("$.errors[*].field", hasItem("password")));
    }

    @Test
    void protectedEndpointsRequireAToken() throws Exception {
        mvc.perform(get("/api/dashboard"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
        mvc.perform(get("/api/messages"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/menu").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tamperedTokenIsRejected() throws Exception {
        String token = adminToken();
        String tampered = token.substring(0, token.length() - 4) + "abcd";
        mvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, bearer(tampered)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message", containsString("sign in again")));
    }

    @Test
    void validTokenGrantsAccess() throws Exception {
        mvc.perform(get("/api/auth/me").header(HttpHeaders.AUTHORIZATION, bearer(adminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value(ADMIN_EMAIL));
        mvc.perform(get("/api/dashboard").header(HttpHeaders.AUTHORIZATION, bearer(adminToken())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stats.totalItems").isNumber())
                .andExpect(jsonPath("$.data.messagesPerDay.length()").value(14));
    }

    @Test
    void publicEndpointsStayOpenEvenWithAnInvalidToken() throws Exception {
        mvc.perform(get("/api/menu").header(HttpHeaders.AUTHORIZATION, "Bearer not-a-real-token"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/settings"))
                .andExpect(status().isOk());
    }

    @Test
    void editorCannotChangeRestaurantSettings() throws Exception {
        mvc.perform(put("/api/settings")
                        .header(HttpHeaders.AUTHORIZATION, bearer(editorToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void editorCanManageContent() throws Exception {
        mvc.perform(get("/api/dashboard").header(HttpHeaders.AUTHORIZATION, bearer(editorToken())))
                .andExpect(status().isOk());
    }

    @Test
    void changePasswordChecksTheCurrentPassword() throws Exception {
        mvc.perform(put("/api/auth/password")
                        .header(HttpHeaders.AUTHORIZATION, bearer(editorToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"wrong\",\"newPassword\":\"NewPassword1\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", not(containsString("Exception"))));

        mvc.perform(put("/api/auth/password")
                        .header(HttpHeaders.AUTHORIZATION, bearer(editorToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"Editor123!\",\"newPassword\":\"short\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("newPassword"));
    }
}
