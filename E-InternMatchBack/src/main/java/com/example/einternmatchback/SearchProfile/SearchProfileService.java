package com.example.einternmatchback.SearchProfile;

import com.example.einternmatchback.AjoutOffers.repo.CompanyRepository;
import com.example.einternmatchback.Authentification.user.Role;
import com.example.einternmatchback.Authentification.user.User;
import com.example.einternmatchback.Authentification.user.UserRepository;
import com.example.einternmatchback.stagiaire.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchProfileService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CompanyRepository companyRepository;

    public List<SearchProfileDTO> searchUsers(String keyword) {
        List<User> users = userRepository.searchByFullname(keyword.trim().toLowerCase());

        return users.stream().map(user -> {
            SearchProfileDTO dto = new SearchProfileDTO();
            dto.setUserId(user.getId());
            dto.setFirstname(user.getFirstname());
            dto.setLastname(user.getLastname());
            dto.setRole(user.getRole().name());

            // 👇 Nouveau format d'URL via l'endpoint REST
            String baseUrl = "http://localhost:1217";
            dto.setImageUrl(baseUrl + "/api/search/image?userId=" + user.getId() + "&role=" + user.getRole().name());

            return dto;
        }).collect(Collectors.toList());
    }
}
