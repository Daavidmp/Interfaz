package com.example.intermodular.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.intermodular.Entity.TablaSeries;

@Repository
public interface SerieRepository extends JpaRepository<TablaSeries, Integer> 
{
    // MÉTODOS BÁSICOS para listar y buscar series
    
    // Buscar por título exacto
    Optional<TablaSeries> findByTitulo(String titulo);
    
    // Buscar series que contengan texto (ignorando mayúsculas/minúsculas)
    List<TablaSeries> findByTituloContainingIgnoreCase(String titulo);
    
    // Buscar por estado
    List<TablaSeries> findByEstado(String estado);
    
    // Buscar series con rating mayor o igual
    List<TablaSeries> findByRatingPromedioGreaterThanEqual(Double rating);
    
    // Buscar series por rango de años
    List<TablaSeries> findByAnyoLanzamientoBetween(Integer inicio, Integer fin);
    
    // Buscar por estado y ordenar por título
    List<TablaSeries> findByEstadoOrderByTitulo(String estado);
    
    // Contar series por estado
    Long countByEstado(String estado);
    
    // Verificar si existe por título
    Boolean existsByTitulo(String titulo);
    
    // Eliminar por título
    void deleteByTitulo(String titulo);
    
    // CONSULTAS PERSONALIZADAS para ordenar
    
    // Listar todas ordenadas por título
    @Query("SELECT s FROM TablaSeries s ORDER BY s.titulo ASC")
    List<TablaSeries> findAllOrderByTitulo();
    
    // Listar todas ordenadas por rating descendente
    @Query("SELECT s FROM TablaSeries s ORDER BY s.ratingPromedio DESC")
    List<TablaSeries> findAllOrderByRatingDesc();
    
    // Listar todas ordenadas por año descendente
    @Query("SELECT s FROM TablaSeries s ORDER BY s.anyoLanzamiento DESC")
    List<TablaSeries> findAllOrderByAnyoDesc();

    //Diferentes plantillas: find, count, exists, delete ...
}