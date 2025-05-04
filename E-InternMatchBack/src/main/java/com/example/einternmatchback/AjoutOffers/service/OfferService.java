package com.example.einternmatchback.AjoutOffers.service;

import com.example.einternmatchback.AjoutOffers.dto.OfferRequest;
import com.example.einternmatchback.AjoutOffers.model.*;
import com.example.einternmatchback.AjoutOffers.repo.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;
    private final CompanyService companyService;

    @Transactional
    public Offer createOffer(OfferRequest request, Principal principal) {
        Company company = companyService.getCompany(principal);

        Offer offer = Offer.builder()
                .company(company)
                .title(request.getTitle())
                .description(request.getDescription())
                .stageType(request.getStageType())
                .location(request.getLocation())
                .startDate(request.getStartDate())
                .duration(request.getDuration())
                .skillsRequired(request.getSkillsRequired())
                .responsibilities(request.getResponsibilities())
                .benefits(request.getBenefits())
                .isSponsored(request.getIsSponsored() != null ? request.getIsSponsored() : false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return offerRepository.save(offer);
    }

    public List<Offer> getCompanyOffers(Principal principal) {
        Company company = companyService.getCompany(principal);
        return offerRepository.findByCompanyId(company.getId());
    }

    @Transactional
    public Offer updateOffer(Integer id, OfferRequest request, Principal principal) {
        Offer offer = getOwnedOffer(id, principal);

        if (request.getTitle() != null) offer.setTitle(request.getTitle());
        if (request.getDescription() != null) offer.setDescription(request.getDescription());
        if (request.getStageType() != null) offer.setStageType(request.getStageType());
        if (request.getLocation() != null) offer.setLocation(request.getLocation());
        if (request.getStartDate() != null) offer.setStartDate(request.getStartDate());
        if (request.getDuration() != null) offer.setDuration(request.getDuration());
        if (request.getSkillsRequired() != null) offer.setSkillsRequired(request.getSkillsRequired());
        if (request.getResponsibilities() != null) offer.setResponsibilities(request.getResponsibilities());
        if (request.getBenefits() != null) offer.setBenefits(request.getBenefits());
        if (request.getIsSponsored() != null) offer.setIsSponsored(request.getIsSponsored());
        if (request.getIsActive() != null) offer.setIsActive(request.getIsActive());
        return offerRepository.save(offer);
    }
    public Offer getOfferById(Integer id, Principal principal) {
        Company company = companyService.getCompany(principal);
        return offerRepository.findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Offre non trouvée ou vous n'avez pas les droits"
                ));
    }
    @Transactional
    public void deleteOffer(Integer id, Principal principal) {
        Offer offer = getOwnedOffer(id, principal);
        offerRepository.delete(offer);
    }

    private Offer getOwnedOffer(Integer id, Principal principal) {
        Company company = companyService.getCompany(principal);
        return offerRepository.findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() -> new AccessDeniedException("Offer not found or access denied"));
    }
}