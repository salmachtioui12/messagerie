package com.example.einternmatchback.messagerie.repository;

import com.example.einternmatchback.messagerie.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestamp(
            Integer sender1, Integer receiver1, Integer sender2, Integer receiver2
    );

    List<Message> findByReceiverIdAndReadFalse(Integer receiverId);

    @Query("""
        SELECT m FROM Message m
        WHERE m.completelyDeleted = false AND m.id IN (
            SELECT MAX(m2.id) FROM Message m2
            WHERE m2.completelyDeleted = false AND (m2.senderId = :userId OR m2.receiverId = :userId)
            GROUP BY 
                CASE 
                    WHEN m2.senderId = :userId THEN m2.receiverId 
                    ELSE m2.senderId 
                END
        )
        ORDER BY m.timestamp DESC
    """)
    List<Message> findLatestMessagesByUser(@Param("userId") Integer userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.senderId = :senderId AND m.receiverId = :receiverId AND m.read = false AND m.completelyDeleted = false")
    int countUnreadMessages(@Param("senderId") Integer senderId, @Param("receiverId") Integer receiverId);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.completelyDeleted = true WHERE m.id = :messageId")
    void markAsCompletelyDeleted(@Param("messageId") Long messageId);

    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.content = :content, m.edited = true WHERE m.id = :messageId AND m.senderId = :userId AND m.completelyDeleted = false")
    void updateMessageContent(@Param("messageId") Long messageId,
                              @Param("userId") Integer userId,
                              @Param("content") String content);
}
