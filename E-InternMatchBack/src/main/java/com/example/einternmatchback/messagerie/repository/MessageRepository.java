package com.example.einternmatchback.messagerie.repository;

import com.example.einternmatchback.messagerie.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestamp(
            Integer sender1, Integer receiver1, Integer sender2, Integer receiver2
    );

    List<Message> findByReceiverIdAndReadFalse(Integer receiverId);
}
