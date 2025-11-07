// src/contexts/UserGroupContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const UserGroupContext = createContext(null);

const INITIAL_LIVES = 20;

export const UserGroupProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [group, setGroup] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    console.log('🔍 UserGroupProvider - Estado actual:', { user, group, groupMembers, isLoading });

    // 1. Cargar sesión inicial
    useEffect(() => {
        const loadInitialSession = async () => {
            try {
                console.log('🔄 Cargando sesión inicial...');
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error('❌ Error al cargar sesión:', error);
                    setIsLoading(false);
                    return;
                }

                if (session?.user) {
                    console.log('✅ Usuario autenticado:', session.user);
                    setUser({
                        id: session.user.id,
                        username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Usuario',
                        email: session.user.email
                    });
                } else {
                    console.log('⚠️ No hay usuario autenticado');
                    setUser(null);
                }
            } catch (error) {
                console.error('❌ Error en loadInitialSession:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialSession();

        // 2. Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔄 Cambio de autenticación:', event);
            
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'Usuario',
                    email: session.user.email
                });
            } else {
                setUser(null);
                setGroup(null);
                setGroupMembers([]);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // 3. Función para cargar miembros del grupo
    const fetchGroupMembers = async (groupId) => {
        if (!groupId) {
            console.log('⚠️ No hay groupId para cargar miembros');
            return [];
        }

        try {
            console.log('🔄 Cargando miembros del grupo:', groupId);
            const { data, error } = await supabase
                .from('group_members')
                .select('*')
                .eq('group_id', groupId);

            if (error) {
                console.error('❌ Error al cargar miembros:', error);
                return [];
            }

            console.log('✅ Miembros cargados:', data);
            setGroupMembers(data || []);
            return data || [];
        } catch (error) {
            console.error('❌ Error en fetchGroupMembers:', error);
            return [];
        }
    };

    // 4. Función para seleccionar grupo
    const selectGroup = async (groupData) => {
        console.log('🎯 Seleccionando grupo:', groupData);
        setGroup({
            id: groupData.id,
            name: groupData.name,
            created_by: groupData.created_by
        });
        
        await fetchGroupMembers(groupData.id);
    };

    const contextValue = {
        user,
        group,
        groupMembers,
        isLoading,
        selectGroup,
        fetchGroupMembers,
        INITIAL_LIVES,
    };

    return (
        <UserGroupContext.Provider value={contextValue}>
            {children}
        </UserGroupContext.Provider>
    );
};