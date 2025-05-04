package com.example.einternmatchback.Authentification.user;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController //la class est un controleur qui gère les requêtes HTTP et renvoie des objets JSON au lieu des pages html
//prefixe des routes de ce controlleur
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    //injection de class UserService dans la class UserController sans creer le constructeur c est fait par @RequiredArgsConstructor
    private final UserService service;

    // la requete patch pour modifier partielement une ressource(on change que le password )
    @PatchMapping
    //request contient les 3 para currentPassword, newPassword, confirmationPassword
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Principal connectedUser
    ) {
        //on fait appel a la method changePassword de classe userservice responsable de changement de password
        service.changePassword(request, connectedUser);
        return ResponseEntity.ok().build();
    }
    //salma
    @GetMapping("/by-email")
    public ResponseEntity<?> getUserIdByEmail(@RequestParam String email) {
        var user = service.getUserByEmail(email);
        if (user != null) {
            return ResponseEntity.ok().body(Map.of("id", user.getId()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}