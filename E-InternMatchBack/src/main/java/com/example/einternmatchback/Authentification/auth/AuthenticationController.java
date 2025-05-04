package com.example.einternmatchback.Authentification.auth;

import com.example.einternmatchback.ClientOffre.repository.CompanyOfferRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    @Autowired
    private CompanyOfferRepository companyOfferRepository;


    private final AuthenticationService service;
    @Transactional
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Auth path accessible");
    }



    @Transactional
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        System.out.println(">>> REGISTER CALLED with: " + request.getEmail());
        return ResponseEntity.ok(service.register(request));
    }

    @Transactional
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        System.out.println("Tentative de connexion pour : " + request.getEmail());
        System.out.println("Mot de passe reçu : " + request.getPassword());
        // Authentifier l'utilisateur et générer une réponse
        AuthenticationResponse response = service.authenticate(request);

        // Si la réponse est null, cela signifie que l'authentification a échoué
        if (response == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new AuthenticationResponse("Authentification échouée"));
        }

        // Si l'authentification est réussie, renvoyer la réponse avec le token JWT
        return ResponseEntity.ok(response);
    }

    @GetMapping("/offers/count")
    public long getOfferCount() {
        return companyOfferRepository.count();
    }



    @Transactional
    @PostMapping("/refresh-token")
    public void refreshToken(HttpServletRequest request, HttpServletResponse response) throws IOException {
        service.refreshToken(request, response);
    }
}
