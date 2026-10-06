package com.tasty.dto.auth;

import com.tasty.entity.Role;

public record UserDto(Long id, String name, String email, Role role) {
}
