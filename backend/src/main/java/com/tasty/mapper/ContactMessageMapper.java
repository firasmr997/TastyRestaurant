package com.tasty.mapper;

import com.tasty.dto.message.ContactMessageDto;
import com.tasty.dto.message.ContactRequest;
import com.tasty.entity.ContactMessage;
import com.tasty.util.Text;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class ContactMessageMapper {

    public ContactMessageDto toDto(ContactMessage message) {
        return new ContactMessageDto(
                message.getId(),
                message.getName(),
                message.getEmail(),
                message.getPhone(),
                message.getMessage(),
                message.getStatus(),
                message.getLocale(),
                message.getReadAt(),
                message.getCreatedAt(),
                message.getUpdatedAt());
    }

    public ContactMessage toEntity(ContactRequest request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.name().trim());
        message.setEmail(request.email().trim().toLowerCase(Locale.ROOT));
        message.setPhone(Text.clean(request.phone()));
        message.setMessage(request.message().trim());
        message.setLocale(Text.clean(request.locale()));
        return message;
    }
}
