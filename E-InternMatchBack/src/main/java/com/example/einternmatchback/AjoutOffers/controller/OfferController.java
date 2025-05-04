package com.example.einternmatchback.AjoutOffers.controller;

import com.example.einternmatchback.AjoutOffers.dto.OfferRequest;
import com.example.einternmatchback.AjoutOffers.model.Offer;
import com.example.einternmatchback.AjoutOffers.service.OfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.security.Principal;
import java.util.List;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public Offer createOffer(@RequestBody OfferRequest offerRequest, Principal principal) {
        return offerService.createOffer(offerRequest, principal);
    }

    @GetMapping("/list")
    public List<Offer> getAllOffers(Principal principal) {
        return offerService.getCompanyOffers(principal);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Offer> getOfferById(@PathVariable Integer id, Principal principal) {
        Offer offer = offerService.getOfferById(id, principal);
        return ResponseEntity.ok(offer);
    }

    @PutMapping("/update/{id}")
    public Offer updateOffer(@PathVariable Integer id, @RequestBody OfferRequest offerRequest, Principal principal) {
        return offerService.updateOffer(id, offerRequest, principal);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteOffer(@PathVariable Integer id, Principal principal) {
        offerService.deleteOffer(id, principal);
    }

}