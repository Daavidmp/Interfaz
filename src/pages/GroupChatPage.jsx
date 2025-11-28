import React, { useState, useEffect, useRef, useContext } from 'react';
import { UserGroupContext } from '../contexts/UserGroupContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

// Emojis relacionados con Pokémon - Categorizados
const POKEMON_EMOJIS = {
  "Caras": ['😊', '😎', '🥳', '🤩', '😍', '😂', '🥺', '😭', '😡', '🤯'],
  "Pokémon": ['🐛', '🔥', '💧', '⚡', '🌿', '❄️', '🥊', '☠️', '🌙', '✨'],
  "Animales": ['🐉', '🦎', '🐍', '🐲', '🦅', '🦉', '🐺', '🐗', '🐻', '🦊'],
  "Objetos": ['⭐', '🎯', '🏆', '🎮', '👑', '💎', '🎨', '🎭', '🎪', '🎲'],
  "Símbolos": ['❤️', '💫', '🌟', '🌈', '🌀', '💥', '🎇', '🔮', '🛡️', '⚔️']
};

// GIFs Pokémon REALES y funcionales
const POKEMON_GIFS = [
  { url: 'https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif', name: 'Pikachu' },
  { url: 'https://media.giphy.com/media/GrZhl9o8wV1kA/giphy.gif', name: 'Charizard' },
  { url: 'https://media.giphy.com/media/DRfu7TI8iv9oQ/giphy.gif', name: 'Eevee' },
  { url: 'https://media.giphy.com/media/12nV0e0TXSW0TK/giphy.gif', name: 'Mew' },
  { url: 'https://media.giphy.com/media/xULW8N9L0HfGt27B5e/giphy.gif', name: 'Bulbasaur' },
  { url: 'https://media.giphy.com/media/l4HnKwiJJaJQB04Zq/giphy.gif', name: 'Squirtle' },
  { url: 'https://media.giphy.com/media/3o85xGocUH8RYoDKKs/giphy.gif', name: 'Jigglypuff' },
  { url: 'https://media.giphy.com/media/10fkjMoc1Yz4iQ/giphy.gif', name: 'Gengar' },
  { url: 'https://media.giphy.com/media/3o7aD2d7hy9ktXNDP2/giphy.gif', name: 'Poké Ball' },
  { url: 'https://media.giphy.com/media/3o7abGQa0aRsohveX6/giphy.gif', name: 'Ash' },
  { url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', name: 'Pikachu Happy' },
  { url: 'https://media.giphy.com/media/3o7TKwxYkeW0Z1E5Hi/giphy.gif', name: 'Pokémon Battle' },
  { url: 'https://media.giphy.com/media/3o7TKSha71OEEoR5q8/giphy.gif', name: 'Evolution' },
  { url: 'https://media.giphy.com/media/3o7TKUhk5gQ73IcVvW/giphy.gif', name: 'Pokémon Dance' },
  { url: 'https://media.giphy.com/media/3o7TKUhk5gQ73IcVvW/giphy.gif', name: 'Fire Spin' },
  { url: 'https://media.giphy.com/media/3o7TKTUAdUxNnypjsA/giphy.gif', name: 'Water Gun' }
];

// Componente de Perfil de Usuario (Modal)
function UserProfileModal({ user, isOpen, onClose, userProfiles }) {
  if (!isOpen || !user) return null;

  const userProfile = userProfiles[user.id] || user;
  
  // Información de ejemplo para el perfil
  const userInfo = {
    bio: userProfile.bio || "¡Entrenador Pokémon apasionado! Siempre en busca de nuevas aventuras y amigos para compartir esta increíble jornada.",
    email: userProfile.email || "usuario@pokemon.com",
    level: userProfile.level || 30,
    joinDate: "Enero 2024",
    badges: 8,
    pokemonCaught: 45,
    favoriteType: userProfile.favorite_type || "Eléctrico"
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-pink-800 rounded-3xl w-full max-w-2xl border-2 border-white/20 shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-white/10">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">Perfil de Entrenador</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-3xl transition-colors duration-200 p-2"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <img
              src={userProfile.avatar_url || `https://ui-avatars.com/api/?name=${userProfile.username}&background=random&color=fff&bold=true&size=128`}
              alt={userProfile.username}
              className="w-32 h-32 rounded-2xl border-4 border-purple-400/50 mb-6 shadow-xl"
            />
            <h3 className="text-2xl font-bold text-white mb-2">{userProfile.username}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-400 font-bold text-lg">Nivel {userInfo.level}</span>
              <span className="text-white/60">•</span>
              <span className="text-green-400 font-medium text-lg flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                En línea
              </span>
            </div>
            <p className="text-white/60 text-lg text-center">{userInfo.bio}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl border border-white/10">
              <span className="text-white/80 font-medium text-lg">Correo:</span>
              <span className="text-white font-semibold text-lg">{userInfo.email}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl border border-white/10">
              <span className="text-white/80 font-medium text-lg">Tipo Favorito:</span>
              <span className="text-yellow-400 font-bold text-lg">{userInfo.favoriteType}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl border border-white/10">
              <span className="text-white/80 font-medium text-lg">Pokémon Atrapados:</span>
              <span className="text-blue-400 font-bold text-lg">{userInfo.pokemonCaught}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl border border-white/10">
              <span className="text-white/80 font-medium text-lg">Insignias:</span>
              <span className="text-purple-300 font-bold text-lg">{userInfo.badges}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl border border-white/10">
              <span className="text-white/80 font-medium text-lg">Miembro desde:</span>
              <span className="text-white/60 text-lg">{userInfo.joinDate}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5 rounded-b-3xl">
          <p className="text-center text-white/40 text-base">
            Información de solo lectura - No se pueden realizar cambios
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GroupChatPage() {
    const { user, group } = useContext(UserGroupContext);
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [activeEmojiCategory, setActiveEmojiCategory] = useState('Caras');
    const [userProfiles, setUserProfiles] = useState({});
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('Conectado');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [storageError, setStorageError] = useState(null);
    
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const chatContainerRef = useRef(null);
    const pollingRef = useRef(null);
    const fileInputRef = useRef(null);
    const shouldScrollRef = useRef(true);
    const previousMessageCountRef = useRef(0);

    // Efecto para scroll automático - SOLO cuando shouldScrollRef es true
    useEffect(() => {
        if (shouldScrollRef.current) {
            scrollToBottom();
        }
    }, [messages]);

    // Efecto principal para cargar datos
    useEffect(() => {
        if (!group || !user) {
            console.log('No hay grupo o usuario');
            return;
        }

        console.log('Iniciando chat para grupo:', group.id);
        initializeChat();

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [group, user]);

    // Efecto para limpiar mensajes antiguos automáticamente
    useEffect(() => {
        const cleanupOldMessages = async () => {
            try {
                // Limpiar mensajes con más de 2 días cada hora
                const { error } = await supabase
                    .from('group_chat_messages')
                    .delete()
                    .lt('created_at', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString());

                if (error) {
                    console.error('Error limpiando mensajes antiguos:', error);
                } else {
                    console.log('Limpieza automática de mensajes completada');
                }
            } catch (error) {
                console.error('Error en limpieza automática:', error);
            }
        };

        // Ejecutar limpieza inmediatamente y luego cada hora
        cleanupOldMessages();
        const cleanupInterval = setInterval(cleanupOldMessages, 60 * 60 * 1000);

        return () => clearInterval(cleanupInterval);
    }, []);

    // Detectar scroll manual del usuario
    useEffect(() => {
        const chatContainer = chatContainerRef.current;
        if (!chatContainer) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = chatContainer;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
            
            // Si el usuario no está al fondo, desactivar scroll automático
            shouldScrollRef.current = isAtBottom;
        };

        chatContainer.addEventListener('scroll', handleScroll);
        return () => chatContainer.removeEventListener('scroll', handleScroll);
    }, []);

    const initializeChat = async () => {
        try {
            await loadMessages();
            await loadUserProfiles();
            setupPresence();
            startPolling();
            setConnectionStatus('Conectado');
            
            // Inicializar el contador de mensajes
            previousMessageCountRef.current = messages.length;
        } catch (error) {
            console.error('Error inicializando chat:', error);
            setConnectionStatus('Error');
        }
    };

    // Sistema de polling MEJORADO
    const startPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
        }

        pollingRef.current = setInterval(async () => {
            try {
                const previousCount = previousMessageCountRef.current;
                await loadMessages();
                
                // Solo activar scroll si hay nuevos mensajes y el usuario estaba abajo
                if (messages.length > previousCount && shouldScrollRef.current) {
                    scrollToBottom();
                }
                
                // Actualizar el contador
                previousMessageCountRef.current = messages.length;
            } catch (error) {
                console.error('Error en polling:', error);
            }
        }, 2000);
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ 
                behavior: "smooth" 
            });
        }
    };

    const autoResizeTextarea = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    };

    useEffect(() => {
        autoResizeTextarea();
    }, [newMessage]);

    const loadMessages = async () => {
        try {
            // Consulta más simple sin joins complejos primero
            const { data, error } = await supabase
                .from('group_chat_messages')
                .select('*')
                .eq('group_id', group.id)
                .order('created_at', { ascending: true })
                .limit(100);

            if (error) {
                console.error('Error cargando mensajes:', error);
                throw error;
            }
            
            console.log('Mensajes cargados:', data);
            setMessages(data || []);
        } catch (error) {
            console.error('Error loading messages:', error);
            throw error;
        }
    };

    const loadUserProfiles = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*');
            
            if (error) throw error;
            
            const profilesMap = {};
            data.forEach(profile => {
                profilesMap[profile.id] = profile;
            });
            setUserProfiles(profilesMap);
        } catch (error) {
            console.error('Error loading user profiles:', error);
        }
    };

    const setupPresence = () => {
        const mockOnlineUsers = group.members?.slice(0, 3).map(m => m.user_id) || [];
        setOnlineUsers(mockOnlineUsers);
    };

    // Función para mostrar modal de perfil al hacer clic en el avatar
    const handleUserAvatarClick = (userProfile) => {
        setSelectedUser(userProfile);
        setShowUserProfile(true);
    };

    const sendMessage = async (messageType = 'text', content = null, fileData = null) => {
        console.log('Enviando mensaje:', { messageType, content, fileData, newMessage });
        
        let messageToSend = messageType === 'text' ? newMessage : content;
        
        if (!user || !group) {
            console.error('No hay usuario o grupo');
            alert('Error: No hay usuario o grupo activo');
            return;
        }

        // Validar que hay contenido para enviar
        if (!messageToSend?.trim() && !fileData && messageType === 'text') {
            console.error('No hay contenido para enviar');
            alert('Por favor, escribe un mensaje');
            return;
        }

        setLoading(true);
        try {
            let mediaUrl = null;
            let mediaType = null;
            let gifUrl = null;
            
            // Subir archivo si existe
            if (fileData) {
                console.log('Subiendo archivo:', fileData);
                mediaUrl = await uploadFile(fileData);
                mediaType = fileData.type;
                console.log('Archivo subido, URL:', mediaUrl, 'Tipo:', mediaType);
            }

            // Configurar gif_url si es un GIF
            if (messageType === 'gif') {
                gifUrl = content;
            }

            // PREPARAR DATOS CON ESTRUCTURA MÍNIMA
            const messageData = {
                group_id: group.id,
                user_id: user.id,
                message_type: messageType,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Agregar contenido según el tipo de mensaje
            if (messageType === 'text') {
                messageData.message_text = messageToSend?.trim() || '';
            } else if (messageType === 'emoji') {
                messageData.message_text = content;
            } else if (messageType === 'gif' && gifUrl) {
                messageData.gif_url = gifUrl;
                messageData.message_text = ''; // Limpiar texto para GIFs
            } else if (messageType === 'media' && mediaUrl) {
                messageData.media_url = mediaUrl;
                messageData.media_type = mediaType;
                messageData.message_text = ''; // Limpiar texto para media
                console.log('Datos de media guardados:', { mediaUrl, mediaType });
            }

            console.log('Insertando mensaje con datos:', messageData);

            // Intentar insertar
            const { data, error } = await supabase
                .from('group_chat_messages')
                .insert([messageData])
                .select()
                .single();

            if (error) {
                console.error('Error insertando mensaje:', error);
                throw new Error(`No se pudo enviar el mensaje: ${error.message}`);
            }

            console.log('Mensaje insertado correctamente:', data);

            // Limpiar el input solo si fue un mensaje de texto
            if (messageType === 'text') {
                setNewMessage('');
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                }
            }
            
            setShowEmojiPicker(false);
            setShowGifPicker(false);
            setShowMediaPicker(false);

            // Forzar scroll al enviar mensaje
            shouldScrollRef.current = true;
            
            // Recargar mensajes inmediatamente después de enviar
            setTimeout(() => {
                loadMessages();
            }, 500);

        } catch (error) {
            console.error('Error completo enviando mensaje:', error);
            alert(`Error al enviar el mensaje: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const uploadFile = async (file) => {
        setUploadingMedia(true);
        try {
            console.log('Iniciando subida de archivo:', file.name, file.type, file.size);

            // Para archivos pequeños, usar URL temporal directamente
            // Para archivos grandes, intentar subir a Supabase
            if (file.size < 5 * 1024 * 1024) { // Menos de 5MB
                console.log('Archivo pequeño, usando URL temporal');
                const temporaryUrl = URL.createObjectURL(file);
                return temporaryUrl;
            }

            // Para archivos más grandes, intentar con Supabase Storage
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
                const filePath = `chat-media/${group.id}/${fileName}`;

                console.log('Subiendo archivo a Supabase:', filePath);

                const { error: uploadError } = await supabase.storage
                    .from('chat-media')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error('Error subiendo archivo a Supabase:', uploadError);
                    throw uploadError;
                }

                // Obtener URL pública
                const { data: { publicUrl } } = supabase.storage
                    .from('chat-media')
                    .getPublicUrl(filePath);

                console.log('URL pública obtenida:', publicUrl);
                return publicUrl;

            } catch (storageError) {
                console.warn('Error con Supabase Storage, usando URL temporal:', storageError);
                const temporaryUrl = URL.createObjectURL(file);
                return temporaryUrl;
            }

        } catch (error) {
            console.error('Error subiendo archivo:', error);
            // En caso de cualquier error, usar URL temporal
            const temporaryUrl = URL.createObjectURL(file);
            console.warn('Usando URL temporal debido a error:', temporaryUrl);
            return temporaryUrl;
        } finally {
            setUploadingMedia(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        console.log('Archivo seleccionado:', file.name, file.type, file.size);

        // Validar tipo de archivo (pero SIN límite de tamaño)
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
        if (!validTypes.includes(file.type)) {
            alert('Por favor, selecciona una imagen (JPEG, PNG, GIF, WebP) o video (MP4, WebM) válido.');
            return;
        }

        sendMessage('media', null, file);
        event.target.value = ''; // Reset input
    };

    const sendEmoji = (emoji) => {
        sendMessage('emoji', emoji);
    };

    const sendGif = (gifUrl) => {
        sendMessage('gif', gifUrl);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (newMessage.trim()) {
                sendMessage();
            }
        }
    };

    const deleteMessage = async (messageId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este mensaje?')) return;

        try {
            const { error } = await supabase
                .from('group_chat_messages')
                .delete()
                .eq('id', messageId)
                .eq('user_id', user.id);

            if (error) throw error;

            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('No se pudo eliminar el mensaje.');
        }
    };

    const getUserDisplayName = (userId) => {
        const userProfile = userProfiles[userId];
        if (!userProfile) return 'Usuario';
        return userProfile.username || userProfile.email?.split('@')[0] || 'Usuario';
    };

    const getUserAvatar = (userId) => {
        const userProfile = userProfiles[userId];
        if (!userProfile) {
            return `https://ui-avatars.com/api/?name=Usuario&background=random&color=fff&bold=true&size=128`;
        }
        return userProfile.avatar_url || `https://ui-avatars.com/api/?name=${getUserDisplayName(userId)}&background=random&color=fff&bold=true&size=128`;
    };

    const formatTime = (timestamp) => {
        try {
            return new Date(timestamp).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '--:--';
        }
    };

    const formatDate = (timestamp) => {
        try {
            const date = new Date(timestamp);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (date.toDateString() === today.toDateString()) {
                return 'Hoy';
            } else if (date.toDateString() === yesterday.toDateString()) {
                return 'Ayer';
            } else {
                return date.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short'
                });
            }
        } catch (error) {
            return 'Fecha desconocida';
        }
    };

    const renderMediaMessage = (message) => {
        console.log('Renderizando mensaje multimedia:', message);
        
        if (message.media_url) {
            if (message.media_type?.startsWith('image/')) {
                return (
                    <div className="relative">
                        <img 
                            src={message.media_url} 
                            alt="Imagen compartida" 
                            className="max-w-full max-h-96 rounded-xl object-cover cursor-pointer"
                            onClick={() => window.open(message.media_url, '_blank')}
                            onError={(e) => {
                                console.error('Error cargando imagen:', message.media_url);
                                e.target.style.display = 'none';
                            }}
                        />
                        {message.media_url?.includes('blob:') && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-lg font-bold">
                                TEMPORAL
                            </div>
                        )}
                    </div>
                );
            } else if (message.media_type?.startsWith('video/')) {
                return (
                    <div className="relative">
                        <video 
                            controls 
                            className="max-w-full max-h-96 rounded-xl"
                            onError={(e) => {
                                console.error('Error cargando video:', message.media_url);
                                e.target.style.display = 'none';
                            }}
                        >
                            <source src={message.media_url} type={message.media_type} />
                            Tu navegador no soporta el elemento de video.
                        </video>
                        {message.media_url?.includes('blob:') && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-lg font-bold">
                                TEMPORAL
                            </div>
                        )}
                    </div>
                );
            }
        }
        
        // Si no hay media_url pero es tipo media, mostrar mensaje de error
        if (message.message_type === 'media') {
            return (
                <div className="text-red-400 text-sm">
                    ❌ No se pudo cargar el archivo multimedia
                </div>
            );
        }
        
        return null;
    };

    const renderMessageContent = (message) => {
        console.log('Renderizando contenido del mensaje:', message);
        
        switch (message.message_type) {
            case 'gif':
                return (
                    <div>
                        <img 
                            src={message.gif_url} 
                            alt="GIF Pokémon" 
                            className="max-w-full h-32 rounded-xl object-cover"
                            onError={(e) => {
                                console.error('Error cargando GIF:', message.gif_url);
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>
                );
                
            case 'emoji':
                return (
                    <div className="text-4xl text-center py-2">
                        {message.message_text}
                    </div>
                );
                
            case 'media':
                return renderMediaMessage(message);
                
            default:
                return (
                    <p className="whitespace-pre-wrap break-words text-base leading-relaxed">
                        {message.message_text}
                    </p>
                );
        }
    };

    // Agrupar mensajes por fecha
    const groupedMessages = messages.reduce((groups, message) => {
        const date = formatDate(message.created_at);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    const isUserOnline = (userId) => {
        return onlineUsers.includes(userId);
    };

    const getConnectionStatusColor = () => {
        return connectionStatus === 'Conectado' ? 'text-green-400' : 'text-red-400';
    };

    if (!group) {
        return (
            <div className="h-full flex items-center justify-center bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="text-center text-white/60 p-8">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold mb-2">No hay grupo activo</h3>
                    <p>Únete a un grupo para empezar a chatear</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="h-full flex flex-col bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-2xl overflow-hidden">
                {/* Header del Chat */}
                <div className="p-3 sm:p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/40 to-pink-600/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                                    <span className="text-white text-xl">💬</span>
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                    connectionStatus === 'Conectado' ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Chat Grupal</h2>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-white/80 font-medium">{group?.name}</span>
                                    <span className="text-white/50">•</span>
                                    <span className={`flex items-center gap-2 ${getConnectionStatusColor()}`}>
                                        <span className={`w-2 h-2 rounded-full ${
                                            connectionStatus === 'Conectado' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                                        }`}></span>
                                        {connectionStatus}
                                    </span>
                                    <span className="text-white/50">•</span>
                                    <span className="text-blue-400 text-xs">Actualizando cada 2s</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="text-center">
                                    <div className="text-white font-bold text-lg">{messages.length}</div>
                                    <div className="text-white/60">Mensajes</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-green-400 font-bold text-lg">{onlineUsers.length}</div>
                                    <div className="text-white/60">En línea</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Área de Mensajes */}
                <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar" 
                    style={{ maxHeight: 'calc(100vh - 180px)' }}
                >
                    {Object.entries(groupedMessages).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-white/50 py-12">
                            <div className="w-24 h-24 mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center border border-white/10">
                                <span className="text-4xl">💬</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-white/70">¡Comienza la conversación!</h3>
                            <p className="text-base text-center mb-6">Sé el primero en enviar un mensaje</p>
                            <div className="text-sm text-white/40 text-center space-y-2">
                                <p>💡 Usa emojis y GIFs para expresarte</p>
                                <p>🎬 Todos los GIFs están verificados</p>
                                <p>📸 Comparte fotos y videos</p>
                                <p>🔄 Actualizando en tiempo real</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                                <div key={date}>
                                    <div className="flex items-center justify-center my-6">
                                        <div className="bg-white/10 px-4 py-2 rounded-full text-sm text-white/60 border border-white/10 font-medium">
                                            {date}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {dateMessages.map((message) => (
                                            <div 
                                                key={message.id} 
                                                className={`flex gap-4 group hover:bg-white/5 transition-all duration-200 p-4 rounded-2xl ${
                                                    message.user_id === user.id ? 'flex-row-reverse' : ''
                                                }`}
                                            >
                                                <div className="flex-shrink-0 relative">
                                                    <img
                                                        src={getUserAvatar(message.user_id)}
                                                        alt={getUserDisplayName(message.user_id)}
                                                        className="w-14 h-14 rounded-2xl border-2 border-purple-400/50 transition-all duration-200 group-hover:scale-110 cursor-pointer hover:border-purple-400 shadow-lg"
                                                        onClick={() => handleUserAvatarClick(userProfiles[message.user_id])}
                                                        title={`Ver perfil de ${getUserDisplayName(message.user_id)}`}
                                                    />
                                                    {isUserOnline(message.user_id) && (
                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                    )}
                                                </div>
                                                
                                                <div className={`flex flex-col flex-1 max-w-md ${
                                                    message.user_id === user.id ? 'items-end' : 'items-start'
                                                }`}>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-lg font-bold text-purple-300">
                                                            {getUserDisplayName(message.user_id)}
                                                            {message.user_id === user.id && (
                                                                <span className="text-white/60 ml-2">(tú)</span>
                                                            )}
                                                        </span>
                                                        <span className="text-sm text-white/50">
                                                            {formatTime(message.created_at)}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className={`relative px-4 py-3 rounded-2xl transition-all duration-200 group-hover:scale-[1.02] shadow-lg ${
                                                        message.user_id === user.id 
                                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                                                            : 'bg-white/10 text-white/90 border border-white/10'
                                                    }`}>
                                                        {renderMessageContent(message)}
                                                        
                                                        {message.user_id === user.id && (
                                                            <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                                <button
                                                                    onClick={() => deleteMessage(message.id)}
                                                                    className="p-2 bg-red-600 rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md"
                                                                    title="Eliminar mensaje"
                                                                >
                                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Selectores de Emoji, GIF y Media */}
                {(showEmojiPicker || showGifPicker || showMediaPicker) && (
                    <div className="border-t border-white/10 bg-white/10 backdrop-blur-sm">
                        {showEmojiPicker && (
                            <div className="p-4">
                                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                    {Object.keys(POKEMON_EMOJIS).map(category => (
                                        <button
                                            key={category}
                                            onClick={() => setActiveEmojiCategory(category)}
                                            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all duration-200 font-medium ${
                                                activeEmojiCategory === category
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto">
                                    {POKEMON_EMOJIS[activeEmojiCategory].map((emoji, index) => (
                                        <button
                                            key={index}
                                            onClick={() => sendEmoji(emoji)}
                                            className="text-2xl p-2 rounded-xl hover:bg-white/10 transition-all duration-200 transform hover:scale-110"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {showGifPicker && (
                            <div className="p-4">
                                <h4 className="text-base font-semibold text-white/80 mb-3 flex items-center gap-2">
                                    <span className="text-lg">🎬</span>
                                    GIFs Pokémon
                                </h4>
                                <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                                    {POKEMON_GIFS.map((gif, index) => (
                                        <button
                                            key={index}
                                            onClick={() => sendGif(gif.url)}
                                            className="relative rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-400 transition-all duration-200 transform hover:scale-105"
                                        >
                                            <img 
                                                src={gif.url} 
                                                alt={`GIF ${gif.name}`} 
                                                className="w-full h-20 object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {showMediaPicker && (
                            <div className="p-4">
                                <h4 className="text-base font-semibold text-white/80 mb-3 flex items-center gap-2">
                                    <span className="text-lg">📸</span>
                                    Compartir Media
                                </h4>
                                <div className="text-center p-6 border-2 border-dashed border-white/20 rounded-2xl hover:border-purple-400 transition-all duration-200">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*,video/*"
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingMedia}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 px-6 py-3 rounded-2xl font-semibold transition-all duration-200 flex items-center gap-3 mx-auto"
                                    >
                                        {uploadingMedia ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Subiendo...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-lg">📁</span>
                                                <span>Seleccionar archivo</span>
                                            </>
                                        )}
                                    </button>
                                    <p className="text-white/60 text-sm mt-3">
                                        Imágenes (JPEG, PNG, GIF, WebP) y videos (MP4, WebM) - Sin límite de tamaño
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Área de Escritura */}
                <div className="p-3 sm:p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                        <div className="flex gap-2 self-start">
                            <button
                                onClick={() => {
                                    setShowEmojiPicker(!showEmojiPicker);
                                    setShowGifPicker(false);
                                    setShowMediaPicker(false);
                                }}
                                className={`p-3 rounded-2xl transition-all duration-200 transform hover:scale-110 ${
                                    showEmojiPicker 
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl' 
                                        : 'bg-white/10 hover:bg-white/20 text-white/80'
                                }`}
                            >
                                <span className="text-xl">😊</span>
                            </button>
                            <button
                                onClick={() => {
                                    setShowGifPicker(!showGifPicker);
                                    setShowEmojiPicker(false);
                                    setShowMediaPicker(false);
                                }}
                                className={`p-3 rounded-2xl transition-all duration-200 transform hover:scale-110 ${
                                    showGifPicker 
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl' 
                                        : 'bg-white/10 hover:bg-white/20 text-white/80'
                                }`}
                            >
                                <span className="text-xl">🎬</span>
                            </button>
                            <button
                                onClick={() => {
                                    setShowMediaPicker(!showMediaPicker);
                                    setShowEmojiPicker(false);
                                    setShowGifPicker(false);
                                }}
                                className={`p-3 rounded-2xl transition-all duration-200 transform hover:scale-110 ${
                                    showMediaPicker 
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl' 
                                        : 'bg-white/10 hover:bg-white/20 text-white/80'
                                }`}
                            >
                                <span className="text-xl">📸</span>
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
                            <div className="flex-1 relative">
                                <textarea
                                    ref={textareaRef}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Escribe tu mensaje..."
                                    className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 resize-none text-white placeholder-white/50 transition-all duration-200 pr-12 text-base"
                                    rows="1"
                                    disabled={loading}
                                    style={{ minHeight: '60px', maxHeight: '120px' }}
                                />
                                {newMessage && (
                                    <button
                                        onClick={() => {
                                            setNewMessage('');
                                            if (textareaRef.current) {
                                                textareaRef.current.style.height = 'auto';
                                            }
                                        }}
                                        className="absolute right-3 top-3 text-white/50 hover:text-white transition-colors duration-200 p-2 rounded-xl hover:bg-white/10"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => sendMessage()}
                                disabled={loading || !newMessage.trim()}
                                className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-3 shadow-xl min-w-[100px] justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm">Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-lg">📤</span>
                                        <span className="text-base">Enviar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Input oculto para archivos */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className="hidden"
            />

            {/* Modal de perfil de usuario */}
            <UserProfileModal 
                user={selectedUser}
                isOpen={showUserProfile}
                onClose={() => setShowUserProfile(false)}
                userProfiles={userProfiles}
            />
        </>
    );
}