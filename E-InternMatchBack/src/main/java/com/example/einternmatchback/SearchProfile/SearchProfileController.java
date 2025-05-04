package com.example.einternmatchback.SearchProfile;

import com.example.einternmatchback.AjoutOffers.model.Company;
import com.example.einternmatchback.AjoutOffers.repo.CompanyRepository;
import com.example.einternmatchback.AjoutOffers.service.CompanyService;
import com.example.einternmatchback.stagiaire.StudentProfile;
import com.example.einternmatchback.stagiaire.StudentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.example.einternmatchback.stagiaire.StudentProfileRepository;
import org.springframework.security.core.GrantedAuthority;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SearchProfileController {

    private final SearchProfileService searchProfileService;
    private final CompanyRepository companyRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final StudentProfileService studentProfileService, profileService;
    private final CompanyService companyService;

    @GetMapping
    public List<SearchProfileDTO> search(@RequestParam("keyword") String keyword) {
        return searchProfileService.searchUsers(keyword);
    }

    @GetMapping("/image")
    public ResponseEntity<byte[]> getImage(@RequestParam Integer userId, @RequestParam String role) {
        try {
            String baseDir;
            String filename;

            if ("STUDENT".equalsIgnoreCase(role)) {
                var profileOpt = studentProfileRepository.findByUserId(userId);
                if (profileOpt.isEmpty()) return ResponseEntity.notFound().build();
                filename = Paths.get(profileOpt.get().getProfilePicture()).getFileName().toString();
                baseDir = System.getProperty("user.dir") + "/uploads/student/";
            } else if ("MANAGER".equalsIgnoreCase(role)) {
                var companyOpt = companyRepository.findByUserId(userId);
                if (companyOpt.isEmpty()) return ResponseEntity.notFound().build();
                filename = Paths.get(companyOpt.get().getPicture()).getFileName().toString();
                baseDir = System.getProperty("user.dir") + "/uploads/company-logos/";
            } else {
                return ResponseEntity.badRequest().build();
            }

            Path imagePath = Paths.get(baseDir + filename);
            if (!Files.exists(imagePath)) {
                return ResponseEntity.notFound().build();
            }

            byte[] imageBytes = Files.readAllBytes(imagePath);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(imageBytes);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<Object> getUserProfile(
            @PathVariable Integer userId,
            @RequestParam String role
    ) {
        try {
            if ("user".equalsIgnoreCase(role)) {
                Optional<StudentProfile> studentProfile = studentProfileService.getProfileByUserId(userId);
                return studentProfile
                        .<ResponseEntity<Object>>map(ResponseEntity::ok)
                        .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Student profile not found."));
            } else if ("manager".equalsIgnoreCase(role)) {
                Optional<Company> managerProfile = companyService.getProfileByUserId(userId);
                return managerProfile
                        .<ResponseEntity<Object>>map(ResponseEntity::ok)
                        .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Manager profile not found."));
            } else {
                return ResponseEntity.badRequest().body("Unsupported role: " + role);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching profile.");
        }
    }
    private String getUserRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(role -> role.startsWith("ROLE_"))
                .findFirst()
                .map(role -> role.substring(5).toLowerCase()) // "ROLE_MANAGER" → "manager"
                .orElse("unknown");
    }
    private ResponseEntity<byte[]> buildFileResponse(File file, MediaType contentType, boolean inline) throws IOException {
        if (file == null || !file.exists()) {
            return ResponseEntity.notFound().build();
        }

        byte[] fileContent = Files.readAllBytes(file.toPath());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(contentType);
        headers.setContentDisposition((inline ? ContentDisposition.inline() : ContentDisposition.attachment())
                .filename(file.getName()).build());

        return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
    }
    /*@GetMapping("/cv")
    public ResponseEntity<byte[]> getCV(Authentication authentication) {
        try {
            String role = getUserRole(authentication);
            String username = authentication.getName();
            File file = null;

            if ("student".equals(role)) {
                file = profileService.getCvFile(username);
            }

            return buildFileResponse(file, MediaType.APPLICATION_PDF, false);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }*/@GetMapping("/cv")
    public ResponseEntity<byte[]> getCV(
            @RequestParam Integer userId,
            @RequestParam String role
    ) {
        try {
            File file = null;

            if ("STUDENT".equalsIgnoreCase(role)) {
                Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
                if (profileOpt.isPresent()) {
                    String path = profileOpt.get().getCvPath(); // Assure-toi que cette méthode existe
                    file = new File(path);
                }
            }

            return buildFileResponse(file, MediaType.APPLICATION_PDF, false);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /*@GetMapping("/letter")
    public ResponseEntity<byte[]> getLetter(Authentication authentication) {
        try {
            String role = getUserRole(authentication);
            String username = authentication.getName();
            File file = null;

            if ("student".equals(role)) {
                file = profileService.getLetterFile(username);
            }

            return buildFileResponse(file, MediaType.APPLICATION_PDF, false);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }*/
    @GetMapping("/letter")
    public ResponseEntity<byte[]> getLetter(
            @RequestParam Integer userId,
            @RequestParam String role
    ) {
        try {
            File file = null;

            if ("STUDENT".equalsIgnoreCase(role)) {
                Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
                if (profileOpt.isPresent()) {
                    String path = profileOpt.get().getMotivationLetterPath(); // Assure-toi que cette méthode existe
                    file = new File(path);
                }
            }

            return buildFileResponse(file, MediaType.APPLICATION_PDF, false);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/profile-picture")
    public ResponseEntity<byte[]> getProfilePictureByRole(Authentication authentication) {
        try {
            String role = getUserRole(authentication);
            String username = authentication.getName();
            File file = null;

            switch (role) {
                case "student":
                    file = profileService.getProfilePictureFile(username);
                    break;
                case "manager":
                    file = companyService.getCompanyPictureFile(username);
                    break;
                default:
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return buildFileResponse(file, MediaType.IMAGE_JPEG, true);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }





    /*@GetMapping("/cover-photo")
    public ResponseEntity<byte[]> getCoverPhoto(Authentication authentication) {
        try {
            String role = getUserRole(authentication);
            String username = authentication.getName();
            File file = null;

            if ("student".equals(role)) {
                file = profileService.getCoverPhotoFile(username);
            }

            return buildFileResponse(file, MediaType.IMAGE_JPEG, true);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }*/
    @GetMapping("/cover-photo")
    public ResponseEntity<byte[]> getCoverPhoto(
            @RequestParam Integer userId,
            @RequestParam String role
    ) {
        try {
            File file = null;

            if ("STUDENT".equalsIgnoreCase(role)) {
                Optional<StudentProfile> profileOpt = studentProfileRepository.findByUserId(userId);
                if (profileOpt.isPresent()) {
                    String path = profileOpt.get().getCoverPhoto(); // Assure-toi que ce champ contient le chemin complet
                    file = new File(path);
                }
            }

            return buildFileResponse(file, MediaType.IMAGE_JPEG, true);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }



}