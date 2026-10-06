package com.tasty;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MvcResult;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.util.zip.CRC32;
import java.util.zip.Deflater;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Gallery CRUD and image uploads")
class GalleryAndImageIntegrationTest extends AbstractIntegrationTest {

    @Test
    void seededGalleriesAreSplitIntoFoodAndRestaurant() throws Exception {
        mvc.perform(get("/api/gallery").param("group", "FOOD").param("size", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements", greaterThanOrEqualTo(30)))
                .andExpect(jsonPath("$.data.content[*].group", everyItem(is("FOOD"))));
        mvc.perform(get("/api/gallery").param("group", "RESTAURANT").param("size", "100"))
                .andExpect(jsonPath("$.data.totalElements", greaterThanOrEqualTo(10)))
                .andExpect(jsonPath("$.data.content[0].featured").value(true));
        mvc.perform(get("/api/gallery").param("category", "TEAM"))
                .andExpect(jsonPath("$.data.totalElements", greaterThanOrEqualTo(3)));
    }

    @Test
    void uploadThenCreateReplaceAndDeleteAPhoto() throws Exception {
        String token = adminToken();

        String[] first = upload(token, "restaurant");
        String[] second = upload(token, "restaurant");

        mvc.perform(get(first[0])).andExpect(status().isOk()).andExpect(content().contentType("image/png"));

        MvcResult created = mvc.perform(post("/api/gallery")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"%s","titleFr":"Le bar","imageUrl":"%s","storageKey":"%s","category":"BAR",
                                 "displayOrder":3,"featured":true,"menuItemId":1}
                                """.formatted(unique("Bar shot"), first[0], first[1])))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.group").value("RESTAURANT"))
                .andExpect(jsonPath("$.data.menuItem.slug").value("the-tasty-smash"))
                .andReturn();
        Integer id = read(created, "$.data.id");

        // Replacing the photo deletes the previous upload once the transaction commits.
        mvc.perform(put("/api/gallery/" + id)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Bar shot v2","imageUrl":"%s","storageKey":"%s","category":"INTERIOR",
                                 "displayOrder":1,"featured":false}
                                """.formatted(second[0], second[1])))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.imageUrl").value(second[0]))
                .andExpect(jsonPath("$.data.category").value("INTERIOR"))
                .andExpect(jsonPath("$.data.menuItem").doesNotExist());
        mvc.perform(get(first[0])).andExpect(status().isNotFound());

        mvc.perform(delete("/api/gallery/" + id).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk());
        mvc.perform(get("/api/gallery/" + id)).andExpect(status().isNotFound());
        mvc.perform(get(second[0])).andExpect(status().isNotFound());
    }

    @Test
    void uploadsAreValidated() throws Exception {
        String token = adminToken();
        // Text pretending to be a PNG
        mvc.perform(multipart("/api/images")
                        .file(new MockMultipartFile("file", "fake.png", "image/png", "not an image".getBytes()))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
        // Disallowed type
        mvc.perform(multipart("/api/images")
                        .file(new MockMultipartFile("file", "doc.pdf", "application/pdf", "%PDF-1.7".getBytes()))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());
        // Extension that contradicts the type
        mvc.perform(multipart("/api/images")
                        .file(new MockMultipartFile("file", "photo.gif", "image/png", tinyPng()))
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());
        // Unknown folder
        mvc.perform(multipart("/api/images")
                        .file(new MockMultipartFile("file", "photo.png", "image/png", tinyPng()))
                        .param("folder", "../etc")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());
        // Anonymous uploads are refused
        mvc.perform(multipart("/api/images")
                        .file(new MockMultipartFile("file", "photo.png", "image/png", tinyPng())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unusedUploadsCanBeDeletedButUsedOnesCannot() throws Exception {
        String token = adminToken();
        String[] unused = upload(token, "menu");
        mvc.perform(delete("/api/images").param("key", unused[1]).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isOk());
        mvc.perform(get(unused[0])).andExpect(status().isNotFound());

        String[] used = upload(token, "gallery");
        mvc.perform(post("/api/gallery")
                        .header(HttpHeaders.AUTHORIZATION, bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"In use","imageUrl":"%s","storageKey":"%s","category":"FOOD","displayOrder":1,"featured":false}
                                """.formatted(used[0], used[1])))
                .andExpect(status().isCreated());
        mvc.perform(delete("/api/images").param("key", used[1]).header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isConflict());
        mvc.perform(delete("/api/images").param("key", "../../secret.txt").header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void galleryValidation() throws Exception {
        mvc.perform(post("/api/gallery")
                        .header(HttpHeaders.AUTHORIZATION, bearer(adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"x\",\"imageUrl\":\"https://a.example/c.jpg\",\"category\":\"PIZZA\",\"displayOrder\":1,\"featured\":false}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("category"));
        mvc.perform(post("/api/gallery")
                        .header(HttpHeaders.AUTHORIZATION, bearer(adminToken()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"\",\"imageUrl\":\"ftp://nope\",\"displayOrder\":1,\"featured\":false}"))
                .andExpect(status().isBadRequest());
    }

    /** Uploads a tiny PNG and returns {url, storageKey}. */
    private String[] upload(String token, String folder) throws Exception {
        MvcResult result = mvc.perform(multipart("/api/images")
                        .file(new MockMultipartFile("file", "photo.png", "image/png", tinyPng()))
                        .param("folder", folder)
                        .header(HttpHeaders.AUTHORIZATION, bearer(token)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.url", startsWith("/uploads/" + folder + "/")))
                .andReturn();
        return new String[]{read(result, "$.data.url"), read(result, "$.data.storageKey")};
    }

    /** A valid 2x2 RGB PNG built in memory. */
    static byte[] tinyPng() throws Exception {
        ByteArrayOutputStream png = new ByteArrayOutputStream();
        png.write(new byte[]{(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n'});
        writeChunk(png, "IHDR", ByteBuffer.allocate(13).putInt(2).putInt(2).put((byte) 8).put((byte) 2)
                .put((byte) 0).put((byte) 0).put((byte) 0).array());
        byte[] raw = {0, (byte) 232, 72, 44, (byte) 232, 72, 44, 0, (byte) 232, 72, 44, (byte) 232, 72, 44};
        Deflater deflater = new Deflater();
        deflater.setInput(raw);
        deflater.finish();
        byte[] buffer = new byte[256];
        int length = deflater.deflate(buffer);
        writeChunk(png, "IDAT", java.util.Arrays.copyOf(buffer, length));
        writeChunk(png, "IEND", new byte[0]);
        return png.toByteArray();
    }

    private static void writeChunk(ByteArrayOutputStream out, String type, byte[] data) throws Exception {
        out.write(ByteBuffer.allocate(4).putInt(data.length).array());
        byte[] typeBytes = type.getBytes(java.nio.charset.StandardCharsets.US_ASCII);
        out.write(typeBytes);
        out.write(data);
        CRC32 crc = new CRC32();
        crc.update(typeBytes);
        crc.update(data);
        out.write(ByteBuffer.allocate(4).putInt((int) crc.getValue()).array());
    }
}
