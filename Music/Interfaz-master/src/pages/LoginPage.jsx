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

  // Función para obtener el perfil y guardarlo en localStorage
  const getAndStoreProfile = async (userId) => {
    // Usamos maybeSingle() para evitar el error "Cannot coerce..."
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, balance, lives')
      .eq('id', userId)
      .maybeSingle(); 

    if (error) throw new Error("Error al cargar perfil: " + error.message);

    // Si encontramos el perfil, lo guardamos en el Local Storage
    if (profile) {
        localStorage.setItem("ra_user", JSON.stringify(profile));
    }
    
    // Retornamos el perfil (puede ser null si no se encuentra)
    return profile;
  }

  // Manejador principal para Login y Registro
  async function handleAuth(e) {
    e?.preventDefault();
    setLoading(true);

    if (isRegister) {
        // --- REGISTRO REAL DE SUPABASE ---
        try {
            if (!username) throw new Error("Debes ingresar un nombre de entrenador.");

            // 1. Registro de usuario en Auth (auth.users)
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            
            const user = data.user;

            // 🔑 AJUSTE CRUCIAL RLS: Esperar a que Supabase actualice el token JWT
            // Esto asegura que auth.uid() sea reconocido inmediatamente en el siguiente INSERT.
            const { error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError; 
            
            // 2. Insertar el perfil inicial en la tabla 'profiles'
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    { 
                        id: user.id, 
                        username: username, 
                        balance: 1000, 
                        lives: 3 
                    }
                ]);

            if (profileError) {
                // Si llegamos aquí, es un error de RLS o de DUPLICADO (UNIQUE constraint)
                alert("Error al guardar perfil. El nombre de usuario '" + username + "' ya existe o la política de seguridad (RLS) falló. Detalle: " + profileError.message);
                
                // Opción: Desloguear si falla la creación del perfil.
                await supabase.auth.signOut(); 
                setLoading(false);
                return;
            }

            // 3. Cargar y almacenar el perfil recién creado
            await getAndStoreProfile(user.id);

            alert("Registro exitoso! Revisa tu email para verificar la cuenta (si tienes habilitada la verificación).");
            navigate("/groups");

        } catch (error) {
            alert(error.message);
        }

    } else {
        // --- LOGIN REAL DE SUPABASE (Crea perfil si falta) ---
        try {
            // 1. Iniciar sesión en Auth
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            
            const userId = data.user.id;
            
            // 2. Intentar cargar el perfil
            let profile = await getAndStoreProfile(userId);
            
            // 3. CORRECCIÓN: Si el perfil no existe, lo creamos.
            if (!profile) {
                
                // Pedimos el nombre de usuario faltante
                const newUsername = prompt("Tu perfil de entrenador no existe. Por favor, introduce tu nombre de entrenador (username) para crearlo:");

                if (!newUsername || newUsername.trim() === "") {
                    throw new Error("Nombre de usuario requerido para crear el perfil. Por favor, vuelve a intentar.");
                }

                // Insertamos el perfil con el username proporcionado
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        { 
                            id: userId, 
                            username: newUsername.trim(), 
                            balance: 1000, 
                            lives: 3 
                        }
                    ]);
                
                if (profileError) {
                    throw new Error("Error al crear perfil con username: " + profileError.message);
                }
                
                // Cargar el perfil recién creado (para guardarlo en localStorage)
                profile = await getAndStoreProfile(userId);
            }
            
            alert("¡Inicio de sesión exitoso!");
            navigate("/groups");

        } catch (error) {
            alert(error.message);
        }
    }

    setLoading(false);
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
                disabled={loading}
            >
                Iniciar Sesión
            </button>
            <button 
                onClick={() => setIsRegister(true)}
                className={`px-4 py-2 text-sm font-semibold transition-all duration-300 ${isRegister ? 'bg-purple-700 rounded-r-lg' : 'bg-white/10 text-white/70 rounded-r-lg'}`}
                disabled={loading}
            >
                Registrarse
            </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Campo de Nombre de Usuario (Solo para registro) */}
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

          {/* Campo de Email */}
          <input
            type="email"
            className="w-full px-4 py-3 rounded-md text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-300"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          
          {/* Campo de Contraseña */}
          <input
            type="password"
            className="w-full px-4 py-3 rounded-md text-black focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-300"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          {/* Botón de Autenticación */}
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
            {loading ? 'Cargando...' : isRegister ? 'Registro y Acceso' : 'Entrar al Reto'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-white/70">
            {isRegister ? 'Usaremos tu email para la autenticación.' : 'Si no tienes cuenta, regístrate arriba.'}
        </p>
      </div>
    </div>
  );
}