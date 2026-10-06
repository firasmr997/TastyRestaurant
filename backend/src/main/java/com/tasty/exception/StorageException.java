package com.tasty.exception;

/** Infrastructure failure while reading or writing image files. Never exposed verbatim to clients. */
public class StorageException extends RuntimeException {

    public StorageException(String message, Throwable cause) {
        super(message, cause);
    }

    public StorageException(String message) {
        super(message);
    }
}
