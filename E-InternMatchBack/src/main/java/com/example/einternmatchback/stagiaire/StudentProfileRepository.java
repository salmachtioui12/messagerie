package com.example.einternmatchback.stagiaire;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Integer> {
    Optional<StudentProfile> findByUserId(Integer userId);
    Optional<StudentProfile> findByUserEmail(String email);
    // Pas besoin de changer l'interface si elle est déjà comme ça
    Optional<StudentProfile> getProfileByUserEmail(String email);
    Optional<StudentProfile> getProfileByUserId(Integer userId);



}

