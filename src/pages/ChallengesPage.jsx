import React, { useState, useEffect, useContext } from 'react';
import { UserGroupContext } from '../contexts/UserGroupContext';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChallengesPage() {
  const { user, group, groupMembers } = useContext(UserGroupContext);
  const [challenges, setChallenges] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [actionType, setActionType] = useState('');
  const [isHovering, setIsHovering] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '',
    difficulty: 'medio'
  });

  const fetchChallenges = async () => {
    if (!group?.id) return;
    try {
      const { data, error } = await supabase
        .from('active_challenges')
        .select('*')
        .eq('group_id', group.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error cargando retos:', error);
    }
  };

  useEffect(() => {
    if (group?.id) {
      fetchChallenges();
    }
  }, [group?.id]);

  const verifyPassword = () => password === 'iB1144mz';

  const handlePasswordSubmit = () => {
    if (verifyPassword()) {
      setShowPasswordModal(false);
      setError('');
      setPassword('');
      if (actionType === 'create') {
        setShowChallengeModal(true);
      } else if (actionType === 'edit') {
        setShowChallengeModal(true);
      } else if (actionType === 'delete' && editingChallenge) {
        handleDeleteConfirm();
      }
    } else {
      setError('Contraseña incorrecta');
    }
  };

  const handleChallengeSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('El título y la descripción son obligatorios');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (editingChallenge) {
        const { error } = await supabase
          .from('active_challenges')
          .update({
            title: formData.title,
            description: formData.description,
            reward: formData.reward,
            difficulty: formData.difficulty,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingChallenge.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('active_challenges')
          .insert([{
            ...formData,
            group_id: group.id,
            created_by: user.id
          }]);
        if (error) throw error;
      }

      setFormData({ title: '', description: '', reward: '', difficulty: 'medio' });
      setShowChallengeModal(false);
      setEditingChallenge(null);
      setActionType('');
      fetchChallenges();
    } catch (error) {
      setError('Error guardando el reto: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!editingChallenge) return;
    try {
      const { error } = await supabase
        .from('active_challenges')
        .delete()
        .eq('id', editingChallenge.id);
      if (error) throw error;
      setEditingChallenge(null);
      setActionType('');
      fetchChallenges();
    } catch (error) {
      setError('Error eliminando el reto: ' + error.message);
    }
  };

  const handleCreateChallenge = () => {
    setActionType('create');
    setEditingChallenge(null);
    setFormData({ title: '', description: '', reward: '', difficulty: 'medio' });
    setShowPasswordModal(true);
  };

  const handleEditChallenge = (challenge) => {
    setActionType('edit');
    setEditingChallenge(challenge);
    setFormData({
      title: challenge.title,
      description: challenge.description,
      reward: challenge.reward || '',
      difficulty: challenge.difficulty || 'medio'
    });
    setShowPasswordModal(true);
  };

  const handleDeleteChallenge = (challenge) => {
    setActionType('delete');
    setEditingChallenge(challenge);
    setShowPasswordModal(true);
  };

  const handleCancel = () => {
    setShowPasswordModal(false);
    setShowChallengeModal(false);
    setEditingChallenge(null);
    setActionType('');
    setFormData({ title: '', description: '', reward: '', difficulty: 'medio' });
    setError('');
    setPassword('');
  };

  const getCreatorUsername = (createdById) => {
    const member = groupMembers.find(m => m.user_id === createdById);
    return member?.username || 'Usuario';
  };

  const getDifficultyGradient = (difficulty) => {
    const gradients = {
      'fácil': 'linear-gradient(135deg, #10b981, #059669)',
      'medio': 'linear-gradient(135deg, #f59e0b, #d97706)',
      'difícil': 'linear-gradient(135deg, #f97316, #dc2626)',
      'extremo': 'linear-gradient(135deg, #e11d48, #7c3aed)'
    };
    return gradients[difficulty] || 'linear-gradient(135deg, #6b7280, #4b5563)';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const floatingAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.1, 0.15]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center pt-20 pb-16 px-6"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-block mb-8"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4"
            >
              Retos Activos
            </motion.h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-purple-100/80 max-w-3xl mx-auto leading-relaxed"
          >
            Desafíos épicos para el grupo{' '}
            <span className="font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {group?.name}
            </span>
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <AnimatePresence mode="wait">
            {challenges.length > 0 ? (
              <motion.div
                key="challenges-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-12"
              >
                {/* Stats and Create Button */}
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-1 md:grid-cols-4 gap-8"
                >
                  {[
                    { 
                      label: 'Retos Activos', 
                      value: challenges.length, 
                      color: 'from-purple-500 to-pink-500',
                      icon: '🎯'
                    },
                    { 
                      label: 'Retos Extremos', 
                      value: challenges.filter(c => c.difficulty === 'extremo').length, 
                      color: 'from-rose-500 to-red-500',
                      icon: '💀'
                    },
                    { 
                      label: 'Creadores', 
                      value: new Set(challenges.map(c => c.created_by)).size, 
                      color: 'from-emerald-500 to-green-500',
                      icon: '👤'
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      whileHover={{ 
                        scale: 1.05,
                        y: -5
                      }}
                      className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm relative overflow-hidden group"
                    >
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                      />
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                          <div className="text-purple-200/70 text-sm">{stat.label}</div>
                        </div>
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                          className="text-2xl"
                        >
                          {stat.icon}
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                  
                  <motion.button
                    whileHover={{ 
                      scale: 1.05,
                      y: -5,
                      background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f59e0b)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateChallenge}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-3xl p-6 transition-all duration-300 flex items-center justify-center gap-4 text-lg shadow-2xl border border-purple-400/30 relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="text-2xl z-10"
                    >
                      ✨
                    </motion.span>
                    <span className="z-10">Crear Reto</span>
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-2xl z-10"
                    >
                      🚀
                    </motion.span>
                  </motion.button>
                </motion.div>

                {/* Challenges Grid */}
                <motion.div
                  variants={containerVariants}
                  className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
                >
                  {challenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      custom={index}
                      onHoverStart={() => setIsHovering(challenge.id)}
                      onHoverEnd={() => setIsHovering(null)}
                      className="relative group"
                    >
                      <div 
                        className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border border-white/10 backdrop-blur-sm p-6 overflow-hidden h-full flex flex-col"
                        style={{
                          background: isHovering === challenge.id ? 
                            'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))' : 
                            'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
                        }}
                      >
                        {/* Difficulty Badge */}
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                          className="absolute -top-3 -right-3 px-4 py-2 rounded-full text-xs font-bold text-white shadow-lg z-20"
                          style={{ background: getDifficultyGradient(challenge.difficulty) }}
                        >
                          {challenge.difficulty.toUpperCase()}
                        </motion.div>

                        {/* Header */}
                        <div className="mb-4 pr-12 flex-grow">
                          <motion.h3 
                            className="text-xl font-bold text-white mb-3 leading-tight"
                            whileHover={{ color: "#e9d5ff" }}
                          >
                            {challenge.title}
                          </motion.h3>
                          
                          <motion.div 
                            className="mb-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 + 0.5 }}
                          >
                            <p className="text-purple-100/80 text-sm leading-relaxed line-clamp-3">
                              {challenge.description}
                            </p>
                          </motion.div>

                          {/* Reward */}
                          {challenge.reward && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 + 0.6 }}
                              className="mt-4 p-3 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-xl border border-amber-500/20"
                            >
                              <div className="flex items-center gap-2">
                                <motion.span
                                  animate={{ rotate: [0, 10, -10, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="text-amber-400"
                                >
                                  🏆
                                </motion.span>
                                <span className="text-amber-300 font-semibold text-sm">
                                  {challenge.reward}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="mt-auto pt-4 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="flex items-center gap-2 text-sm text-purple-200/60"
                              >
                                <span>Por {getCreatorUsername(challenge.created_by)}</span>
                              </motion.div>
                            </div>
                            <motion.span
                              whileHover={{ scale: 1.1 }}
                              className="text-xs text-purple-200/40"
                            >
                              {new Date(challenge.created_at).toLocaleDateString('es-ES')}
                            </motion.span>
                          </div>

                          {/* Actions */}
                          <motion.div 
                            className="flex justify-between items-center mt-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.1 + 0.7 }}
                          >
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEditChallenge(challenge)}
                                className="p-2 text-blue-400 rounded-lg transition-all duration-200 hover:bg-blue-500/20"
                                title="Editar reto"
                              >
                                <span className="text-sm">✏️</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: "rgba(244, 63, 94, 0.2)" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteChallenge(challenge)}
                                className="p-2 text-rose-400 rounded-lg transition-all duration-200 hover:bg-rose-500/20"
                                title="Eliminar reto"
                              >
                                <span className="text-sm">🗑️</span>
                              </motion.button>
                            </div>
                            <motion.div 
                              className="text-xs text-purple-200/40"
                              whileHover={{ color: "rgba(255,255,255,0.8)" }}
                            >
                              ID: {challenge.id.slice(-6)}
                            </motion.div>
                          </motion.div>
                        </div>

                        {/* Hover Effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          initial={false}
                          animate={{ opacity: isHovering === challenge.id ? 0.1 : 0 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              /* Empty State - Premium Design */
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex items-center justify-center min-h-[70vh]"
              >
                <div className="text-center max-w-4xl mx-auto w-full px-6">
                  
                  {/* Animated Illustration */}
                  <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    className="relative mb-16"
                  >
                    <motion.div
                      variants={floatingAnimation}
                      animate="animate"
                      className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center border border-purple-400/30 backdrop-blur-sm"
                    >
                      <motion.span
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="text-7xl"
                      >
                        🎯
                      </motion.span>
                    </motion.div>
                    
                    {/* Floating Particles */}
                    <motion.div
                      animate={{ 
                        y: [0, -25, 0],
                        x: [0, 10, 0],
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                      className="absolute top-4 right-8 w-8 h-8 bg-emerald-400 rounded-full blur-sm"
                    />
                    <motion.div
                      animate={{ 
                        y: [0, 20, 0],
                        x: [0, -15, 0],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{ 
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                      className="absolute bottom-4 left-6 w-6 h-6 bg-pink-400 rounded-full blur-sm"
                    />
                    <motion.div
                      animate={{ 
                        y: [0, -15, 0],
                        x: [0, -10, 0],
                        opacity: [0.2, 0.8, 0.2]
                      }}
                      transition={{ 
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5
                      }}
                      className="absolute top-12 left-12 w-4 h-4 bg-purple-400 rounded-full blur-sm"
                    />
                  </motion.div>

                  {/* Text Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                    className="space-y-8 mb-16"
                  >
                    <motion.h2
                      whileHover={{ scale: 1.02 }}
                      className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
                    >
                      ¡No hay retos disponibles!
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.7 }}
                      className="text-xl md:text-2xl text-purple-200/70 leading-relaxed max-w-3xl mx-auto"
                    >
                      El tablón de retos está esperando por aventuras épicas. Sé el primero en crear un desafío que pondrá a prueba las habilidades de todo el grupo.
                    </motion.p>
                  </motion.div>

                  {/* Features Grid */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.7 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
                  >
                    {[
                      { 
                        icon: '🏆', 
                        title: 'Recompensas', 
                        desc: 'Ofrece premios especiales que motiven a los participantes',
                        color: 'from-yellow-500 to-amber-500'
                      },
                      { 
                        icon: '⚡', 
                        title: 'Desafíos', 
                        desc: 'Pon a prueba tus habilidades y las de tu equipo',
                        color: 'from-purple-500 to-pink-500'
                      },
                      { 
                        icon: '👥', 
                        title: 'Comunidad', 
                        desc: 'Compite y colabora con todo el grupo',
                        color: 'from-blue-500 to-cyan-500'
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.1 + index * 0.2, duration: 0.6 }}
                        whileHover={{ 
                          scale: 1.05,
                          y: -8,
                          transition: { duration: 0.3 }
                        }}
                        className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-sm transition-all duration-300 relative overflow-hidden group"
                      >
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                        />
                        <motion.div
                          animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            delay: index * 0.5
                          }}
                          className="text-4xl mb-6"
                        >
                          {feature.icon}
                        </motion.div>
                        <h3 className="text-white font-bold text-xl mb-4 relative z-10">{feature.title}</h3>
                        <p className="text-purple-200/60 text-base leading-relaxed relative z-10">{feature.desc}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                  >
                    <motion.button
                      whileHover={{ 
                        scale: 1.05,
                        background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f59e0b)",
                        boxShadow: "0 25px 50px rgba(139, 92, 246, 0.4)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCreateChallenge}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-6 px-16 rounded-3xl transition-all duration-500 flex items-center gap-6 text-2xl mx-auto shadow-2xl border border-purple-400/30 relative overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
                      />
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="text-3xl z-10"
                      >
                        ✨
                      </motion.span>
                      <span className="z-10">Crear Primer Reto Épico</span>
                      <motion.span
                        animate={{ 
                          y: [0, -8, 0],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="text-3xl z-10"
                      >
                        🚀
                      </motion.span>
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 w-full max-w-md border border-white/10 shadow-2xl"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-8"
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
                >
                  🔐
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {actionType === 'create' && 'Crear Reto Épico'}
                  {actionType === 'edit' && 'Editar Reto'}
                  {actionType === 'delete' && 'Eliminar Reto'}
                </h3>
                <p className="text-purple-200/70 text-lg">
                  {actionType === 'delete' 
                    ? 'Confirma la eliminación con la contraseña'
                    : 'Acceso de administrador requerido'}
                </p>
              </motion.div>
              
              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa la contraseña..."
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center text-lg mb-6 transition duration-300"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                autoFocus
              />
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mb-6"
                >
                  <p className="text-rose-400 text-center font-medium">{error}</p>
                </motion.div>
              )}
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-4"
              >
                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePasswordSubmit}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white font-bold py-4 rounded-xl transition duration-300 text-lg"
                >
                  {actionType === 'delete' ? '🗑️ Eliminar' : '🔓 Continuar'}
                </motion.button>
                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: "rgba(255, 255, 255, 0.1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition duration-300 border border-white/10 text-lg"
                >
                  Cancelar
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Challenge Modal */}
      <AnimatePresence>
        {showChallengeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-8"
              >
                <h3 className="text-3xl font-bold text-white mb-3">
                  {editingChallenge ? '✏️ Editar Reto' : '✨ Crear Nuevo Reto'}
                </h3>
                <p className="text-purple-200/70 text-lg">
                  {editingChallenge ? 'Modifica los detalles del reto' : 'Diseña un desafío memorable para el grupo'}
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="space-y-6"
              >
                {[
                  { 
                    label: '🎯 Título del Reto', 
                    name: 'title', 
                    type: 'text', 
                    placeholder: 'Ej: La búsqueda del Pokémon legendario...' 
                  },
                  { 
                    label: '📝 Descripción', 
                    name: 'description', 
                    type: 'textarea', 
                    placeholder: 'Describe la misión en detalle... ¿Qué deben hacer los participantes? ¿Hay reglas especiales? ¿Cuál es el objetivo final?' 
                  },
                  { 
                    label: '🏆 Recompensa (Opcional)', 
                    name: 'reward', 
                    type: 'text', 
                    placeholder: 'Ej: 1000 puntos, carta legendaria, título especial, ventaja en el próximo reto...' 
                  },
                ].map((field, index) => (
                  <motion.div
                    key={field.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <label className="block text-white font-medium mb-3 text-lg">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.name]}
                        onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                        placeholder={field.placeholder}
                        rows="6"
                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition duration-300 text-lg"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.name]}
                        onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                        placeholder={field.placeholder}
                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-300 text-lg"
                      />
                    )}
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-white font-medium mb-3 text-lg">⚡ Nivel de Dificultad</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-300 text-lg"
                  >
                    <option value="fácil">🟢 Fácil - Para principiantes</option>
                    <option value="medio">🟡 Medio - Desafío equilibrado</option>
                    <option value="difícil">🟠 Difícil - Para expertos</option>
                    <option value="extremo">🔴 Extremo - ¡Solo para valientes!</option>
                  </select>
                </motion.div>
              </motion.div>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 mt-6"
                >
                  <p className="text-rose-400 text-center text-lg font-medium">{error}</p>
                </motion.div>
              )}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4 mt-8"
              >
                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleChallengeSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 disabled:bg-gray-600 text-white font-bold py-4 rounded-xl transition duration-300 text-lg flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">💾</span>
                      {editingChallenge ? 'Actualizar Reto' : '✨ Crear Reto Épico'}
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: "rgba(255, 255, 255, 0.1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-xl transition duration-300 border border-white/10 text-lg"
                >
                  Cancelar
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}