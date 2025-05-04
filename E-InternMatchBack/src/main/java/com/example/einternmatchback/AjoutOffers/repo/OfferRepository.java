package com.example.einternmatchback.AjoutOffers.repo;

import com.example.einternmatchback.AjoutOffers.model.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface OfferRepository extends JpaRepository<Offer, Integer> {

    List<Offer> findByCompanyId(Integer companyId);

    Optional<Offer> findByIdAndCompanyId(Integer id, Integer companyId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Offer o WHERE o.company.id = :companyId")
    void deleteByCompanyId(Integer companyId);
}