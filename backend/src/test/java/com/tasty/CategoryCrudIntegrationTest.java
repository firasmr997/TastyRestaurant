package com.tasty;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Category CRUD")
class CategoryCrudIntegrationTest extends AbstractIntegrationTest {

    @Test
    void seededCategoriesArePublicAndOrdered() throws Exception {
        mvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", greaterThanOrEqualTo(7)))
                .andExpect(jsonPath("$.data.content[0].slug").value("burgers"))
                .andExpect(jsonPath("$.data.content[*].active", everyItem(org.hamcrest.Matchers.is(true))));
    }

    @Test
    void createReadUpdateDelete() throws Exception {
        String token = adminToken();
        String name = unique("Brunch");

        MvcResult created = mvc.perform(post("/api/categories")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"%s","nameFr":"Brunch FR","description":"Weekend plates","displayOrder":20,"active":true}
                                """.formatted(name)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value(name))
                .andExpect(jsonPath("$.data.slug", containsString("brunch")))
                .andExpect(jsonPath("$.data.itemCount").value(0))
                .andExpect(jsonPath("$.data.createdBy").value(ADMIN_EMAIL))
                .andReturn();
        Integer id = read(created, "$.data.id");
        String slug = read(created, "$.data.slug");

        mvc.perform(get("/api/categories/slug/" + slug))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(id));

        mvc.perform(put("/api/categories/" + id)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"%s","description":"Updated","displayOrder":21,"active":false}
                                """.formatted(name)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false))
                .andExpect(jsonPath("$.data.slug").value(slug));

        // Inactive categories disappear from the public site but stay visible to staff.
        mvc.perform(get("/api/categories/" + id)).andExpect(status().isNotFound());
        mvc.perform(get("/api/categories/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk());

        mvc.perform(delete("/api/categories/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        mvc.perform(get("/api/categories/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isNotFound());
    }

    @Test
    void duplicateNamesAreRejected() throws Exception {
        mvc.perform(post("/api/categories")
                        .header(HttpHeaders.AUTHORIZATION, bearer(adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"BURGERS\",\"displayOrder\":1,\"active\":true}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void validationErrorsListTheFields() throws Exception {
        mvc.perform(post("/api/categories")
                        .header(HttpHeaders.AUTHORIZATION, bearer(adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"slug\":\"Not A Slug\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[*].field", hasItem("name")))
                .andExpect(jsonPath("$.errors[*].field", hasItem("slug")))
                .andExpect(jsonPath("$.errors[*].field", hasItem("displayOrder")))
                .andExpect(jsonPath("$.errors[*].field", hasItem("active")));
    }

    @Test
    void deletingACategoryWithDishesRequiresReassignment() throws Exception {
        String token = adminToken();
        Integer source = createCategory(token, unique("Source"));
        Integer target = createCategory(token, unique("Target"));
        mvc.perform(post("/api/menu")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"%s","description":"Dish that must survive its category.","price":9.5,"categoryId":%d}
                                """.formatted(unique("Orphan check"), source)))
                .andExpect(status().isCreated());

        mvc.perform(delete("/api/categories/" + source).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("1 dish")));

        mvc.perform(delete("/api/categories/" + source).param("reassignTo", String.valueOf(source))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());

        mvc.perform(delete("/api/categories/" + source).param("reassignTo", String.valueOf(target))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk());

        mvc.perform(get("/api/categories/" + target).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(jsonPath("$.data.itemCount").value(1));
    }

    @Test
    void editorsCanCreateButAnonymousCannot() throws Exception {
        mvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Nope\",\"displayOrder\":1,\"active\":true}"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/categories")
                        .header(HttpHeaders.AUTHORIZATION, bearer(editorToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"%s\",\"displayOrder\":1,\"active\":true}".formatted(unique("Editor cat"))))
                .andExpect(status().isCreated());
    }

    private Integer createCategory(String token, String name) throws Exception {
        MvcResult result = mvc.perform(post("/api/categories")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"%s\",\"displayOrder\":30,\"active\":true}".formatted(name)))
                .andExpect(status().isCreated())
                .andReturn();
        return read(result, "$.data.id");
    }
}
