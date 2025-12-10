package com.example.intermodular.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "series")
public class TablaSeries 
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idSerie;
    
    @Column(name = "titulo")
    private String titulo;
    
    @Column(name = "sinopsis")
    private String sinopsis;
    
    @Column(name = "episodios")
    private Integer episodios;
    
    @Column(name = "estado")
    private String estado;
    
    @Column(name = "anyo_lanzamiento")
    private Integer anyoLanzamiento;
    
    @Column(name = "poster_url")
    private String posterUrl;
    
    @Column(name = "trailer_url")
    private String trailerUrl;
    
    @Column(name = "rating_promedio")
    private Double ratingPromedio;

    // Constructor vacío
    public TablaSeries() {}

    // Constructor con todos los parámetros
    public TablaSeries(String titulo, String sinopsis, Integer episodios, String estado, Integer anyoLanzamiento, String posterUrl, String trailerUrl, Double ratingPromedio) 
    {
        this.titulo = titulo;
        this.sinopsis = sinopsis;
        this.episodios = episodios;
        this.estado = estado;
        this.anyoLanzamiento = anyoLanzamiento;
        this.posterUrl = posterUrl;
        this.trailerUrl = trailerUrl;
        this.ratingPromedio = ratingPromedio;
    }

    // Getters y Setters
    public Integer getIdSerie() 
    { 
        return idSerie; 
    }

    public void setIdSerie(Integer idSerie) 
    { 
        this.idSerie = idSerie; 
    }
    
    public String getTitulo() 
    { 
        return titulo; 
    }

    public void setTitulo(String titulo) 
    { 
        this.titulo = titulo; 
    }
    
    public String getSinopsis() 
    { 
        return sinopsis; 
    }

    public void setSinopsis(String sinopsis) 
    { 
        this.sinopsis = sinopsis; 
    }
    
    public Integer getEpisodios() 
    { 
        return episodios; 
    }

    public void setEpisodios(Integer episodios) 
    { 
        this.episodios = episodios; 
    }
    
    public String getEstado() 
    { 
        return estado; 
    }

    public void setEstado(String estado) 
    { 
        this.estado = estado; 
    }
    
    public Integer getAnyoLanzamiento() 
    { 
        return anyoLanzamiento; 
    }

    public void setAnyoLanzamiento(Integer anyoLanzamiento) 
    { 
        this.anyoLanzamiento = anyoLanzamiento; 
    }
    
    public String getPosterUrl() 
    { 
        return posterUrl; 
    }

    public void setPosterUrl(String posterUrl) 
    { 
        this.posterUrl = posterUrl; 
    }
    
    public String getTrailerUrl() 
    { 
        return trailerUrl; 
    }

    public void setTrailerUrl(String trailerUrl) 
    { 
        this.trailerUrl = trailerUrl; 
    }
    
    public Double getRatingPromedio() 
    { 
        return ratingPromedio; 
    }

    public void setRatingPromedio(Double ratingPromedio) 
    { 
        this.ratingPromedio = ratingPromedio; 
    }
}