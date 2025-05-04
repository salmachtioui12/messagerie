package com.example.einternmatchback.messagerie.Controller;

import com.example.einternmatchback.messagerie.entity.Message;
import com.example.einternmatchback.messagerie.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageRestController {

    @Autowired
    private MessageRepository messageRepository;

    @PostMapping

    public Message sendMessage(@RequestBody Message message) {
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);
        return messageRepository.save(message);
    }


    @GetMapping("/conversation")
    public List<Message> getConversation(@RequestParam Integer user1,
                                         @RequestParam Integer user2) {
        return messageRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestamp(
                user1, user2, user1, user2);
    }

    @GetMapping("/unread")
    public List<Message> getUnreadMessages(@RequestParam Integer receiverId) {
        return messageRepository.findByReceiverIdAndReadFalse(receiverId);
    }

    @PostMapping("/{messageId}/read")
    public void markAsRead(@PathVariable Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setRead(true);
        messageRepository.save(message);
    }
}
