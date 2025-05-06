package com.example.einternmatchback.messagerie.Controller;

import com.example.einternmatchback.Authentification.user.User;
import com.example.einternmatchback.Authentification.user.UserRepository;
import com.example.einternmatchback.messagerie.entity.ConversationDTO;
import com.example.einternmatchback.messagerie.entity.Message;
import com.example.einternmatchback.messagerie.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
public class MessageRestController {

    @Autowired
    private MessageRepository messageRepository;
    @Autowired
     private UserRepository userRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
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
   /* @GetMapping("/conversations/history")
    public List<ConversationDTO> getUserConversations(@RequestParam Integer userId) {
        List<Message> lastMessages = messageRepository.findLatestMessagesByUser(userId);
        List<ConversationDTO> result = new ArrayList<>();

        for (Message m : lastMessages) {
            Integer otherUserId = m.getSenderId().equals(userId) ? m.getReceiverId() : m.getSenderId();
            Optional<User> userOpt = userRepository.findById(otherUserId);
            if (userOpt.isPresent()) {
                User otherUser = userOpt.get();
                result.add(new ConversationDTO(
                        otherUser.getId(),
                        otherUser.getFirstname(),
                        otherUser.getLastname(),
                        otherUser.getRole().name(),
                        "/api/search/image?userId=" + otherUser.getId() + "&role=" + otherUser.getRole().name(),
                        m.getContent(),
                        m.getTimestamp(),
                        !m.getSenderId().equals(userId) && !m.isRead() ? false : true
                ));

            }
        }

        return result;
        }*/
    /*
   @GetMapping("/conversations/history")
   public List<ConversationDTO> getUserConversations(@RequestParam Integer userId) {
       List<Message> lastMessages = messageRepository.findLatestMessagesByUser(userId);
       List<ConversationDTO> result = new ArrayList<>();

       for (Message m : lastMessages) {
           Integer otherUserId = m.getSenderId().equals(userId) ? m.getReceiverId() : m.getSenderId();
           Optional<User> userOpt = userRepository.findById(otherUserId);
           if (userOpt.isPresent()) {
               User otherUser = userOpt.get();
               // Assurez-vous que l'URL de l'image est complète
               String imageUrl = "/api/search/image?userId=" + otherUser.getId() + "&role=" + otherUser.getRole().name();

               result.add(new ConversationDTO(
                       otherUser.getId(),
                       otherUser.getFirstname(),
                       otherUser.getLastname(),
                       otherUser.getRole().name(),
                       imageUrl,  // URL complète
                       m.getContent(),
                       m.getTimestamp(),
                       !m.getSenderId().equals(userId) && !m.isRead()
               ));
           }
       }
       return result;

   }*/

    @GetMapping("/conversations/history")
    public List<ConversationDTO> getConversationHistory(@RequestParam Integer userId) {
        List<Message> latestMessages = messageRepository.findLatestMessagesByUser(userId);
        List<ConversationDTO> result = new ArrayList<>();

        for (Message message : latestMessages) {
            Integer otherUserId = message.getSenderId().equals(userId)
                    ? message.getReceiverId()
                    : message.getSenderId();

            Optional<User> otherUserOpt = userRepository.findById(otherUserId);

            if (otherUserOpt.isPresent()) {
                User otherUser = otherUserOpt.get();

                String imageUrl = "/api/search/image?userId=" + otherUser.getId()
                        + "&role=" + otherUser.getRole().name();

                boolean isRead = !message.getSenderId().equals(userId) && message.isRead();

                int unreadCount = messageRepository.countUnreadMessages(otherUser.getId(), userId); // ✅

                result.add(new ConversationDTO(
                        otherUser.getId(),
                        otherUser.getFirstname(),
                        otherUser.getLastname(),
                        otherUser.getRole().name(),
                        imageUrl,
                        message.getContent(),
                        message.getTimestamp(),
                        isRead,
                        unreadCount // ✅
                ));
            }
        }

        return result;
    }

// hamouda
@DeleteMapping("/{messageId}")
public void deleteMessage(@PathVariable Long messageId) {
    Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("Message not found"));
    message.setCompletelyDeleted(true); // Marque le message comme supprimé
    messageRepository.save(message); // Sauvegarde en base
}                                                                   @PutMapping("/{messageId}/edit/{userId}")
    public Message editMessage(@PathVariable Long messageId,
                               @PathVariable Integer userId,
                               @RequestBody String newContent) {
        messageRepository.updateMessageContent(messageId, userId, newContent); // Met à jour le contenu
        return messageRepository.findById(messageId) // Retourne le message mis à jour
                .orElseThrow(() -> new RuntimeException("Message not found"));
    }
    @MessageMapping("/chat/{messageId}/delete/{userId}")
    public void deleteMessage(@DestinationVariable Long messageId,
                              @DestinationVariable Integer userId,
                              Principal principal) {
        // Vérification de l'utilisateur
        String email = principal.getName();
        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + email));

        // Marquer le message comme supprimé
        messageRepository.markAsCompletelyDeleted(messageId);

        // Notifier les deux utilisateurs
        Message deletedMessage = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));
        deletedMessage.setCompletelyDeleted(true);

        messagingTemplate.convertAndSend("/topic/messages/update/" + deletedMessage.getSenderId(), deletedMessage);
        messagingTemplate.convertAndSend("/topic/messages/update/" + deletedMessage.getReceiverId(), deletedMessage);
    }                                                                       @MessageMapping("/chat/{messageId}/edit/{userId}")
    public void editMessage(@DestinationVariable Long messageId,
                            @DestinationVariable Integer userId,
                            @Payload String newContent,
                            Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + email));

        messageRepository.updateMessageContent(messageId, user.getId(), newContent);
        Message updatedMessage = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message non trouvé"));

        messagingTemplate.convertAndSend("/topic/messages/update/" + updatedMessage.getSenderId(), updatedMessage);
        messagingTemplate.convertAndSend("/topic/messages/update/" + updatedMessage.getReceiverId(), updatedMessage);
    }
}
