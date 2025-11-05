import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [isRegister, setIsRegister] = useState(false); // Nuevo: alternar entre Login/Registro
  const navigate = useNavigate();

  // Función simulada de Base de Datos para verificar/obtener usuario
  function getStoredUser(name) {
    const id = name.toLowerCase().replace(/\s+/g, "_");
    // Simulación: Comprobar si el usuario ya existe en una lista global (en un proyecto real, se consultaría la DB)
    const storedUsers = JSON.parse(localStorage.getItem("ra_users_all") || "[]");
    return storedUsers.find(u => u.id === id);
  }

  // Función simulada de Base de Datos para guardar nuevo usuario
  function storeNewUser(user) {
    const storedUsers = JSON.parse(localStorage.getItem("ra_users_all") || "[]");
    localStorage.setItem("ra_users_all", JSON.stringify([...storedUsers, user]));
  }

  function handleAuth(e) {
    e?.preventDefault();
    const name = (username || "").trim();
    if (!name) return alert("Introduce un nombre válido");
    
    const existingUser = getStoredUser(name);

    if (isRegister) {
      // Proceso de REGISTRO
      if (existingUser) {
        alert("El usuario ya existe. ¡Inicia sesión!");
        setIsRegister(false); // Cambia a login automáticamente
        return;
      }
      const newUser = { id: name.toLowerCase().replace(/\s+/g, "_"), username: name, balance: 1000, lives: 3 };
      storeNewUser(newUser); // Simula guardar en DB
      localStorage.setItem("ra_user", JSON.stringify(newUser));
      navigate("/groups");

    } else {
      // Proceso de LOGIN
      if (!existingUser) {
        // Obliga a registrarse si no existe
        alert("Usuario no encontrado. Por favor, regístrate.");
        setIsRegister(true); 
        return;
      }
      // Usuario encontrado, inicia sesión
      localStorage.setItem("ra_user", JSON.stringify(existingUser));
      navigate("/groups");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 to-pink-900 text-white p-6">
      <div className="w-full max-w-md bg-white/6 p-8 rounded-2xl card-glass shadow-2xl overflow-hidden">
        <h1 className="text-4xl font-extrabold mb-6 text-center text-pink-300 animate-pulse">
            ⚔️ Reto Añil
        </h1>
        
        {/* Toggle con Animación */}
        <div className="flex justify-center mb-6">
            <button 
                onClick={() => setIsRegister(false)}
                className={`px-4 py-2 text-sm font-semibold transition-all duration-300 ${!isRegister ? 'bg-pink-600 rounded-l-lg' : 'bg-white/10 text-white/70 rounded-l-lg'}`}
            >
                Iniciar Sesión
            </button>
            <button 
                onClick={() => setIsRegister(true)}
                className={`px-4 py-2 text-sm font-semibold transition-all duration-300 ${isRegister ? 'bg-purple-700 rounded-r-lg' : 'bg-white/10 text-white/70 rounded-r-lg'}`}
            >
                Registrarse
            </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
              <input
                className="w-full px-4 py-3 rounded-md text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-300"
                placeholder="Tu nombre de entrenador"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              {/* Animación: Indicador de input */}
              <span className="absolute left-0 top-0 h-full w-1 rounded-l-md bg-pink-500 transition-all duration-500 ease-in-out"></span>
          </div>

          {/* Animación de entrada para el botón */}
          <button 
            type="submit" 
            className={`w-full py-3 rounded-md font-semibold transition-all duration-500 ease-in-out 
                ${isRegister 
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-700 hover:from-purple-700 hover:to-fuchsia-800'
                    : 'bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800'
                } 
                transform hover:scale-[1.02]`}
          >
            {isRegister ? 'Registro y Acceso' : 'Entrar al Reto'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-white/70">
            {isRegister ? 'Tu cuenta se creará y se guardará.' : 'Si no tienes cuenta, se te pedirá registrarte.'}
        </p>
      </div>
    </div>
  );
}

