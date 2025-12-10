package com.example.intermodular.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Scanner;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.intermodular.Entity.TablaRating;
import com.example.intermodular.Repository.RatingRepository;

@Service
public class RatingService 
{
    @Autowired
    private RatingRepository ratingRepository;
    Scanner sc = new Scanner(System.in);

    public void añadirValoracion()
    {
        TablaRating rating = new TablaRating();
        System.out.println("Introduce el id de la serie");
        rating.setIdSerie(sc.nextInt());
        sc.nextLine();
        System.out.println("Introduce el id de usuario: ");
        rating.setIdUsuario(sc.nextInt());
        sc.nextLine();
        System.out.println("Introduce la puntuacion de la valoracion: ");
        rating.setPuntuacion(sc.nextDouble());
        sc.nextLine(); // Limpiar el buffer
        rating.setFechaValoracion(obtenerFechaActual());   
        ratingRepository.save(rating);
    }

    //Metodo para obtener la fecha actual en la cual se crea la valoracion
    public String obtenerFechaActual()
    {
        LocalDate hoy = LocalDate.now();
        DateTimeFormatter formato = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        return hoy.format(formato);
    }

    public void actualizarValoracion()
    {
        System.out.println("Introduce el id de la serie a actualizar: ");
        int idSerie = sc.nextInt();
        sc.nextLine(); // Limpiar el buffer
        System.out.println("Introduce el id del usuario que actualiza: ");
        int idUsuario = sc.nextInt();
        sc.nextLine();

        TablaRating rating = ratingRepository.findByUsuarioIdAndSerieId(idUsuario, idSerie);

        if (rating != null) 
        {
            System.out.println("El rating anterior era: " + rating.getPuntuacion());
            System.out.println("Introduce la nueva puntuacion de la valoracion: ");
            rating.setPuntuacion(sc.nextDouble());
            sc.nextLine(); // Limpiar el buffer
            rating.setFechaValoracion(obtenerFechaActual());
            ratingRepository.save(rating);
        } 
        else 
        {
            System.out.println("No se encontró una valoracion con el id proporcionado.");
        }
    }

    public void eliminarValoracion()
    {
        System.out.println("Introduce el id de la serie: ");
        int idSerie = sc.nextInt();
        sc.nextLine(); // Limpiar el buffer
        System.out.println("Introduce el id del usuario que elimina: ");
        int idUsuario = sc.nextInt();
        sc.nextLine();

        TablaRating rating = ratingRepository.findByUsuarioIdAndSerieId(idUsuario, idSerie);

        if (rating != null) 
        {
            ratingRepository.delete(rating);
            System.out.println("Valoracion eliminada correctamente.");
        } 
        else 
        {
            System.out.println("No se encontró una valoracion con el id proporcionado.");
        }
    }

    public void verValoracion()
    {

        System.out.println("Introduce el id del usuario a ver: ");
        int idUsuario = sc.nextInt();
        sc.nextLine();

        List<TablaRating> ratings = ratingRepository.findRatingsByIdUsuarios(idUsuario);

        if (ratings != null && !ratings.isEmpty()) {
        System.out.println("Valoraciones del usuario con id " + idUsuario + ":");
        for (TablaRating rating : ratings) {
            System.out.println("Nombre serie: " + ratingRepository.findNombreSerie(rating.getIdSerie()) + 
                             " - Puntuación: " + rating.getPuntuacion() + 
                             " - Fecha de Valoración: " + rating.getFechaValoracion());
        }
        } else {
            System.out.println("No se encontraron valoraciones para el usuario con el id proporcionado.");
        }
    }

    public void obtenerPromedioSerie()
    {
        System.out.println("Introduce el id de la serie a ver su promedio: ");
        int idSerie = sc.nextInt();
        sc.nextLine();

        Double promedio = ratingRepository.findAverageRatingBySerieId(idSerie);

        if (promedio != null) 
        {
            System.out.printf("El promedio de la serie con id " + idSerie + " es: %.2f%n" , promedio);
        } 
        else 
        {
            System.out.println("No se encontraron valoraciones para la serie con el id proporcionado.");
        }
    }

    public List<TablaRating> findAllRatings()
    {
        return ratingRepository.findAllRatings();
    }

    
}
