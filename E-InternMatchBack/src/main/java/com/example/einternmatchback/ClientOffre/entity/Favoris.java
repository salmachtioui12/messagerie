package com.example.einternmatchback.ClientOffre.entity;

import com.example.einternmatchback.AjoutOffers.model.Offer;
import com.example.einternmatchback.Authentification.user.User;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Favoris")
@Data

public class Favoris {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "offer_id")
    private Offer offer;
}