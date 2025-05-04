package com.example.einternmatchback.AjoutOffers.repo;

import com.example.einternmatchback.AjoutOffers.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Integer> {
    Optional<Company> findByUserId(Integer userId);
    void deleteByUserId(Integer userId);


}