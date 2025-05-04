package com.example.einternmatchback.Authentification.user;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Integer> {

    //optional evite les valeurs null
    Optional<User> findByEmail(String email);
    void deleteById(Integer id);
    //deux senarios possible :
    //1- user pas trouvé => Optional<User> contient l'utilisateur.
    //2- user trouvé => Optional<User>.empty() évite une NullPointerException
    List<User> findByFirstnameContainingIgnoreCaseOrLastnameContainingIgnoreCase(String firstname, String lastname);
    @Query("SELECT u FROM User u WHERE " +
            "LOWER(CONCAT(u.firstname, ' ', u.lastname)) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(CONCAT(u.lastname, ' ', u.firstname)) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> searchByFullname(@Param("keyword") String keyword);
}