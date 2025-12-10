package com.example.intermodular.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Scanner;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.intermodular.Entity.TablaComments;
import com.example.intermodular.Repository.CommentRepository;

@Service
public class CommentService 
{
    @Autowired
    private CommentRepository commentRepository;
    Scanner sc = new Scanner(System.in);

    public void añadirComentario()
    {
        TablaComments comentario = new TablaComments();
        System.out.println("Introduce el id de la serie: ");
        comentario.setIdSerie(sc.nextInt());
        sc.nextLine();
        System.out.println("Introduce el id de usuario: ");
        comentario.setIdUsuario(sc.nextInt());
        sc.nextLine();
        System.out.println("Introduce el texto del comentario: ");
        comentario.setTexto(sc.nextLine());
        
        // Obtener la fecha actual y formatearla
        String fechaActual = obtenerFechaActual();
        String fechaNumerica = fechaActual.replace("/", "");
        int fechaComentario = Integer.parseInt(fechaNumerica);
        
        comentario.setFechaComentario(fechaComentario);
        comentario.setLikes(0); // Inicializar likes en 0
        
        commentRepository.save(comentario);
        System.out.println("Comentario añadido correctamente.");
    }

    public void obtenerComentariosPorSerie()
    {
        System.out.println("Introduce el id de la serie: ");
        int idSerie = sc.nextInt();
        sc.nextLine();

        List<TablaComments> comentarios = commentRepository.findByIdSerie(idSerie);

        if (comentarios != null && !comentarios.isEmpty()) 
        {
            System.out.println("Comentarios de la serie con id " + idSerie + ":");
            for (TablaComments comentario : comentarios) {
                System.out.println("Usuario: " + comentario.getIdUsuario() + 
                                 " - Comentario: " + comentario.getTexto() + 
                                 " - Fecha: " + formatearFecha(comentario.getFechaComentario()) + 
                                 " - Likes: " + comentario.getLikes());
            }
        } 
        else 
        {
            System.out.println("No se encontraron comentarios para la serie con el id proporcionado.");
        }
    }

    public void obtenerComentariosPorUsuario()
    {
        System.out.println("Introduce el id del usuario: ");
        int idUsuario = sc.nextInt();
        sc.nextLine();

        List<TablaComments> comentarios = commentRepository.findByIdUsuario(idUsuario);

        if (comentarios != null && !comentarios.isEmpty()) {
            System.out.println("Comentarios del usuario con id " + idUsuario + ":");
            for (TablaComments comentario : comentarios) {
                System.out.println("Serie: " + comentario.getIdSerie() + 
                                 " - Comentario: " + comentario.getTexto() + 
                                 " - Fecha: " + formatearFecha(comentario.getFechaComentario()) + 
                                 " - Likes: " + comentario.getLikes());
            }
        } else {
            System.out.println("No se encontraron comentarios para el usuario con el id proporcionado.");
        }
    }

    public void eliminarComentariosDeUsuario()
    {
        System.out.println("Introduce el id del usuario cuyos comentarios quieres eliminar: ");
        int idUsuario = sc.nextInt();
        sc.nextLine();

        List<TablaComments> comentarios = commentRepository.findByIdUsuario(idUsuario);

        if (comentarios != null && !comentarios.isEmpty()) {
            System.out.println("Se van a eliminar " + comentarios.size() + " comentarios del usuario " + idUsuario);
            System.out.println("¿Estás seguro? (s/n): ");
            String confirmacion = sc.nextLine();
            
            if (confirmacion.equalsIgnoreCase("s")) {
                commentRepository.deleteByIdUsuario(idUsuario);
                System.out.println("Comentarios eliminados correctamente.");
            } else {
                System.out.println("Operación cancelada.");
            }
        } else {
            System.out.println("No se encontraron comentarios para el usuario con el id proporcionado.");
        }
    }

    public void eliminarComentario()
    {
        System.out.println("Introduce el id del comentario a eliminar: ");
        int idComentario = sc.nextInt();
        sc.nextLine();

        TablaComments comentario = commentRepository.findById(idComentario).orElse(null);

        if (comentario != null) {
            System.out.println("Comentario a eliminar:");
            System.out.println("Usuario: " + comentario.getIdUsuario() + 
                             " - Serie: " + comentario.getIdSerie() + 
                             " - Comentario: " + comentario.getTexto());
            System.out.println("¿Estás seguro? (s/n): ");
            String confirmacion = sc.nextLine();
            
            if (confirmacion.equalsIgnoreCase("s")) {
                commentRepository.deleteByIdComentario(idComentario);
                System.out.println("Comentario eliminado correctamente.");
            } else {
                System.out.println("Operación cancelada.");
            }
        } else {
            System.out.println("No se encontró un comentario con el id proporcionado.");
        }
    }

    public void verTodosLosComentarios()
    {
        List<TablaComments> comentarios = commentRepository.findAll();

        if (comentarios != null && !comentarios.isEmpty()) {
            System.out.println("Todos los comentarios:");
            for (TablaComments comentario : comentarios) {
                System.out.println("ID: " + comentario.getIdComentario() + 
                                 " - Usuario: " + comentario.getIdUsuario() + 
                                 " - Serie: " + comentario.getIdSerie() + 
                                 " - Comentario: " + comentario.getTexto() + 
                                 " - Fecha: " + formatearFecha(comentario.getFechaComentario()) + 
                                 " - Likes: " + comentario.getLikes());
            }
        } else {
            System.out.println("No se encontraron comentarios en la base de datos.");
        }
    }

    public void darLikeAComentario()
    {
        System.out.println("Introduce el id del comentario al que quieres dar like: ");
        int idComentario = sc.nextInt();
        sc.nextLine();

        TablaComments comentario = commentRepository.findById(idComentario).orElse(null);

        if (comentario != null) {
            comentario.setLikes(comentario.getLikes() + 1);
            commentRepository.save(comentario);
            System.out.println("Like añadido. Total de likes: " + comentario.getLikes());
        } else {
            System.out.println("No se encontró un comentario con el id proporcionado.");
        }
    }

    // Método para formatear la fecha numérica a String legible
    private String formatearFecha(int fechaNumerica) {
        String fechaStr = String.valueOf(fechaNumerica);
        if (fechaStr.length() == 8) {
            return fechaStr.substring(6, 8) + "/" + fechaStr.substring(4, 6) + "/" + fechaStr.substring(0, 4);
        }
        return String.valueOf(fechaNumerica);
    }

    public String obtenerFechaActual()
    {
        LocalDate hoy = LocalDate.now();
        DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return hoy.format(formato);
    }
}