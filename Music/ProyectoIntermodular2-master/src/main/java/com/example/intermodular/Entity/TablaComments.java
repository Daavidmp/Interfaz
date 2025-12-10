package com.example.intermodular.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="comentarios")
public class TablaComments 
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idComentario;

    @Column(name = "id_usuario")
    private int idUsuario;

    @Column(name = "id_serie") 
    private int idSerie;
    
    @Column(name = "texto")
    private String texto;

    @Column(name = "fecha_comentario")
    private int fechaComentario;

    @Column(name = "likes")
    private int likes;

    public TablaComments(){}

    public TablaComments (String texto, int likes){
        this.texto = texto;
        this.likes = likes;
    }

    public int getIdComentario() {
        return idComentario;
    }

    public void setIdComentario(int idComentario) {
        this.idComentario = idComentario;
    }

    public int getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(int idUsuario) {
        this.idUsuario = idUsuario;
    }

    public int getIdSerie() {
        return idSerie;
    }

    public void setIdSerie(int idSerie) {
        this.idSerie = idSerie;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public int getFechaComentario() {
        return fechaComentario;
    }

    public void setFechaComentario(int fechaComentario) {
        this.fechaComentario = fechaComentario;
    }

    public int getLikes() {
        return likes;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

     @Override
    public String toString() {
        return "TablaComments{" +
                "idComentario=" + idComentario +
                ", idUsuario=" + idUsuario +
                ", idSerie=" + idSerie +
                ", texto='" + texto + '\'' +
                ", fechaComentario=" + fechaComentario +
                ", likes=" + likes +
                '}';
    }
}
