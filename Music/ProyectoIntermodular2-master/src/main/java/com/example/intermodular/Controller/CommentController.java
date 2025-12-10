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

import com.example.intermodular.Entity.TablaComments;
import com.example.intermodular.Repository.CommentRepository;

@RestController
@RequestMapping("/api/comentarios")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    // Obtener todos los comentarios
    @GetMapping
    public List<TablaComments> getAllComments() {
        return commentRepository.findAll();
    }

    // Obtener comentarios por serie
    @GetMapping("/serie/{idSerie}")
    public List<TablaComments> getCommentsBySerie(@PathVariable Integer idSerie) {
        return commentRepository.findByIdSerie(idSerie);
    }

    // Obtener comentarios por usuario
    @GetMapping("/usuario/{idUsuario}")
    public List<TablaComments> getCommentsByUsuario(@PathVariable Integer idUsuario) {
        return commentRepository.findByIdUsuario(idUsuario);
    }

    // Crear nuevo comentario
    @PostMapping
    public TablaComments createComment(@RequestBody TablaComments comentario) {
        return commentRepository.save(comentario);
    }

    // Dar like a comentario
    @PutMapping("/{idComentario}/like")
    public ResponseEntity<TablaComments> likeComment(@PathVariable Integer idComentario) {
        return commentRepository.findById(idComentario)
                .map(comentario -> {
                    comentario.setLikes(comentario.getLikes() + 1);
                    return ResponseEntity.ok(commentRepository.save(comentario));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Eliminar comentario
    @DeleteMapping("/{idComentario}")
    public ResponseEntity<Void> deleteComment(@PathVariable Integer idComentario) {
        if (commentRepository.existsById(idComentario)) {
            commentRepository.deleteByIdComentario(idComentario);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
