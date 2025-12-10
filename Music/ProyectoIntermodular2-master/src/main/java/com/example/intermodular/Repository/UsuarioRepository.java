package com.example.intermodular.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.intermodular.Entity.TablaUsuarios;

@Repository
public interface UsuarioRepository extends JpaRepository<TablaUsuarios, Integer> {
    
    // MÉTODO 1: Buscar por email exacto (para login)
    @Query("SELECT u FROM TablaUsuarios u WHERE LOWER(u.email) = LOWER(:email)")
    TablaUsuarios findByEmail(@Param("email") String email);
    
    // MÉTODO 2: Buscar por email que contenga (para búsqueda)
    @Query("SELECT u FROM TablaUsuarios u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))")
    TablaUsuarios findByEmailContainingIgnoreCase(@Param("email") String email);
    
    // MÉTODO 3: Buscar por ID (para compatibilidad)
    @Query("SELECT u FROM TablaUsuarios u WHERE u.idUsuario = :id")
    TablaUsuarios findById(@Param("id") int id);
    
    // MÉTODO 4: Obtener todos ordenados
    @Query("SELECT u FROM TablaUsuarios u ORDER BY u.idUsuario")
    List<TablaUsuarios> findAllUsuarios();
    
    // MÉTODO 5: Buscar por email y contraseña (LOGIN)
    @Query("SELECT u FROM TablaUsuarios u WHERE LOWER(u.email) = LOWER(:email) AND u.contrasenya = :contrasenya")
    TablaUsuarios findByEmailAndContrasenya(@Param("email") String email, @Param("contrasenya") String contrasenya);
    
    // MÉTODO 6: Verificar si email existe
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM TablaUsuarios u WHERE LOWER(u.email) = LOWER(:email)")
    boolean existsByEmail(@Param("email") String email);
    
    // MÉTODO 7: Buscar por username
    @Query("SELECT u FROM TablaUsuarios u WHERE LOWER(u.username) = LOWER(:username)")
    TablaUsuarios findByUsername(@Param("username") String username);
    
    // MÉTODO 8: Verificar si username existe
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM TablaUsuarios u WHERE LOWER(u.username) = LOWER(:username)")
    boolean existsByUsername(@Param("username") String username);
    
    // MÉTODO 9: Contar total de usuarios
    @Query("SELECT COUNT(u) FROM TablaUsuarios u")
    long countUsuarios();
    
    // MÉTODO 10: Buscar usuarios por nombre similar
    @Query("SELECT u FROM TablaUsuarios u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    List<TablaUsuarios> searchByUsername(@Param("nombre") String nombre);
    
    // MÉTODO 11: Métodos por defecto para Optional (más seguro)
    default Optional<TablaUsuarios> findUsuarioById(Integer id) {
        return Optional.empty();
    }
    
    default Optional<TablaUsuarios> findUsuarioByEmail(String email) {
        return Optional.ofNullable(findByEmail(email));
    }
}