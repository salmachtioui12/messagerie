package com.example.einternmatchback.AjoutOffers.dto;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRequest {
    private String name;
    private String sector;
    private String description;
    private String website;
    private MultipartFile picture; // Changé de String à MultipartFile
}