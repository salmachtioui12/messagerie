package com.example.einternmatchback.messagerie.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer senderId;
    private Integer receiverId;
    private String content;
    private LocalDateTime timestamp;

    @Column(name = "is_read")
    private boolean read = false;
    private boolean edited = false;
    private boolean completelyDeleted=false;

}
