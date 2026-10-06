package com.tasty.service;

import com.tasty.config.RateLimitProperties;
import com.tasty.dto.message.ContactRequest;
import com.tasty.entity.ContactMessage;
import com.tasty.mapper.ContactMessageMapper;
import com.tasty.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository messageRepository;
    private final ContactMessageMapper messageMapper;
    private final RateLimiterService rateLimiter;
    private final RateLimitProperties rateLimits;

    /**
     * Stores a contact-form submission. Bots that fill the hidden honeypot field get the same success
     * response but nothing is saved, so they learn nothing.
     */
    @Transactional
    public void submit(ContactRequest request, String clientIp) {
        rateLimiter.check("contact:" + clientIp, rateLimits.contactSubmissions(), rateLimits.contactWindow(),
                "You've sent several messages in a short time. Please try again in a few minutes.");
        if (request.website() != null && !request.website().isBlank()) {
            log.info("Dropped contact submission caught by the honeypot from {}", clientIp);
            return;
        }
        ContactMessage saved = messageRepository.save(messageMapper.toEntity(request));
        log.info("New contact message {} from {}", saved.getId(), saved.getEmail());
    }
}
