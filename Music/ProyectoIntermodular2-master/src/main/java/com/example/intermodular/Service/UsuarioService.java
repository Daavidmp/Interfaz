package com.example.intermodular.Service;

import java.util.List;
import java.util.Optional;
import java.util.Scanner;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.intermodular.Entity.TablaUsuarios;
import com.example.intermodular.Repository.UsuarioRepository;

@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuariosRepository;
    
    private static Scanner sc = new Scanner(System.in);
    
    // =============== MÉTODOS PARA CONSOLA (ORIGINALES) ===============
    
    public void crearUsuario() {
        TablaUsuarios usuario = new TablaUsuarios();
        
        System.out.print("\nIntroduce el nombre de usuario: ");
        usuario.setUsername(sc.nextLine());
        
        System.out.print("Introduce el email: ");
        usuario.setEmail(sc.nextLine());
        
        System.out.print("Indica la contraseña: ");
        usuario.setContrasenya(sc.nextLine());
        
        TablaUsuarios usuarioGuardado = usuariosRepository.save(usuario);
        System.out.println("✓ Usuario '" + usuarioGuardado.getUsername() + "' creado exitosamente");
    }
    
    public void buscarUsuarioPorEmail() {
        System.out.print("\nIntroduce el email del usuario a buscar: ");
        String email = sc.nextLine();
        
        TablaUsuarios usuario = usuariosRepository.findByEmail(email);
        
        if (usuario != null) {
            System.out.println("\n=== USUARIO ENCONTRADO ===");
            System.out.println("ID: " + usuario.getIdUsuario());
            System.out.println("Username: " + usuario.getUsername());
            System.out.println("Email: " + usuario.getEmail());
        } else {
            System.out.println("✗ No se encontró ningún usuario con ese email.");
        }
    }
    
    public void buscarUsuarioPorId() {
        System.out.print("\nIntroduce el ID del usuario a buscar: ");
        int id = sc.nextInt();
        sc.nextLine(); // Limpiar buffer
        
        TablaUsuarios usuario = usuariosRepository.findById(id);
        
        if (usuario != null) {
            System.out.println("\n=== USUARIO ENCONTRADO ===");
            System.out.println("ID: " + usuario.getIdUsuario());
            System.out.println("Username: " + usuario.getUsername());
            System.out.println("Email: " + usuario.getEmail());
        } else {
            System.out.println("✗ No se encontró ningún usuario con ID: " + id);
        }
    }
    
    public void actualizarUsuario() {
        System.out.print("\nIntroduce el ID del usuario a actualizar: ");
        int id = sc.nextInt();
        sc.nextLine();
        
        TablaUsuarios usuario = usuariosRepository.findById(id);
        
        if (usuario != null) {
            System.out.println("\nUsuario actual: " + usuario.getUsername() + " (" + usuario.getEmail() + ")");
            
            System.out.print("Nuevo nombre de usuario (dejar vacío para mantener): ");
            String nuevoUsername = sc.nextLine();
            if (!nuevoUsername.trim().isEmpty()) {
                usuario.setUsername(nuevoUsername);
            }
            
            System.out.print("Nuevo email (dejar vacío para mantener): ");
            String nuevoEmail = sc.nextLine();
            if (!nuevoEmail.trim().isEmpty()) {
                usuario.setEmail(nuevoEmail);
            }
            
            System.out.print("Nueva contraseña (dejar vacío para mantener): ");
            String nuevaContrasenya = sc.nextLine();
            if (!nuevaContrasenya.trim().isEmpty()) {
                usuario.setContrasenya(nuevaContrasenya);
            }
            
            usuariosRepository.save(usuario);
            System.out.println("✓ Usuario actualizado correctamente.");
        } else {
            System.out.println("✗ No se encontró ningún usuario con ID: " + id);
        }
    }
    
    public void cambiarContrasenya() {
        System.out.print("\nIntroduce el ID del usuario: ");
        int id = sc.nextInt();
        sc.nextLine();
        
        TablaUsuarios usuario = usuariosRepository.findById(id);
        
        if (usuario != null) {
            System.out.print("Introduce la nueva contraseña: ");
            String nuevaContrasenya = sc.nextLine();
            
            usuario.setContrasenya(nuevaContrasenya);
            usuariosRepository.save(usuario);
            System.out.println("✓ Contraseña actualizada correctamente.");
        } else {
            System.out.println("✗ No se encontró ningún usuario con ID: " + id);
        }
    }
    
    public void listarUsuarios() {
        List<TablaUsuarios> usuarios = usuariosRepository.findAllUsuarios();
        
        System.out.println("\n=== LISTA DE USUARIOS ===");
        System.out.println("Total: " + usuarios.size() + " usuarios");
        System.out.println("────────────────────────────────────");
        
        if (usuarios.isEmpty()) {
            System.out.println("No hay usuarios registrados.");
        } else {
            for (TablaUsuarios usuario : usuarios) {
                System.out.println("ID: " + usuario.getIdUsuario() + 
                                 " | Username: " + usuario.getUsername() + 
                                 " | Email: " + usuario.getEmail());
            }
        }
    }
    
    // =============== NUEVOS MÉTODOS PARA FRONTEND ===============
    
    /**
     * Validar login desde frontend
     */
    public TablaUsuarios validarLogin(String email, String contrasenya) {
        return usuariosRepository.findByEmailAndContrasenya(email, contrasenya);
    }
    
    /**
     * Verificar si email ya existe
     */
    public boolean existeEmail(String email) {
        return usuariosRepository.existsByEmail(email);
    }
    
    /**
     * Verificar si username ya existe
     */
    public boolean existeUsername(String username) {
        return usuariosRepository.existsByUsername(username);
    }
    
    /**
     * Crear usuario desde frontend
     */
    public TablaUsuarios crearUsuarioFrontend(String username, String email, String contrasenya) {
        // Verificar si el email ya existe
        if (existeEmail(email)) {
            throw new RuntimeException("El email ya está registrado");
        }
        
        // Verificar si el username ya existe
        if (existeUsername(username)) {
            throw new RuntimeException("El nombre de usuario ya existe");
        }
        
        TablaUsuarios usuario = new TablaUsuarios(username, email, contrasenya);
        return usuariosRepository.save(usuario);
    }
    
    /**
     * Obtener usuario por ID
     */
    public Optional<TablaUsuarios> obtenerUsuarioPorId(Integer id) {
        return usuariosRepository.findUsuarioById(id);
    }
    
    /**
     * Obtener usuario por email
     */
    public Optional<TablaUsuarios> obtenerUsuarioPorEmail(String email) {
        return usuariosRepository.findUsuarioByEmail(email);
    }
    
    /**
     * Obtener todos los usuarios
     */
    public List<TablaUsuarios> obtenerTodosUsuarios() {
        return usuariosRepository.findAll();
    }
    
    /**
     * Buscar usuarios por nombre
     */
    public List<TablaUsuarios> buscarUsuariosPorNombre(String nombre) {
        return usuariosRepository.searchByUsername(nombre);
    }
    
    /**
     * Contar total de usuarios
     */
    public long contarTotalUsuarios() {
        return usuariosRepository.countUsuarios();
    }
    
    /**
     * Actualizar datos de usuario
     */
    public TablaUsuarios actualizarUsuarioFrontend(Integer id, String username, String email) {
        Optional<TablaUsuarios> usuarioOpt = obtenerUsuarioPorId(id);
        
        if (usuarioOpt.isPresent()) {
            TablaUsuarios usuario = usuarioOpt.get();
            
            // Verificar si el nuevo email ya existe (si es diferente)
            if (!usuario.getEmail().equalsIgnoreCase(email) && existeEmail(email)) {
                throw new RuntimeException("El nuevo email ya está registrado");
            }
            
            // Verificar si el nuevo username ya existe (si es diferente)
            if (!usuario.getUsername().equalsIgnoreCase(username) && existeUsername(username)) {
                throw new RuntimeException("El nuevo nombre de usuario ya existe");
            }
            
            usuario.setUsername(username);
            usuario.setEmail(email);
            
            return usuariosRepository.save(usuario);
        }
        
        throw new RuntimeException("Usuario no encontrado");
    }
    
    /**
     * Cambiar contraseña desde frontend
     */
    public boolean cambiarContrasenyaFrontend(Integer id, String nuevaContrasenya) {
        Optional<TablaUsuarios> usuarioOpt = obtenerUsuarioPorId(id);
        
        if (usuarioOpt.isPresent()) {
            TablaUsuarios usuario = usuarioOpt.get();
            usuario.setContrasenya(nuevaContrasenya);
            usuariosRepository.save(usuario);
            return true;
        }
        
        return false;
    }
    
    /**
     * Eliminar usuario
     */
    public boolean eliminarUsuario(Integer id) {
        if (usuariosRepository.existsById(id)) {
            usuariosRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // =============== MÉTODO MENÚ ===============
    
    public void menuUsuarios() {
        int opcion = -1;
        
        while (opcion != 0) {
            System.out.println("\n═══════════════════════════════════");
            System.out.println("        MENÚ DE USUARIOS");
            System.out.println("═══════════════════════════════════");
            System.out.println("1. Crear usuario");
            System.out.println("2. Listar usuarios");
            System.out.println("3. Buscar por email");
            System.out.println("4. Buscar por ID");
            System.out.println("5. Actualizar usuario");
            System.out.println("6. Cambiar contraseña");
            System.out.println("7. Ver estadísticas");
            System.out.println("8. Buscar por nombre");
            System.out.println("9. Eliminar usuario");
            System.out.println("0. Salir");
            System.out.print("Selecciona una opción: ");
            
            try {
                opcion = sc.nextInt();
                sc.nextLine(); // Limpiar buffer
                
                switch (opcion) {
                    case 1:
                        crearUsuario();
                        break;
                    case 2:
                        listarUsuarios();
                        break;
                    case 3:
                        buscarUsuarioPorEmail();
                        break;
                    case 4:
                        buscarUsuarioPorId();
                        break;
                    case 5:
                        actualizarUsuario();
                        break;
                    case 6:
                        cambiarContrasenya();
                        break;
                    case 7:
                        mostrarEstadisticas();
                        break;
                    case 8:
                        buscarPorNombre();
                        break;
                    case 9:
                        eliminarUsuarioConsola();
                        break;
                    case 0:
                        System.out.println("Saliendo del menú de usuarios...");
                        break;
                    default:
                        System.out.println("Opción no válida.");
                }
            } catch (Exception e) {
                System.out.println("Error: " + e.getMessage());
                sc.nextLine(); // Limpiar buffer en caso de error
            }
        }
    }
    
    // =============== MÉTODOS AUXILIARES ===============
    
    private void mostrarEstadisticas() {
        long total = contarTotalUsuarios();
        System.out.println("\n=== ESTADÍSTICAS ===");
        System.out.println("Total de usuarios: " + total);
        
        if (total > 0) {
            List<TablaUsuarios> usuarios = usuariosRepository.findAll();
            System.out.println("\nÚltimos 3 usuarios registrados:");
            int inicio = Math.max(0, usuarios.size() - 3);
            for (int i = inicio; i < usuarios.size(); i++) {
                TablaUsuarios u = usuarios.get(i);
                System.out.println("• " + u.getUsername() + " (" + u.getEmail() + ")");
            }
        }
    }
    
    private void buscarPorNombre() {
        System.out.print("\nIntroduce el nombre a buscar: ");
        String nombre = sc.nextLine();
        
        List<TablaUsuarios> resultados = buscarUsuariosPorNombre(nombre);
        
        if (resultados.isEmpty()) {
            System.out.println("No se encontraron usuarios con ese nombre.");
        } else {
            System.out.println("\nResultados (" + resultados.size() + "):");
            for (TablaUsuarios usuario : resultados) {
                System.out.println("ID: " + usuario.getIdUsuario() + 
                                 " | Username: " + usuario.getUsername() + 
                                 " | Email: " + usuario.getEmail());
            }
        }
    }
    
    private void eliminarUsuarioConsola() {
        System.out.print("\nIntroduce el ID del usuario a eliminar: ");
        int id = sc.nextInt();
        sc.nextLine();
        
        System.out.print("¿Estás seguro? (s/n): ");
        String confirmacion = sc.nextLine().toLowerCase();
        
        if (confirmacion.equals("s")) {
            boolean eliminado = eliminarUsuario(id);
            if (eliminado) {
                System.out.println("✓ Usuario eliminado correctamente.");
            } else {
                System.out.println("✗ No se encontró el usuario con ID: " + id);
            }
        } else {
            System.out.println("Operación cancelada.");
        }
    }
}