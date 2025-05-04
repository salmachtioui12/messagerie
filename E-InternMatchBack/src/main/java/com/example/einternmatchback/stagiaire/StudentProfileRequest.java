package com.example.einternmatchback.stagiaire;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileRequest {
    private String headline;
    private String summary;
    private String location;
    private String phone;

    private MultipartFile cv;
    private MultipartFile letter;
    private MultipartFile profilePicture;
    private MultipartFile coverPhoto;
}
