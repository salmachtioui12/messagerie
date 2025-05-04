package com.example.einternmatchback.Authentification.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configure Spring Boot pour servir des fichiers depuis le répertoire "uploads/company-logos"
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/company-logos/");
        // Images des étudiants
        registry.addResourceHandler("/uploads/student/**")
                .addResourceLocations("file:" + System.getProperty("user.dir")  + "/uploads/student/");
    }
}
