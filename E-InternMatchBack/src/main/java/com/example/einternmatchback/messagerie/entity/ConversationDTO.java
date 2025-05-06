package com.example.einternmatchback.messagerie.entity;


import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ConversationDTO {
    private Integer userId;
    private String firstname;
    private String lastname;
    private String role;
    private String imageUrl;
    private String lastMessage;
    private LocalDateTime timestamp;
    private boolean read;
    private int unreadCount; // ✅ Nouveau champ
    // Constructeur mis à jour

    // getters & setters
}

