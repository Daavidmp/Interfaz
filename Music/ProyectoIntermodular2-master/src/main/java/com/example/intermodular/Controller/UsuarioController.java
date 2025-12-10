package com.example.intermodular.Controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.intermodular.Entity.TablaUsuarios;
import com.example.intermodular.Service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", 
                        "http://localhost:5500", "http://127.0.0.1:5500",
                        "http://localhost:8080", "http://127.0.0.1:8080"})
public class UsuarioController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    // ==================== ENDPOINTS PARA FRONTEND ====================
    
    /**
     * Login de usuario
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Validar datos de entrada
            if (loginRequest.getEmail() == null || loginRequest.getEmail().trim().isEmpty() ||
                loginRequest.getContrasenya() == null || loginRequest.getContrasenya().trim().isEmpty()) {
                
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Email y contraseña son requeridos");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Validar credenciales
            TablaUsuarios usuario = usuarioService.validarLogin(
                loginRequest.getEmail().trim(), 
                loginRequest.getContrasenya().trim()
            );
            
            if (usuario != null) {
                // Crear respuesta exitosa
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Login exitoso");
                response.put("user", crearUsuarioResponse(usuario));
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Credenciales incorrectas");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error en el servidor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Registro de nuevo usuario
     */
    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody RegistroRequest registroRequest) {
        try {
            // Validar datos de entrada
            if (registroRequest.getUsername() == null || registroRequest.getUsername().trim().isEmpty()) {
                return errorResponse("El nombre de usuario es requerido", HttpStatus.BAD_REQUEST);
            }
            
            if (registroRequest.getEmail() == null || registroRequest.getEmail().trim().isEmpty()) {
                return errorResponse("El email es requerido", HttpStatus.BAD_REQUEST);
            }
            
            if (registroRequest.getContrasenya() == null || registroRequest.getContrasenya().trim().isEmpty()) {
                return errorResponse("La contraseña es requerida", HttpStatus.BAD_REQUEST);
            }
            
            if (registroRequest.getConfirmarContrasenya() == null || registroRequest.getConfirmarContrasenya().trim().isEmpty()) {
                return errorResponse("Debes confirmar la contraseña", HttpStatus.BAD_REQUEST);
            }
            
            String username = registroRequest.getUsername().trim();
            String email = registroRequest.getEmail().trim();
            String contrasenya = registroRequest.getContrasenya().trim();
            String confirmarContrasenya = registroRequest.getConfirmarContrasenya().trim();
            
            // Validar que las contraseñas coincidan
            if (!contrasenya.equals(confirmarContrasenya)) {
                return errorResponse("Las contraseñas no coinciden", HttpStatus.BAD_REQUEST);
            }
            
            // Validar longitud de contraseña
            if (contrasenya.length() < 6) {
                return errorResponse("La contraseña debe tener al menos 6 caracteres", HttpStatus.BAD_REQUEST);
            }
            
            // Verificar si el email ya existe
            if (usuarioService.existeEmail(email)) {
                return errorResponse("El email ya está registrado", HttpStatus.BAD_REQUEST);
            }
            
            // Verificar si el username ya existe
            if (usuarioService.existeUsername(username)) {
                return errorResponse("El nombre de usuario ya existe", HttpStatus.BAD_REQUEST);
            }
            
            // Crear usuario
            TablaUsuarios nuevoUsuario = usuarioService.crearUsuarioFrontend(username, email, contrasenya);
            
            // Crear respuesta exitosa
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Usuario registrado exitosamente");
            response.put("user", crearUsuarioResponse(nuevoUsuario));
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            return errorResponse(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return errorResponse("Error en el servidor: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Obtener usuario por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUsuarioById(@PathVariable Integer id) {
        try {
            Optional<TablaUsuarios> usuarioOpt = usuarioService.obtenerUsuarioPorId(id);
            
            if (usuarioOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("user", crearUsuarioResponse(usuarioOpt.get()));
                return ResponseEntity.ok(response);
            } else {
                return errorResponse("Usuario no encontrado", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return errorResponse("Error en el servidor: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Obtener usuario por email
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getUsuarioByEmail(@PathVariable String email) {
        try {
            Optional<TablaUsuarios> usuarioOpt = usuarioService.obtenerUsuarioPorEmail(email);
            
            if (usuarioOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("user", crearUsuarioResponse(usuarioOpt.get()));
                return ResponseEntity.ok(response);
            } else {
                return errorResponse("Usuario no encontrado", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return errorResponse("Error en el servidor: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Obtener todos los usuarios
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsuarios() {
        try {
            var usuarios = usuarioService.obtenerTodosUsuarios();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("total", usuarios.size());
            response.put("usuarios", usuarios.stream()
                .map(this::crearUsuarioResponse)
                .toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse("Error en el servidor: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Contar total de usuarios
     */
    @GetMapping("/count")
    public ResponseEntity<?> countUsuarios() {
        try {
            long total = usuarioService.contarTotalUsuarios();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("total", total);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse("Error en el servidor: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Buscar usuarios por nombre
     */
    @GetMapping("/buscar/{nombre}")
    public ResponseEntity<?> buscarUsuarios(@PathVariable String nombre) {
        try {
            var usuarios = usuarioService.buscarUsuariosPorNombre(nombre);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("total", usuarios.size());
            response.put("usuarios", usuarios.stream()
                .map(this::crearUsuarioResponse)
                .toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse("Error en el servidor: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Endpoint de prueba
     */
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "API de usuarios funcionando correctamente");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
    
    // ==================== MÉTODOS AUXILIARES ====================
    
    /**
     * Crear respuesta de usuario (sin contraseña)
     */
    private Map<String, Object> crearUsuarioResponse(TablaUsuarios usuario) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", usuario.getIdUsuario());
        userResponse.put("username", usuario.getUsername());
        userResponse.put("email", usuario.getEmail());
        userResponse.put("fechaRegistro", "2023-01-01"); // Puedes agregar este campo a la entidad
        return userResponse;
    }
    
    /**
     * Crear respuesta de error
     */
    private ResponseEntity<Map<String, Object>> errorResponse(String message, HttpStatus status) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", message);
        return ResponseEntity.status(status).body(error);
    }
    
    // ==================== CLASES INTERNAS PARA REQUESTS ====================
    
    /**
     * Clase para request de login
     */
    public static class LoginRequest {
        private String email;
        private String contrasenya;
        
        // Getters y Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getContrasenya() { return contrasenya; }
        public void setContrasenya(String contrasenya) { this.contrasenya = contrasenya; }
    }
    
    /**
     * Clase para request de registro
     */
    public static class RegistroRequest {
        private String username;
        private String email;
        private String contrasenya;
        private String confirmarContrasenya;
        
        // Getters y Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getContrasenya() { return contrasenya; }
        public void setContrasenya(String contrasenya) { this.contrasenya = contrasenya; }
        public String getConfirmarContrasenya() { return confirmarContrasenya; }
        public void setConfirmarContrasenya(String confirmarContrasenya) { this.confirmarContrasenya = confirmarContrasenya; }
    }
}