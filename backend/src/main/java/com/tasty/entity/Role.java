package com.tasty.entity;

/** ADMIN manages everything, including restaurant settings. EDITOR manages menu, gallery and messages. */
public enum Role {
    ADMIN,
    EDITOR;

    public String authority() {
        return "ROLE_" + name();
    }
}
