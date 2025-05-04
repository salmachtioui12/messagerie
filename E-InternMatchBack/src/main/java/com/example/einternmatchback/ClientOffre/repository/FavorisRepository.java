package com.example.einternmatchback.ClientOffre.repository;

import com.example.einternmatchback.AjoutOffers.model.Offer;
import com.example.einternmatchback.ClientOffre.entity.Favoris;
import com.example.einternmatchback.Authentification.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FavorisRepository extends JpaRepository<Favoris, Integer> {
    List<Favoris> findByUser(User user);
    boolean existsByUserAndOffer(User user, Offer offer);

    // Optionnel - si vous en avez besoin ailleurs
    @Query("SELECT f FROM Favoris f WHERE f.user.id = :userId")
    List<Favoris> findByUserId(@Param("userId") Integer userId);
}