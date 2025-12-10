package com.example.intermodular.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "SeriesBox Backend funcionando correctamente! " +
               "Usa /api/series para acceder a las series.";
    }

    @GetMapping("/health")
    public String health() {
        return "Servidor activo - Conexión a Supabase establecida";
    }
}