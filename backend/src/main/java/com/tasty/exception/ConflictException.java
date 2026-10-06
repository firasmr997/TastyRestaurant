package com.tasty.exception;

import org.springframework.http.HttpStatus;

/** The request is valid but clashes with existing data (duplicate name, dependent records, ...). */
public class ConflictException extends ApiException {

    public ConflictException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}
