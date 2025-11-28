import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserGroupContext } from '../contexts/UserGroupContext';
import { supabase } from '../supabaseClient';

export default function TopBar({ user, group, onMobileMenuToggle, isMobileMenuOpen }) {
  const { groupMembers } = useContext(UserGroupContext);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar perfil del usuario desde la tabla profiles
  const loadUserProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Cargando perfil para usuario:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, display_name, updated_at')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error cargando perfil:', error);
        // Si no existe, crear un perfil básico
        await createInitialProfile();
      } else {
        console.log('✅ Perfil cargado:', data);
        setUserProfile(data);
      }
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInitialProfile = async () => {
    try {
      const profileData = {
        id: user.id,
        username: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
        display_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
        avatar_url: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (!error && data) {
        console.log('✅ Perfil inicial creado:', data);
        setUserProfile(data);
      }
    } catch (error) {
      console.error('❌ Error creando perfil inicial:', error);
    }
  };

  // Cargar perfil al montar el componente
  useEffect(() => {
    loadUserProfile();
  }, [user?.id]);

  // Escuchar cambios en tiempo real en la tabla profiles
  useEffect(() => {
    if (!user?.id) return;

    console.log('📡 Suscribiéndose a cambios de perfil para:', user.id);

    const subscription = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Cambio detectado en perfil:', payload);
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setUserProfile(payload.new);
            console.log('✅ TopBar actualizado con nuevos datos:', payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado de suscripción:', status);
      });

    return () => {
      console.log('🔴 Desuscribiéndose de cambios de perfil');
      subscription.unsubscribe();
    };
  }, [user?.id]);

  // También recargar el perfil cuando volvemos a la página (por si acaso)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Página visible, recargando perfil...');
        loadUserProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Navegar a Settings al hacer clic en la foto de perfil
  const handleAvatarClick = () => {
    navigate('/dashboard/settings');
  };

  // Calcular estadísticas rápidas
  const userStats = groupMembers.find(member => member.user_id === user?.id);
  const totalMembers = groupMembers.length;
  const totalLives = groupMembers.reduce((sum, member) => sum + (member.lives || 0), 0);

  // Obtener avatar y nombre desde el perfil de la base de datos
  const userAvatar = userProfile?.avatar_url || 
                    user?.user_metadata?.avatar_url || 
                    user?.user_metadata?.picture || 
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";

  const userName = userProfile?.username ||
                  userProfile?.display_name ||
                  user?.user_metadata?.username || 
                  user?.user_metadata?.full_name || 
                  user?.user_metadata?.name ||
                  user?.email?.split('@')[0] || 
                  'Usuario';

  // DEBUG: Ver qué datos tenemos
  console.log('=== TOPBAR DEBUG ===');
  console.log('User:', user);
  console.log('UserProfile:', userProfile);
  console.log('Avatar URL:', userAvatar);
  console.log('Username:', userName);
  console.log('Última actualización:', userProfile?.updated_at);
  console.log('====================');

  if (loading) {
    return (
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-gradient-to-r from-pink-700 to-purple-900 rounded-b-2xl shadow-2xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition duration-200"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 animate-pulse"></div>
          <div>
            <div className="h-4 w-24 bg-white/20 rounded animate-pulse mb-2"></div>
            <div className="h-3 w-16 bg-white/10 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="w-20 h-8 bg-white/10 rounded animate-pulse"></div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-gradient-to-r from-pink-700 to-purple-900 rounded-b-2xl shadow-2xl">
      {/* Foto de perfil y nombre de usuario */}
      <div className="flex items-center gap-3">
        {/* Botón menú hamburguesa para móvil */}
        <button 
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition duration-200"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
        
        {/* Foto de perfil del usuario - CLICKABLE */}
        <button 
          onClick={handleAvatarClick}
          className="relative group transition-transform duration-300 hover:scale-110 active:scale-95"
          title="Ir a Configuración"
        >
          <img 
            src={userAvatar}
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 p-1 border-2 border-pink-400 object-cover transition-all duration-300 group-hover:border-pink-300 group-hover:shadow-lg" 
            alt="Avatar"
            onError={(e) => {
              console.log('❌ Error cargando avatar, usando fallback');
              e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";
            }}
            key={userAvatar} // Force re-render when avatar changes
          />
          {/* Efecto hover */}
          <div className="absolute inset-0 rounded-full bg-pink-400/0 group-hover:bg-pink-400/20 transition-all duration-300 flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-bold">
              ⚙️
            </span>
          </div>
        </button>
        
        <div>
          {/* Nombre de usuario - TAMBIÉN CLICKABLE */}
          <button 
            onClick={handleAvatarClick}
            className="text-left group transition-all duration-300 hover:scale-105"
            title="Ir a Configuración"
          >
            <div className="font-extrabold text-lg lg:text-xl text-white group-hover:text-pink-300 transition-colors duration-300 flex items-center gap-1">
              {userName}
              <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">⚙️</span>
            </div>
          </button>
          <div className="text-xs lg:text-sm text-white/80">
            {group?.name || 'Sin grupo'} 
            {group && <span className="ml-1">({totalMembers})</span>}
          </div>
        </div>
      </div>

      {/* Información del usuario y estadísticas */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Estadísticas del grupo - Ocultas en móvil */}
        {group && (
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="text-green-400 font-bold text-lg">{totalLives}</div>
              <div className="text-white/60 text-xs">Vidas Totales</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold text-lg">{totalMembers}</div>
              <div className="text-white/60 text-xs">Jugadores</div>
            </div>
          </div>
        )}

        {/* Información del usuario */}
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <div className="text-white font-semibold text-sm lg:text-lg">{userName}</div>
            <div className="text-xs text-pink-300 flex gap-2 lg:gap-3">
              <span>₿{userStats?.balance || '0'}</span>
              <span>|</span>
              <span>❤️{userStats?.lives || '0'}/20</span>
            </div>
          </div>
          
          {/* Información compacta para móvil pequeño */}
          <div className="sm:hidden flex flex-col items-end">
            <div className="text-white font-semibold text-sm">{userName}</div>
            <div className="text-xs text-pink-300">
              ❤️{userStats?.lives || '0'}
            </div>
          </div>
          
          {/* Botón de salir */}
          <button 
            onClick={handleLogout} 
            className="px-3 py-2 lg:px-4 lg:py-2 rounded-full bg-white/20 hover:bg-white/30 transition duration-300 font-semibold shadow-md flex items-center gap-1 lg:gap-2 text-sm lg:text-base"
          >
            <span className="hidden sm:inline">Salir</span>
            <span className="sm:hidden">🚪</span>
            <svg className="w-4 h-4 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}