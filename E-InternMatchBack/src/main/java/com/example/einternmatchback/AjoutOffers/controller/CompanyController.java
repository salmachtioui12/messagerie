package com.example.einternmatchback.AjoutOffers.controller;

import com.example.einternmatchback.AjoutOffers.dto.CompanyRequest;
import com.example.einternmatchback.AjoutOffers.model.Company;
import com.example.einternmatchback.AjoutOffers.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.security.Principal;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;

    @PostMapping(value = "/profile/create", consumes = {"multipart/form-data"})
    public ResponseEntity<Company> createProfile(
            @ModelAttribute CompanyRequest request,
            Principal principal) {
        return ResponseEntity.ok(companyService.createOrUpdateCompany(request, principal));
    }

    @PutMapping(value = "/profile/update", consumes = {"multipart/form-data"})
    public ResponseEntity<Company> updateProfile(
            @ModelAttribute CompanyRequest request,
            Principal principal) {
        return ResponseEntity.ok(companyService.createOrUpdateCompany(request, principal));
    }

    @GetMapping("/profile/details")
    public ResponseEntity<Company> getProfile(Principal principal) {
        return ResponseEntity.ok(companyService.getCompany(principal));
    }

    @DeleteMapping("/profile/delete")
    public ResponseEntity<Void> deleteProfile(Principal principal) {
        companyService.deleteCompany(principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/profile/picture")
    public ResponseEntity<byte[]> getProfilePicture(Principal principal) {
        return companyService.getCompanyPicture(principal);
    }



}