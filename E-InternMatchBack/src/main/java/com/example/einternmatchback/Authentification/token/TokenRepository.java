package com.example.einternmatchback.Authentification.token;


import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TokenRepository extends JpaRepository<Token, Integer> {

    //requet PLQL
    //Sélectionne tous les tokens t,
    // Jointure entre Token et User pour récupérer les tokens d'un utilisateur spécifique.
    //Filtre pour ne récupérer que les tokens appartenant à l'utilisateur ayant l'ID id.
    //Filtre pour ne récupérer que les tokens encore valides
    @Query(value = """
      select t from Token t inner join User u\s
      on t.user.id = u.id\s
      where u.id = :id and (t.expired = false or t.revoked = false)\s
      """)
    List<Token> findAllValidTokenByUser(Integer id);
    void deleteAllByUserId(Integer userId);
    Optional<Token> findByToken(String token);
}