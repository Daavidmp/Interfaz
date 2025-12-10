package com.example.intermodular.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.intermodular.Entity.TablaRating;
import com.example.intermodular.Repository.RatingRepository;
import com.example.intermodular.Service.RatingService;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class RatingController {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private RatingService ratingService;

    // Obtener todas las valoraciones
    @GetMapping
    public List<TablaRating> getAllRatings() {
        return ratingService.findAllRatings();
    }

    // Obtener valoraciones por usuario
    @GetMapping("/usuario/{idUsuario}")
    public List<TablaRating> getRatingsByUsuario(@PathVariable Integer idUsuario) {
        return ratingRepository.findRatingsByIdUsuarios(idUsuario);
    }

    // Obtener valoración específica de usuario y serie
    @GetMapping("/usuario/{idUsuario}/serie/{idSerie}")
    public ResponseEntity<TablaRating> getRatingByUsuarioAndSerie(
            @PathVariable Integer idUsuario, 
            @PathVariable Integer idSerie) {
        TablaRating rating = ratingRepository.findByUsuarioIdAndSerieId(idUsuario, idSerie);
        return rating != null ? ResponseEntity.ok(rating) : ResponseEntity.notFound().build();
    }

    // Obtener promedio de una serie
    @GetMapping("/serie/{idSerie}/promedio")
    public ResponseEntity<Double> getAverageRating(@PathVariable Integer idSerie) {
        Double promedio = ratingRepository.findAverageRatingBySerieId(idSerie);
        return promedio != null ? ResponseEntity.ok(promedio) : ResponseEntity.ok(0.0);
    }

    // Crear nueva valoración
    @PostMapping
    public TablaRating createRating(@RequestBody TablaRating rating) {
        return ratingRepository.save(rating);
    }

    // Actualizar valoración
    @PutMapping
    public TablaRating updateRating(@RequestBody TablaRating rating) {
        return ratingRepository.save(rating);
    }

    // Eliminar valoración
    @DeleteMapping("/usuario/{idUsuario}/serie/{idSerie}")
    public ResponseEntity<Void> deleteRating(
            @PathVariable Integer idUsuario, 
            @PathVariable Integer idSerie) {
        TablaRating rating = ratingRepository.findByUsuarioIdAndSerieId(idUsuario, idSerie);
        if (rating != null) {
            ratingRepository.delete(rating);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}