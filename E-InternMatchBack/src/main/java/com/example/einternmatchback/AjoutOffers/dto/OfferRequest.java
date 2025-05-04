package com.example.einternmatchback.AjoutOffers.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class OfferRequest {

    private String title;
    private String description;
    private String stageType;
    private String location;
    private LocalDate startDate;
    private String duration;
    private String skillsRequired;
    private String responsibilities;
    private String benefits;
    private Boolean isSponsored = false;
    private Boolean isActive = true;

}