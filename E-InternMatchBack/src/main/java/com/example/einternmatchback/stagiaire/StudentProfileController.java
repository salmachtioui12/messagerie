
package com.example.einternmatchback.stagiaire;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/profiles")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentProfileController {

    @Autowired
    private StudentProfileService profileService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<StudentProfile> createProfile(
            @RequestParam("profile") String profileJson,
            @RequestParam(value = "cv", required = false) MultipartFile cvFile,
            @RequestParam(value = "letter", required = false) MultipartFile letterFile,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture,
            @RequestParam(value = "coverPhoto", required = false) MultipartFile coverPhoto,
            Principal principal) {

        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            StudentProfile profile = mapper.readValue(profileJson, StudentProfile.class);

            profileService.uploadProfileFiles(profile, cvFile, letterFile, profilePicture, coverPhoto);

            StudentProfile savedProfile = profileService.createProfile(profile, principal.getName());
            return ResponseEntity.ok(savedProfile);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<StudentProfile> updateProfile(
            @PathVariable Integer id,
            @RequestParam("profile") String profileJson,
            @RequestParam(value = "cv", required = false) MultipartFile cvFile,
            @RequestParam(value = "letter", required = false) MultipartFile letterFile,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture,
            @RequestParam(value = "coverPhoto", required = false) MultipartFile coverPhoto,
            Principal principal) {

        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            StudentProfile updatedProfile = mapper.readValue(profileJson, StudentProfile.class);

            profileService.uploadProfileFiles(updatedProfile, cvFile, letterFile, profilePicture, coverPhoto);

            StudentProfile savedProfile = profileService.updateProfile(id, updatedProfile, principal.getName());
            return ResponseEntity.ok(savedProfile);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/my-profile")
    public ResponseEntity<StudentProfile> getMyProfile(Principal principal) {
        try {
            Optional<StudentProfile> optionalProfile = profileService.getProfileByUserEmail(principal.getName());

            return optionalProfile.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/files")
    public ResponseEntity<Map<String, String>> getMyProfileFiles(Principal principal) {
        try {
            Map<String, String> files = profileService.getProfileFilesByUserEmail(principal.getName());
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProfile(@PathVariable Integer id, Principal principal) {
        try {
            profileService.deleteProfile(id, principal.getName());
            return ResponseEntity.ok("Profil supprimé avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
    @GetMapping("/cv")
    public ResponseEntity<byte[]> getCV(Principal principal) {
        try {
            File file = profileService.getCvFile(principal.getName());
            if (file == null || !file.exists()) {
                return ResponseEntity.notFound().build();
            }
            byte[] fileContent = Files.readAllBytes(file.toPath());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename(file.getName())
                    .build());

            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/letter")
    public ResponseEntity<byte[]> getLetter(Principal principal) {
        try {
            File file = profileService.getLetterFile(principal.getName());
            if (file == null || !file.exists()) {
                return ResponseEntity.notFound().build();
            }
            byte[] fileContent = Files.readAllBytes(file.toPath());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename(file.getName())
                    .build());

            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/profile-picture")
    public ResponseEntity<byte[]> getProfilePicture(Principal principal) {
        try {
            File file = profileService.getProfilePictureFile(principal.getName());
            if (file == null || !file.exists()) {
                return ResponseEntity.notFound().build();
            }
            byte[] fileContent = Files.readAllBytes(file.toPath());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG); // ou IMAGE_PNG selon ton type d'image
            headers.setContentDisposition(ContentDisposition.inline()
                    .filename(file.getName())
                    .build());

            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/cover-photo")
    public ResponseEntity<byte[]> getCoverPhoto(Principal principal) {
        try {
            File file = profileService.getCoverPhotoFile(principal.getName()); // <-- correction ici
            if (file == null || !file.exists()) {
                return ResponseEntity.notFound().build();
            }
            byte[] fileContent = Files.readAllBytes(file.toPath());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG); // ou IMAGE_PNG selon ton type d'image
            headers.setContentDisposition(ContentDisposition.inline()
                    .filename(file.getName())
                    .build());

            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    @DeleteMapping("/file/{type}")
    public ResponseEntity<?> deleteFile(@PathVariable String type, Principal principal) {
        try {
            boolean deleted = profileService.deleteProfileFile(type, principal.getName());
            if (deleted) {
                return ResponseEntity.ok("Fichier supprimé avec succès: " + type);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fichier non trouvé: " + type);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la suppression du fichier");
        }
    }


}