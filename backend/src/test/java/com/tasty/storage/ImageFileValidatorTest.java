package com.tasty.storage;

import com.tasty.config.StorageProperties;
import com.tasty.exception.InvalidFileException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.unit.DataSize;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImageFileValidatorTest {

    private final ImageFileValidator validator =
            new ImageFileValidator(new StorageProperties("local", "./uploads", "/uploads", DataSize.ofKilobytes(64)));

    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0x10, 'J', 'F', 'I', 'F'};
    private static final byte[] WEBP = {'R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P', 'V', 'P', '8', ' '};
    private static final byte[] AVIF = {0, 0, 0, 0x20, 'f', 't', 'y', 'p', 'a', 'v', 'i', 'f', 0, 0, 0, 0};

    @Test
    void acceptsMatchingTypeExtensionAndSignature() {
        assertThat(validator.validate(new MockMultipartFile("file", "a.JPEG", "image/jpeg", JPEG)).extension()).isEqualTo("jpg");
        assertThat(validator.validate(new MockMultipartFile("file", "a.webp", "image/webp", WEBP)).contentType()).isEqualTo("image/webp");
        assertThat(validator.validate(new MockMultipartFile("file", "a.avif", "image/avif", AVIF)).extension()).isEqualTo("avif");
    }

    @Test
    void rejectsSpoofedContent() {
        assertThatThrownBy(() -> validator.validate(new MockMultipartFile("file", "a.jpg", "image/jpeg", WEBP)))
                .isInstanceOf(InvalidFileException.class);
    }

    @Test
    void rejectsWrongExtensionOrType() {
        assertThatThrownBy(() -> validator.validate(new MockMultipartFile("file", "a.png", "image/jpeg", JPEG)))
                .isInstanceOf(InvalidFileException.class);
        assertThatThrownBy(() -> validator.validate(new MockMultipartFile("file", "a.svg", "image/svg+xml", "<svg/>".getBytes())))
                .isInstanceOf(InvalidFileException.class);
    }

    @Test
    void rejectsEmptyAndOversizedFiles() {
        assertThatThrownBy(() -> validator.validate(new MockMultipartFile("file", "a.jpg", "image/jpeg", new byte[0])))
                .isInstanceOf(InvalidFileException.class);
        byte[] big = new byte[70 * 1024];
        System.arraycopy(JPEG, 0, big, 0, JPEG.length);
        assertThatThrownBy(() -> validator.validate(new MockMultipartFile("file", "a.jpg", "image/jpeg", big)))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("too large");
    }
}
