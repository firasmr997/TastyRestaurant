package com.tasty;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Menu CRUD, search and filters")
class MenuCrudIntegrationTest extends AbstractIntegrationTest {

    private static final String DISH = """
            {"name":"%s","nameFr":"Plat test","description":"Charred, saucy and built for testing.",
             "price":%s,"categoryId":%d,"ingredients":["Beef","Smoked cheddar"],"ingredientsFr":["Boeuf"],
             "mainImage":{"url":"https://images.unsplash.com/photo-1568901346375-23c9450c58cd","altText":"Test"},
             "additionalImages":[{"url":"https://images.unsplash.com/photo-1550547660-d9450f859349"},
                                 {"url":"/uploads/menu/0b1c2d3e-0000-0000-0000-000000000000.webp"}],
             "available":true,"featured":false,"vegetarian":false,"spicy":true}
            """;

    @Test
    void seedDataIsAvailableToTheMenu() throws Exception {
        mvc.perform(get("/api/menu").param("size", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", greaterThanOrEqualTo(20)))
                .andExpect(jsonPath("$.data.content[0].category.slug").value("burgers"));
        mvc.perform(get("/api/menu/slug/the-tasty-smash"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.ingredients", hasItem("Aged cheddar")))
                .andExpect(jsonPath("$.data.additionalImages.length()").value(2));
    }

    @Test
    void createReadUpdateToggleDelete() throws Exception {
        String token = adminToken();
        String name = unique("Smoke Test Burger");

        MvcResult created = mvc.perform(post("/api/menu")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(DISH.formatted(name, "14.50", 1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value(name))
                .andExpect(jsonPath("$.data.price").value(14.5))
                .andExpect(jsonPath("$.data.ingredients.length()").value(2))
                .andExpect(jsonPath("$.data.additionalImages.length()").value(2))
                .andExpect(jsonPath("$.data.category.slug").value("burgers"))
                .andExpect(jsonPath("$.data.spicy").value(true))
                .andReturn();
        Integer id = read(created, "$.data.id");
        String slug = read(created, "$.data.slug");

        mvc.perform(get("/api/menu/" + id)).andExpect(status().isOk());
        mvc.perform(get("/api/menu/slug/" + slug)).andExpect(jsonPath("$.data.id").value(id));

        String updated = DISH.formatted(name, "15.00", 2).replace("\"available\":true", "\"available\":false");
        mvc.perform(put("/api/menu/" + id)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updated))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.price").value(15.0))
                .andExpect(jsonPath("$.data.category.slug").value("sandwiches"))
                .andExpect(jsonPath("$.data.available").value(false))
                .andExpect(jsonPath("$.data.slug").value(slug));

        mvc.perform(patch("/api/menu/" + id + "/status")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"featured\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.featured").value(true))
                .andExpect(jsonPath("$.data.available").value(false));

        mvc.perform(delete("/api/menu/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/menu/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void validationRejectsBadDishes() throws Exception {
        mvc.perform(post("/api/menu")
                        .header(HttpHeaders.AUTHORIZATION, bearer(adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"","description":"","price":-1,"categoryId":null,
                                 "ingredients":["has, comma"],"mainImage":{"url":"javascript:alert(1)"}}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[*].field", hasItem("name")))
                .andExpect(jsonPath("$.errors[*].field", hasItem("description")))
                .andExpect(jsonPath("$.errors[*].field", hasItem("price")))
                .andExpect(jsonPath("$.errors[*].field", hasItem("categoryId")))
                .andExpect(jsonPath("$.errors[*].field", hasItem("mainImage.url")));
    }

    @Test
    void unknownCategoryIsABadRequest() throws Exception {
        mvc.perform(post("/api/menu")
                        .header(HttpHeaders.AUTHORIZATION, bearer(adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(DISH.formatted(unique("Lost dish"), "10", 999_999)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void searchMatchesNamesDescriptionsAndIngredientsInBothLanguages() throws Exception {
        mvc.perform(get("/api/menu").param("q", "pickles").param("size", "100"))
                .andExpect(jsonPath("$.data.content[*].slug", hasItem("the-tasty-smash")));
        mvc.perform(get("/api/menu").param("q", "champignons").param("size", "100"))
                .andExpect(jsonPath("$.data.content[*].slug", hasItem("truffle-mushroom-burger")));
        mvc.perform(get("/api/menu").param("q", "zzz-no-such-dish"))
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    void filtersByCategoryAvailabilityAndFeatured() throws Exception {
        mvc.perform(get("/api/menu").param("category", "desserts").param("size", "100"))
                .andExpect(jsonPath("$.data.content[*].category.slug", everyItem(is("desserts"))));
        mvc.perform(get("/api/menu").param("featured", "true").param("size", "100"))
                .andExpect(jsonPath("$.data.totalElements", greaterThanOrEqualTo(5)))
                .andExpect(jsonPath("$.data.content[*].featured", everyItem(is(true))));
        mvc.perform(get("/api/menu").param("available", "false").param("size", "100"))
                .andExpect(jsonPath("$.data.content[*].available", everyItem(is(false))));
    }

    @Test
    void paginationIsBounded() throws Exception {
        mvc.perform(get("/api/menu").param("page", "0").param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.size").value(12))
                .andExpect(jsonPath("$.data.content.length()").value(12))
                .andExpect(jsonPath("$.data.first").value(true));
        mvc.perform(get("/api/menu").param("size", "1000")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/menu").param("page", "-1")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/menu").param("sort", "drop table")).andExpect(status().isBadRequest());
    }

    @Test
    void dishesInHiddenCategoriesAreHiddenFromGuests() throws Exception {
        String token = adminToken();
        MvcResult category = mvc.perform(post("/api/categories")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"%s\",\"displayOrder\":40,\"active\":false}".formatted(unique("Secret menu"))))
                .andExpect(status().isCreated())
                .andReturn();
        Integer categoryId = read(category, "$.data.id");
        MvcResult dish = mvc.perform(post("/api/menu")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(DISH.formatted(unique("Hidden dish"), "11", categoryId)))
                .andExpect(status().isCreated())
                .andReturn();
        Integer dishId = read(dish, "$.data.id");

        mvc.perform(get("/api/menu/" + dishId)).andExpect(status().isNotFound());
        mvc.perform(get("/api/menu/" + dishId).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk());
    }
}
