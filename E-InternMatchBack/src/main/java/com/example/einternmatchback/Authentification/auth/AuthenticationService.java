package com.example.einternmatchback.Authentification.auth;

import com.example.einternmatchback.AjoutOffers.model.Company;
import com.example.einternmatchback.AjoutOffers.repo.CompanyRepository;
import com.example.einternmatchback.Authentification.config.JwtService;
import com.example.einternmatchback.Authentification.token.Token;
import com.example.einternmatchback.Authentification.token.TokenRepository;
import com.example.einternmatchback.Authentification.token.TokenType;
import com.example.einternmatchback.Authentification.user.*;
import com.example.einternmatchback.stagiaire.StudentProfile;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CompanyRepository companyRepository;


    public AuthenticationResponse register(RegisterRequest request) {
        try {
            // Créer l'utilisateur en fonction du type spécifié
            User user;
            Role role = request.getRole();
            switch (role) {
                case STUDENT -> user = new User();
                case MANAGER -> user = new User();
                case USER -> user = new User();
                case ADMIN -> user = new Admin();
                default -> throw new IllegalArgumentException("Unsupported role: " + role);
            }


            // Assigner les champs
            user.setFirstname(request.getFirstname());
            user.setLastname(request.getLastname());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(role);
            System.out.println(">>> Tentative d'enregistrement de l'utilisateur : " + user);

            var savedUser = repository.save(user);

            /*if (role == Role.HR) {
                if (request.getCompanyName() == null || request.getCompanyName().isBlank()) {
                    throw new IllegalArgumentException("Company name is required for HR registration.");
                }

                Company company = Company.builder()
                        .userId(savedUser.getId())
                        .name(request.getCompanyName())
                        .sector(request.getCompanySector())
                        .description(request.getCompanyDescription())
                        .website(request.getCompanyWebsite())
                        .picture(request.getCompanyPicture())
                        .build();
                companyRepository.save(company);
            }*/


            //a remplacer
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("role", user.getRole().name());
            extraClaims.put("firstname", user.getFirstname());
            extraClaims.put("lastname", user.getLastname());

            var jwtToken = jwtService.generateToken(extraClaims, user);
            //var jwtToken = jwtService.generateToken(user);
            var refreshToken = jwtService.generateRefreshToken(user);
            saveUserToken(savedUser, jwtToken);

            return AuthenticationResponse.builder()
                    .accessToken(jwtToken)
                    .refreshToken(refreshToken)
                    .build();
        } catch (Exception e) {
            System.out.println("!!! ERREUR lors de l'enregistrement : " + e.getMessage());
            e.printStackTrace(); // Stack trace complète dans les logs
            throw e; // Ou éventuellement renvoyer une réponse 500 propre
        }
    }


    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            System.out.println("Échec de l'authentification: Mauvais identifiants.");
            return null;
        } catch (Exception e) {
            System.out.println("Échec de l'authentification: " + e.getMessage());
            return null;
        }

        var user = repository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        System.out.println("Utilisateur trouvé: " + user.getEmail());
        System.out.println("Mot de passe en base : " + user.getPassword());

        /*if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return null;
        }*/
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("firstname", user.getFirstname());
        extraClaims.put("lastname", user.getLastname());
        var jwtToken = jwtService.generateToken(extraClaims, user);


        var refreshToken = jwtService.generateRefreshToken(user);
        revokeAllUserTokens(user);
        saveUserToken(user, jwtToken);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }



    private void saveUserToken(User user, String jwtToken) {
        var token = Token.builder()
                .user(user)
                .token(jwtToken)
                .tokenType(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }

    private void revokeAllUserTokens(User user) {
        var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if (validUserTokens.isEmpty())
            return;
        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }

    public void refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String refreshToken;
        final String userEmail;
        if (authHeader == null ||!authHeader.startsWith("Bearer ")) {
            return;
        }
        refreshToken = authHeader.substring(7);
        userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail != null) {
            var user = this.repository.findByEmail(userEmail)
                    .orElseThrow();
            if (jwtService.isTokenValid(refreshToken, user)) {
                var accessToken = jwtService.generateToken(user);
                revokeAllUserTokens(user);
                saveUserToken(user, accessToken);
                var authResponse = AuthenticationResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .build();
                new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
            }
        }
    }
}