package com.example.einternmatchback.Authentification.user;



import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Principal;

@Service //spring va gerer cette classe en tant que bean
//initialiser les champs final
@RequiredArgsConstructor
public class UserService {

    //pour encoder les mot de passe
    private final PasswordEncoder passwordEncoder;

    //reference pour acces a bd
    private final UserRepository repository;

    //request: contien data d changement d password
    //principal hiya interface katrepresenté user actuellement connecté
    public void changePassword(ChangePasswordRequest request, Principal connectedUser) {

        //l'user authentifié c'est "connectedUser" spring boot tsock info detaillés d user conncté dans un objet UsernamePasswordAuthenticationToken donc on fait un cast de userconncted a UsernamePasswordAuthenticationToken puis on extrait ce user par getprincipale et puisque on gere des objet de type User donc on fait un cast a ce type personnalisé
        //user fih user connecté de type User qu'on a creer, sinon on aura ClassCastException
        var user = (User) ((UsernamePasswordAuthenticationToken) connectedUser).getPrincipal();

        // check if the current password is correct
        //request.getCurrentPassword() => password fourni
        //user.getPassword() => password stocké dasn bd
        //si sont pas egaux
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalStateException("Wrong password");
        }
        // check if the two new passwords are the same
        if (!request.getNewPassword().equals(request.getConfirmationPassword())) {
            throw new IllegalStateException("Password are not the same");
        }

        // update the password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));

        // save the new password
        repository.save(user);
    }



//salma
public User getUserByEmail(String email) {
    return repository.findByEmail(email).orElse(null);
}


}