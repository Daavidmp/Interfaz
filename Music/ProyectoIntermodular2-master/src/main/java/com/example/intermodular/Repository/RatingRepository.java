package com.example.intermodular.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.intermodular.Entity.TablaRating;

@Repository
public interface RatingRepository extends JpaRepository<TablaRating, Integer> 
{
    TablaRating findByPuntuacion(double puntuacion);

    TablaRating findByIdUsuario(int idUsuario);

    @Query("SELECT r FROM TablaRating r")
    List<TablaRating> findAllRatings();

    @Query("SELECT r FROM TablaRating r WHERE r.idUsuario = :usuarioId AND r.idSerie = :serieId")
    TablaRating findByUsuarioIdAndSerieId(int usuarioId, int serieId);

    @Query("SELECT r FROM TablaRating r WHERE r.idUsuario = :idUsuario")
    List<TablaRating> findRatingsByIdUsuarios(int idUsuario);

    @Query(value = "SELECT s.titulo FROM series s WHERE s.id_serie = :idSerie LIMIT 1", nativeQuery = true)
    String findNombreSerie(@Param("idSerie") int idSerie);

    @Query("SELECT AVG(r.puntuacion) FROM TablaRating r WHERE r.idSerie = :idSerie")
    Double findAverageRatingBySerieId(@Param("idSerie") int idSerie);

    /*SELECT AVG(puntuacion) FROM valoraciones WHERE id_serie = 4*/
}
