package com.tasty.service;

import com.tasty.dto.common.PageResponse;
import com.tasty.dto.message.ContactMessageDto;
import com.tasty.dto.message.UnreadCountDto;
import com.tasty.entity.ContactMessage;
import com.tasty.entity.MessageStatus;
import com.tasty.exception.ResourceNotFoundException;
import com.tasty.mapper.ContactMessageMapper;
import com.tasty.repository.ContactMessageRepository;
import com.tasty.repository.spec.MessageSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class MessageService {

    private static final Sort NEWEST = Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));

    private final ContactMessageRepository messageRepository;
    private final ContactMessageMapper messageMapper;

    @Transactional(readOnly = true)
    public PageResponse<ContactMessageDto> list(MessageStatus status, String query, int page, int size) {
        var result = messageRepository.findAll(MessageSpecifications.filter(status, query), PageRequest.of(page, size, NEWEST));
        return PageResponse.from(result, messageMapper::toDto);
    }

    @Transactional(readOnly = true)
    public ContactMessageDto get(Long id) {
        return messageMapper.toDto(require(id));
    }

    @Transactional(readOnly = true)
    public UnreadCountDto unread() {
        return new UnreadCountDto(
                messageRepository.countByStatus(MessageStatus.NEW),
                messageRepository.findTop6ByStatusOrderByCreatedAtDesc(MessageStatus.NEW).stream()
                        .map(messageMapper::toDto).toList());
    }

    @Transactional
    public ContactMessageDto markRead(Long id) {
        ContactMessage message = require(id);
        message.setStatus(MessageStatus.READ);
        if (message.getReadAt() == null) {
            message.setReadAt(Instant.now());
        }
        return messageMapper.toDto(message);
    }

    @Transactional
    public ContactMessageDto markUnread(Long id) {
        ContactMessage message = require(id);
        message.setStatus(MessageStatus.NEW);
        message.setReadAt(null);
        return messageMapper.toDto(message);
    }

    @Transactional
    public ContactMessageDto archive(Long id) {
        ContactMessage message = require(id);
        if (message.getReadAt() == null) {
            message.setReadAt(Instant.now());
        }
        message.setStatus(MessageStatus.ARCHIVED);
        return messageMapper.toDto(message);
    }

    @Transactional
    public void delete(Long id) {
        messageRepository.delete(require(id));
    }

    private ContactMessage require(Long id) {
        return messageRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Message", id));
    }
}
