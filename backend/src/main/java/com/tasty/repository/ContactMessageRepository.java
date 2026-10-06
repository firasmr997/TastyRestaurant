package com.tasty.repository;

import com.tasty.entity.ContactMessage;
import com.tasty.entity.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long>, JpaSpecificationExecutor<ContactMessage> {

    long countByStatus(MessageStatus status);

    List<ContactMessage> findTop5ByStatusNotOrderByCreatedAtDesc(MessageStatus status);

    List<ContactMessage> findTop6ByStatusOrderByCreatedAtDesc(MessageStatus status);

    /** Message counts per UTC day since {@code from}, for the dashboard chart. */
    @Query(value = """
            select cast(date_trunc('day', created_at at time zone 'UTC') as date) as day, count(*) as total
            from contact_messages
            where created_at >= :from
            group by 1
            order by 1
            """, nativeQuery = true)
    List<DailyCount> countPerDaySince(@Param("from") Instant from);

    interface DailyCount {
        java.time.LocalDate getDay();

        long getTotal();
    }
}
