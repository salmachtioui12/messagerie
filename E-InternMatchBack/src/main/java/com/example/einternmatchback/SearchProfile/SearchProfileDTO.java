package com.example.einternmatchback.SearchProfile;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchProfileDTO {
    private Integer userId;
    private String firstname;
    private String lastname;
    private String imageUrl;
    private String role;
}

