package com.example.einternmatchback.ClientOffre.repository;

import com.example.einternmatchback.Authentification.user.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {}

