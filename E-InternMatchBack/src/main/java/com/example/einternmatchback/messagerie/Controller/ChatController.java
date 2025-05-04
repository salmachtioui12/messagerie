package com.example.einternmatchback.messagerie.Controller;

import com.example.einternmatchback.Authentification.user.User;
import com.example.einternmatchback.Authentification.user.UserRepository;
import com.example.einternmatchback.messagerie.entity.Message;
import com.example.einternmatchback.messagerie.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @MessageMapping("/chat/{receiverId}")
    public void processMessage(@DestinationVariable Integer receiverId,
                               @Payload Message message,
                               Principal principal) {

        String email = principal.getName();
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + email));

        message.setSenderId(sender.getId());
        message.setReceiverId(receiverId); // ← forçage depuis l'URL
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);

        Message saved = messageRepository.save(message);
        messagingTemplate.convertAndSend("/topic/messages/" + receiverId, saved);
    }

}
