package com.example.einternmatchback.Authentification.auth;


import com.example.einternmatchback.Authentification.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {

    private String firstname;
    private String lastname;
    private String email;
    private String password;
    private Role role;

    private String companyName;
    private String companySector;
    private String companyDescription;
    private String companyWebsite;
    private String companyPicture;

}