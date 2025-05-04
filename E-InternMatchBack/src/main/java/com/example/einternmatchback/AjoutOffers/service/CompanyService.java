package com.example.einternmatchback.AjoutOffers.service;

import com.example.einternmatchback.AjoutOffers.dto.CompanyRequest;
import com.example.einternmatchback.AjoutOffers.model.Company;
import com.example.einternmatchback.AjoutOffers.repo.CompanyRepository;
import com.example.einternmatchback.AjoutOffers.repo.OfferRepository;
import com.example.einternmatchback.Authentification.token.TokenRepository;
import com.example.einternmatchback.Authentification.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.ResponseEntity;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final OfferRepository offerRepository;
    @Value("${file.upload-dir}")
    private String uploadDir;

    @Transactional
    public Company createOrUpdateCompany(CompanyRequest request, Principal principal) {
        var user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return companyRepository.findByUserId(user.getId())
                .map(existingCompany -> {
                    // Mise à jour conditionnelle des champs
                    if (request.getName() != null) {
                        existingCompany.setName(request.getName());
                    }
                    if (request.getSector() != null) {
                        existingCompany.setSector(request.getSector());
                    }
                    if (request.getDescription() != null) {
                        existingCompany.setDescription(request.getDescription());
                    }
                    if (request.getWebsite() != null) {
                        existingCompany.setWebsite(request.getWebsite());
                    }
                    if (request.getPicture() != null && !request.getPicture().isEmpty()) {
                        String fileName = storeFile(request.getPicture());
                        existingCompany.setPicture(fileName);
                    }
                    return companyRepository.save(existingCompany);
                })
                .orElseGet(() -> {
                    if (request.getPicture() == null || request.getPicture().isEmpty()) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Company picture is required for initial creation");
                    }

                    String fileName = storeFile(request.getPicture());

                    return companyRepository.save(
                            Company.builder()
                                    .userId(user.getId())
                                    .name(request.getName())
                                    .sector(request.getSector())
                                    .description(request.getDescription())
                                    .website(request.getWebsite())
                                    .picture(fileName)
                                    .build()
                    );
                });
    }

    public Company getCompany(Principal principal) {
        var user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return companyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Company profile not found"));
    }

    public ResponseEntity<byte[]> getCompanyPicture(Principal principal) {
        var user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Company company = companyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Company profile not found"));

        if (company.getPicture() == null || company.getPicture().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Company picture not found");
        }

        try {
            Path path = Paths.get(uploadDir).resolve(company.getPicture()).normalize();
            byte[] imageBytes = Files.readAllBytes(path);
            return ResponseEntity.ok()
                    .header("Content-Type", Files.probeContentType(path))
                    .body(imageBytes);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading image file");
        }
    }

    @Transactional
    public void deleteCompany(Principal principal) {
        var user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        companyRepository.findByUserId(user.getId()).ifPresent(company -> {
            // Supprimer les offres associées
            offerRepository.deleteByCompanyId(company.getId());

            // Supprimer l'image si elle existe
            if (company.getPicture() != null && !company.getPicture().isEmpty()) {
                try {
                    Path path = Paths.get(uploadDir).resolve(company.getPicture()).normalize();
                    Files.deleteIfExists(path);
                } catch (IOException e) {
                    // Log l'erreur mais continue avec la suppression
                }
            }

            // Supprimer la company
            companyRepository.delete(company);

            // Supprimer les tokens associés
            tokenRepository.deleteAllByUserId(user.getId());

            // Supprimer l'utilisateur
            userRepository.delete(user);
        });
    }

    private String storeFile(MultipartFile file) {
        try {
            // Créer le répertoire s'il n'existe pas
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Générer un nom de fichier unique
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String fileName = UUID.randomUUID().toString() + fileExtension;

            // Copier le fichier
            Path targetLocation = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return fileName;
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file " + file.getOriginalFilename(), ex);
        }
    }
    public Optional<Company> getProfileByUserId(Integer userId) {
        return companyRepository.findByUserId(userId);
    }
    public File getCompanyPictureFile(String username) {
        // Exemple : récupérer le chemin de la photo en base ou sur le disque
        String path = "uploads/companies/" + username + "/profile.jpg";
        File file = new File(path);
        if (file.exists()) {
            return file;
        }
        throw new RuntimeException("Company profile picture not found");
    }

}