package com.example.intermodular.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.intermodular.Entity.TablaSeries;
import com.example.intermodular.Service.SerieService;

@RestController
@RequestMapping("/api/series")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class SerieController {

    @Autowired
    private SerieService serieService;

    // Obtener todas las series
    @GetMapping
    public List<TablaSeries> getAllSeries() {
        return serieService.getAllSeries();
    }

    // Obtener serie por ID
    @GetMapping("/{id}")
    public ResponseEntity<TablaSeries> getSeriesById(@PathVariable Integer id) {
        Optional<TablaSeries> serie = serieService.getSeriesById(id);
        return serie.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // Obtener series populares (rating >= 4)
    @GetMapping("/populares")
    public List<TablaSeries> getSeriesPopulares() {
        return serieService.getSeriesPopulares();
    }

    // Obtener series por estado
    @GetMapping("/estado/{estado}")
    public List<TablaSeries> getSeriesByEstado(@PathVariable String estado) {
        return serieService.getSeriesByEstado(estado);
    }

    // Buscar series por título
    @GetMapping("/buscar")
    public List<TablaSeries> searchSeries(@RequestParam String titulo) {
        return serieService.searchSeriesByTitulo(titulo);
    }

    // Obtener series ordenadas por rating
    @GetMapping("/top-rated")
    public List<TablaSeries> getTopRatedSeries() {
        return serieService.getSeriesOrderedByRating();
    }

    // Obtener series recientes (últimas 6)
    @GetMapping("/recientes")
    public List<TablaSeries> getSeriesRecientes() {
        List<TablaSeries> todas = serieService.getAllSeries();
        int startIndex = Math.max(0, todas.size() - 6);
        return todas.subList(startIndex, todas.size());
    }

    // Endpoint de prueba
    @GetMapping("/test")
    public String test() {
        return "✅ Backend SeriesBox funcionando correctamente!";
    }

    // Contar total de series
    @GetMapping("/count")
    public Long countSeries() {
        return serieService.countSeries();
    }

    // Crear nueva serie
    @PostMapping
    public TablaSeries createSeries(@RequestBody TablaSeries serie) {
        return serieService.createSeries(serie);
    }
}