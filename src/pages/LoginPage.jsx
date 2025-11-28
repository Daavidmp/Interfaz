import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../supabaseClient'; 

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false); 
  const navigate = useNavigate();

  // Función para guardar perfil en localStorage
  const saveProfileToStorage = (profile) => {
    localStorage.setItem("ra_user", JSON.stringify(profile));
    console.log("Perfil guardado en localStorage:", profile);
  };

  // Función RPC para crear perfil (MÉTODO PRINCIPAL)
  const createProfileRPC = async (userId, username) => {
    console.log("Creando perfil via RPC para usuario:", userId);
    
    const { data, error } = await supabase.rpc('create_user_profile_safe', {
      p_user_id: userId,
      p_username: username.trim(),
      p_balance: 1000,
      p_lives: 3
    });

    if (error) {
      console.error("Error RPC:", error);
      throw new Error(`Error del servidor: ${error.message}`);
    }

    if (data?.error) {
      throw new Error(data.message);
    }

    console.log("Perfil creado via RPC:", data.profile);
    return data.profile;
  };

  // Manejador de REGISTRO SIMPLIFICADO
  const handleRegister = async () => {
    if (!username.trim()) {
      throw new Error("Debes ingresar un nombre de entrenador.");
    }

    // 1. Registrar usuario en Auth
    console.log("Registrando usuario en Auth...");
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password
    });
    
    if (authError) throw authError;
    
    const user = authData.user;
    if (!user) throw new Error("Error al crear usuario");

    console.log("✅ Usuario auth creado:", user.id);

    // 2. Pequeña espera para estabilizar la sesión
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Crear perfil usando RPC (MÉTODO CONFIABLE)
    console.log("🔄 Creando perfil via RPC...");
    const profile = await createProfileRPC(user.id, username);

    // 4. Guardar perfil en localStorage
    saveProfileToStorage(profile);

    console.log("✅ Registro completado exitosamente");
    return user;
  };

  // Manejador de LOGIN SIMPLIFICADO
  const handleLogin = async () => {
    console.log("Iniciando sesión...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (authError) throw authError;
    
    const userId = authData.user.id;
    console.log("✅ Sesión auth iniciada:", userId);
    
    // Obtener perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Error cargando perfil:", profileError);
      throw new Error("Error al cargar el perfil: " + profileError.message);
    }

    if (profile) {
      saveProfileToStorage(profile);
      console.log("✅ Perfil cargado:", profile);
      return profile;
    } else {
      throw new Error("No se encontró el perfil del usuario.");
    }
  };

  // Manejador principal
  async function handleAuth(e) {
    e?.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        await handleRegister();
        alert("🎉 ¡Registro exitoso!\n\nSe ha enviado un email de confirmación a tu correo.\n\nYa puedes iniciar sesión con tus credenciales.");
        
        // Limpiar formulario y cambiar a login
        setIsRegister(false);
        setEmail("");
        setPassword("");
        setUsername("");
      } else {
        await handleLogin();
        alert("✅ ¡Inicio de sesión exitoso!");
        navigate("/groups");
      }
    } catch (error) {
      console.error("❌ Error completo:", error);
      alert("❌ " + error.message);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 to-pink-900 text-white p-6">
      <div className="w-full max-w-md bg-white/6 p-8 rounded-2xl card-glass shadow-2xl overflow-hidden">
        <h1 className="text-4xl font-extrabold mb-6 text-center text-pink-300 animate-pulse">
            ⚔️ Interfaz Pokemon
        </h1>
        
        <div className="flex justify-center mb-6">
            <button 
                onClick={() => setIsRegister(false)}
                className={`px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                    !isRegister ? 'bg-pink-600 rounded-l-lg' : 'bg-white/10 text-white/70 rounded-l-lg'
                }`}
                disabled={loading}
            >
                Iniciar Sesión
            </button>
            <button 
                onClick={() => setIsRegister(true)}
                className={`px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                    isRegister ? 'bg-purple-700 rounded-r-lg' : 'bg-white/10 text-white/70 rounded-r-lg'
                }`}
                disabled={loading}
            >
                Registrarse
            </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegister && (
             <input
                className="w-full px-4 py-3 rounded-md text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-300"
                placeholder="Nombre de entrenador (Username)"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                disabled={loading}
            />
          )}

          <input
            type="email"
            className="w-full px-4 py-3 rounded-md text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-300"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          
          <input
            type="password"
            className="w-full px-4 py-3 rounded-md text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-300"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <button 
            type="submit" 
            className={`w-full py-3 rounded-md font-semibold transition-all duration-500 ease-in-out 
                ${isRegister 
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-700 hover:from-purple-700 hover:to-fuchsia-800'
                    : 'bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800'
                } 
                transform hover:scale-[1.02] disabled:opacity-50`}
            disabled={loading}
          >
            {loading ? '🔄 Cargando...' : isRegister ? '🎮 Crear Cuenta' : '⚔️ Entrar al Reto'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-white/70">
            {isRegister 
              ? '📧 Se enviará un email de confirmación a tu correo.' 
              : '¿Nuevo en el reto? Regístrate arriba 🚀'}
        </p>
      </div>
    </div>
  );
}