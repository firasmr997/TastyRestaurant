package com.tasty.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI tastyOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Tasty API")
                        .version("1.0.0")
                        .description("""
                                REST API behind the Tasty restaurant website and its admin dashboard.

                                **Authentication.** Call `POST /api/auth/login`, copy the `token` from the response and \
                                press **Authorize** (format: the raw token). Endpoints marked with a lock require it.

                                **Envelope.** Every response is wrapped: `{ "success": true, "data": ..., "message": "Success" }` \
                                or `{ "success": false, "message": "...", "errors": [{ "field": "...", "message": "..." }] }`.

                                **Images.** Upload with `POST /api/images`, then reference the returned `url` and \
                                `storageKey` when creating or updating dishes and gallery photos.
                                """)
                        .contact(new Contact().name("Tasty")))
                .components(new Components().addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("JWT returned by POST /api/auth/login")))
                .tags(List.of(
                        new Tag().name("Authentication").description("Staff sign-in and account"),
                        new Tag().name("Categories").description("Menu categories"),
                        new Tag().name("Menu").description("Dishes, search and filters"),
                        new Tag().name("Gallery").description("Food and restaurant photography"),
                        new Tag().name("Images").description("Image uploads and storage"),
                        new Tag().name("Contact").description("Public contact form"),
                        new Tag().name("Messages").description("Contact message inbox (staff)"),
                        new Tag().name("Dashboard").description("Admin overview and analytics"),
                        new Tag().name("Settings").description("Restaurant profile, hours and promotion")));
    }
}
