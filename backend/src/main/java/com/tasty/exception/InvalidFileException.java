package com.tasty.exception;

/** Rejected upload: wrong type, extension, size or content. */
public class InvalidFileException extends BadRequestException {

    public InvalidFileException(String message) {
        super(message);
    }
}
