package com.example.intermodular.Service;

import java.util.List;
import java.util.Optional;
import java.util.Scanner;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.intermodular.Entity.TablaSeries;
import com.example.intermodular.Repository.SerieRepository;

@Service
public class SerieService 
{
    @Autowired
    private SerieRepository serieRepository;
    
    private static Scanner sc = new Scanner(System.in);

    // MÉTODO PRINCIPAL: Listar todas las series
    public void listarTodasLasSeries() 
    {
        System.out.println("\nLISTADO COMPLETO DE SERIES");
        System.out.println("==========================================");
        
        List<TablaSeries> todasLasSeries = serieRepository.findAll();
        
        if (todasLasSeries.isEmpty()) 
        {
            System.out.println("No hay series en la base de datos");
            return;
        }
        
        mostrarSeriesConFormato(todasLasSeries);
    }

    // Listar series ordenadas por título
    public void listarSeriesOrdenadasPorTitulo() 
    {
        System.out.println("\nSERIES ORDENADAS ALFABÉTICAMENTE");
        System.out.println("==========================================");
        
        List<TablaSeries> series = serieRepository.findAllOrderByTitulo();
        
        if (series.isEmpty()) 
        {
            System.out.println("No hay series en la base de datos");
            return;
        }
        
        mostrarSeriesConFormato(series);
    }

    // Listar series ordenadas por rating
    public void listarSeriesOrdenadasPorRating() 
    {
        System.out.println("\nSERIES ORDENADAS POR RATING");
        System.out.println("==========================================");
        
        List<TablaSeries> series = serieRepository.findAllOrderByRatingDesc();
        
        if (series.isEmpty()) 
        {
            System.out.println("📭 No hay series en la base de datos");
            return;
        }
        
        for (int i = 0; i < series.size(); i++) 
        {
            TablaSeries serie = series.get(i);
            System.out.println((i + 1) + ". " + serie.getTitulo());
            System.out.println("Rating: " + serie.getRatingPromedio());
            System.out.println("Estado: " + serie.getEstado());
            System.out.println("Año: " + serie.getAnyoLanzamiento());
            System.out.println("   ---");
        }
        
        System.out.println("Total: " + series.size() + " series");
    }

    // Listar series por estado
    public void listarSeriesPorEstado() 
    {
        System.out.print("\nIntroducir estado a filtrar (Finalizado/En emision/Proximamente): ");
        String estado = sc.nextLine();
        
        List<TablaSeries> series = serieRepository.findByEstado(estado);
        
        System.out.println("\nSERIES CON ESTADO: " + estado.toUpperCase());
        System.out.println("==========================================");
        
        if (series.isEmpty()) 
        {
            System.out.println("No hay series con estado: '" + estado + "'");
            return;
        }
        
        mostrarSeriesConFormato(series);
        System.out.println("Total series con estado '" + estado + "': " + series.size());
    }

    // ✅ Listar series populares (rating >= 4)
    public void listarSeriesPopulares() 
    {
        System.out.println("\nSERIES POPULARES (Rating >= 4.0)");
        System.out.println("==========================================");
        
        List<TablaSeries> seriesPopulares = serieRepository.findByRatingPromedioGreaterThanEqual(4.0);
        
        if (seriesPopulares.isEmpty()) 
        {
            System.out.println("📭 No hay series populares (rating >= 4.0)");
            return;
        }
        
        for (int i = 0; i < seriesPopulares.size(); i++) 
        {
            TablaSeries serie = seriesPopulares.get(i);
            System.out.println((i + 1) + ". " + serie.getTitulo());
            System.out.println("Rating: " + serie.getRatingPromedio());
            System.out.println((serie.getSinopsis().length() > 60 ? serie.getSinopsis().substring(0, 60) + "..." : serie.getSinopsis()));
            System.out.println("   ---");
        }
        
        System.out.println("Total series populares: " + seriesPopulares.size());
    }

    // Buscar series por título
    public void buscarSeriesPorTitulo() 
    {
        System.out.print("\nIntroducir título a buscar: ");
        String titulo = sc.nextLine();
        
        List<TablaSeries> series = serieRepository.findByTituloContainingIgnoreCase(titulo);
        
        System.out.println("\nRESULTADOS DE BÚSQUEDA: '" + titulo + "'");
        System.out.println("==========================================");
        
        if (series.isEmpty()) 
        {
            System.out.println("No se encontraron series con: '" + titulo + "'");
            return;
        }
        
        mostrarSeriesConFormato(series);
        System.out.println("Resultados encontrados: " + series.size());
    }

    // Mostrar estadísticas generales
    public void mostrarEstadisticas() 
    {
        long totalSeries = serieRepository.count();
        long finalizadas = serieRepository.countByEstado("Finalizado");
        long enEmision = serieRepository.countByEstado("En emision");
        long proximamente = serieRepository.countByEstado("Proximamente");
        
        System.out.println("\nESTADÍSTICAS DE SERIESBOX");
        System.out.println("==========================================");
        System.out.println("Total series: " + totalSeries);
        System.out.println("Finalizadas: " + finalizadas);
        System.out.println("En emisión: " + enEmision);
        System.out.println("Próximamente: " + proximamente);
        
        if (totalSeries > 0) 
        {
            List<TablaSeries> todas = serieRepository.findAll();
            double ratingPromedio = todas.stream().mapToDouble(TablaSeries::getRatingPromedio).average().orElse(0.0);
                
            System.out.println("Rating promedio: " + String.format("%.1f", ratingPromedio));
        }
    }

    // MÉTODO AUXILIAR: Formatear la visualización de series
    private void mostrarSeriesConFormato(List<TablaSeries> series) 
    {
        for (int i = 0; i < series.size(); i++) 
        {
            TablaSeries serie = series.get(i);
            
            if ("Finalizado".equals(serie.getEstado()));
            if ("Proximamente".equals(serie.getEstado()));
            
            System.out.println((i + 1) + " " + serie.getTitulo());
            System.out.println(("Sinopsis: " + serie.getSinopsis()));
            System.out.println("Episodios: " + serie.getEpisodios() + " | Año: " + serie.getAnyoLanzamiento() +" | Rating: " + serie.getRatingPromedio());
            System.out.println("   ---");
        }
        
        System.out.println("Total series mostradas: " + series.size());
    }

    public void crearSerie()
    {
        TablaSeries ts = new TablaSeries();
        System.out.print("\nIntroduce el titulo de la serie: ");
        ts.setTitulo(sc.nextLine());
        System.out.print("\nIntroduce su sinopsis: ");
        ts.setSinopsis(sc.nextLine());
        System.out.print("\nIntroduce el numero de episodios que tiene: ");
        ts.setEpisodios(sc.nextInt());
        sc.nextLine();
        System.out.print("\nIntroduce el estado actual de la serie (Finalizado, Proximamente, En emision): ");
        ts.setEstado(sc.nextLine());
        System.out.print("\nIndica el año de lanzamiento de la serie: ");
        ts.setAnyoLanzamiento(sc.nextInt());
        sc.nextLine();
        System.out.print("\nURL de la imagen de la serie: ");
        ts.setPosterUrl(sc.nextLine());
        System.out.print("\nURL del trailer: ");
        ts.setTrailerUrl(sc.nextLine());
        System.out.print("\nNota promedio: ");
        ts.setRatingPromedio(sc.nextDouble());
        sc.nextLine();

        ts = serieRepository.save(ts);

        System.out.println("Serie " + ts.getTitulo() + " guardada de manera exitosa");
    }
    
    // Métodos para la API REST
    public List<TablaSeries> getAllSeries() {
        return serieRepository.findAll();
    }

    public Optional<TablaSeries> getSeriesById(Integer id) {
        return serieRepository.findById(id);
    }

    public List<TablaSeries> getSeriesPopulares() {
        return serieRepository.findByRatingPromedioGreaterThanEqual(4.0);
    }

    public List<TablaSeries> getSeriesByEstado(String estado) {
        return serieRepository.findByEstado(estado);
    }

    public List<TablaSeries> searchSeriesByTitulo(String titulo) {
        return serieRepository.findByTituloContainingIgnoreCase(titulo);
    }

    public List<TablaSeries> getSeriesOrderedByRating() {
        return serieRepository.findAllOrderByRatingDesc();
    }

    public TablaSeries createSeries(TablaSeries serie) {
        return serieRepository.save(serie);
    }

    public Long countSeries() {
        return serieRepository.count();
    }
}