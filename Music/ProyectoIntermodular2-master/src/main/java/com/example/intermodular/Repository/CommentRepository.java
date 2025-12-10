package com.example.intermodular.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.intermodular.Entity.TablaComments;

@Repository
public interface CommentRepository extends JpaRepository<TablaComments, Integer>
{
    // Obtener todos los comentarios de una serie
    List<TablaComments> findByIdSerie(int idSerie);
    
    // Obtener todos los comentarios de un usuario
    List<TablaComments> findByIdUsuario(int idUsuario);
    
    // Eliminar comentarios por ID de usuario
    @Transactional
    @Modifying
    @Query("DELETE FROM TablaComments c WHERE c.idUsuario = :idUsuario")
    void deleteByIdUsuario(@Param("idUsuario") int idUsuario);
    
    // Eliminar comentario específico por ID
    @Transactional
    @Modifying
    @Query("DELETE FROM TablaComments c WHERE c.idComentario = :idComentario")
    void deleteByIdComentario(@Param("idComentario") int idComentario);
}