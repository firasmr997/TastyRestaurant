package com.tasty;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Contact form and message inbox")
class ContactMessageIntegrationTest extends AbstractIntegrationTest {

    @Test
    void submissionReachesTheInboxAndMovesThroughItsStatuses() throws Exception {
        String name = unique("Guest");
        mvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"%s","email":"Guest@Example.com","phone":"+1 555 0100",
                                 "message":"Can we bring a birthday cake on Saturday?","locale":"en"}
                                """.formatted(name)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));

        String token = adminToken();
        MvcResult inbox = mvc.perform(get("/api/messages").param("q", name)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].status").value("NEW"))
                .andExpect(jsonPath("$.data.content[0].email").value("guest@example.com"))
                .andReturn();
        Integer id = read(inbox, "$.data.content[0].id");

        mvc.perform(get("/api/messages/unread").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(jsonPath("$.data.latest[*].id", hasItem(id)));

        mvc.perform(put("/api/messages/" + id + "/read").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("READ"))
                .andExpect(jsonPath("$.data.readAt").isNotEmpty());

        mvc.perform(put("/api/messages/" + id + "/archive").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(jsonPath("$.data.status").value("ARCHIVED"));

        // Archived messages leave the inbox and appear under the ARCHIVED filter.
        mvc.perform(get("/api/messages").param("size", "100").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(jsonPath("$.data.content[*].id", not(hasItem(id))));
        mvc.perform(get("/api/messages").param("status", "ARCHIVED").param("size", "100")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(jsonPath("$.data.content[*].id", hasItem(id)));

        mvc.perform(delete("/api/messages/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/messages/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    void contactFormIsValidated() throws Exception {
        MvcResult result = mvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"email\":\"nope\",\"phone\":\"abc\",\"message\":\"short\",\"locale\":\"de\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andReturn();
        List<String> fields = read(result, "$.errors[*].field");
        org.assertj.core.api.Assertions.assertThat(fields)
                .contains("name", "email", "phone", "message", "locale");
    }

    @Test
    void honeypotSubmissionsAreAcceptedButNotStored() throws Exception {
        String name = unique("Bot");
        mvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"%s","email":"bot@example.com","message":"Buy cheap followers today!!!","website":"https://spam.example"}
                                """.formatted(name)))
                .andExpect(status().isCreated());
        mvc.perform(get("/api/messages").param("q", name).header(HttpHeaders.AUTHORIZATION, bearer(adminToken())))
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    void inboxIsStaffOnly() throws Exception {
        mvc.perform(get("/api/messages")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/messages/1/read")).andExpect(status().isUnauthorized());
    }
}
