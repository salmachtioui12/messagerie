package com.example.einternmatchback.ClientOffre.repository;

import com.example.einternmatchback.AjoutOffers.model.Offer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface CompanyOfferRepository extends JpaRepository<Offer, Integer> {
    //List<CompanyOffer> findByLocation(String location);
    List<Offer> findByLocationContainingIgnoreCase(String location);
    List<Offer> findByStageTypeContainingIgnoreCase(String stageType);

    long count();
    // Ajoutez si nécessaire
    //@Query("SELECT o FROM CompanyOffer o WHERE LOWER(o.location) LIKE LOWER(concat('%', :location, '%'))")
    //List<CompanyOffer> searchByLocation(@Param("location") String location);
}
