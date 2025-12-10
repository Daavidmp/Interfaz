package com.example.intermodular.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name ="valoraciones")
public class TablaRating 
{
    @Id
    private int idSerie;
    private int idUsuario;

    @Column(name = "fecha_valoracion")
    private String fechaValoracion;

    @Column(name = "puntuacion")
    private double puntuacion;

    public TablaRating() {}

    public TablaRating(int idSerie, int idUsuario, String fechaValoracion, double puntuacion) 
    {
        this.idSerie = idSerie;
        this.idUsuario = idUsuario;
        this.fechaValoracion = fechaValoracion;
        this.puntuacion = puntuacion;
    }

    public int getIdSerie() 
    {
        return idSerie;
    }

    public void setIdSerie(int idSerie) 
    {
        this.idSerie = idSerie;
    }

    public int getIdUsuario()
    {
        return idUsuario;
    }

    public void setIdUsuario(int idUsuario)
    {
        this.idUsuario = idUsuario;
    }

    public String getFechaValoracion() 
    {
        return fechaValoracion;
    }

    public void setFechaValoracion(String fechaValoracion) 
    {
        this.fechaValoracion = fechaValoracion;
    }

    public double getPuntuacion() 
    {
        return puntuacion;
    }

    public void setPuntuacion(double puntuacion) 
    {
        this.puntuacion = puntuacion;
    }       
}