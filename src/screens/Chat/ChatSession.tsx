import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Image, TextInput, ScrollView, Alert, Animated, Share, Modal } from 'react-native';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { useUserPreferences, MascotExpression, AIPersona } from '../../contexts/UserPreferencesContext';
import { useTranslation } from '../../hooks/useTranslation';
import { UpgradeModal, AppHeader, CustomButton } from '../../components/ui';
import { MessageBubble, AnimatedBuddyLoading } from '../../components/chat';
import theme from '../../theme';
import { listMessages, sendChatMessageStreaming } from '../../services/chatService';
import { getDefaultChild } from '../../services/childService';
import { Message } from '../../types/database';

// Import mascot images for AI avatar
const mascotImages = {
  happy: require('../../assets/mascot/baby-buddy-happy.png'),
  waving: require('../../assets/mascot/baby-buddy-waving.png'),
  'thumbs-up': require('../../assets/mascot/baby-buddy-thumbs-up.png'),
  sleeping: require('../../assets/mascot/baby-buddy-sleeping.png'),
};

interface ChatRenderItemProps { message: Message | OptimisticMessage; }
interface OptimisticMessage { id: string; session_id: string; sender: 'user'|'assistant'; role: string|null; content: string; created_at: string; optimistic?: boolean; }

export default function ChatSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { mascotExpression, aiPersona, setMascotExpression, setAIPersona } = useUserPreferences();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<(Message|OptimisticMessage)[]>([]);
  
  // 🛡️ FIX: Cache messages in ref to prevent loss during navigation
  const messagesRef = useRef<(Message|OptimisticMessage)[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
    console.log('💾 Messages cached:', messages.length, 'messages');
  }, [messages]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageLimitInfo, _setUsageLimitInfo] = useState({ used: 10, limit: 10 });
  const [_menuVisible, setMenuVisible] = useState(false);
  
  // 🎨 FIX: AI settings modal state
  const [aiSettingsVisible, setAiSettingsVisible] = useState(false);
  
  // 🛡️ Ref to prevent duplicate load calls
  const isLoadingRef = useRef(false);
  
  // 🚫 CRITICAL: Prevent reload while AI is responding (fixes restart bug)
  const isSendingRef = useRef(false);
  
  // Use provided session ID or null (will be created on first message)
  const [sessionId, setSessionId] = useState<string | null>(
    id && !Array.isArray(id) ? id : null
  );
  
  // 🛡️ FIX: Preserve sessionId across navigation using ref AND AsyncStorage
  const sessionIdRef = useRef<string | null>(sessionId);
  useEffect(() => {
    if (sessionId) {
      sessionIdRef.current = sessionId;
      console.log('💾 Session ID preserved:', sessionId);
      // Save to AsyncStorage for persistence across app restarts
      AsyncStorage.setItem('lastChatSessionId', sessionId).catch(err => 
        console.error('Failed to save session ID:', err)
      );
    }
  }, [sessionId]);
  
  // 🛡️ Restore last session on mount if no ID provided
  useEffect(() => {
    if (!id && !sessionId) {
      AsyncStorage.getItem('lastChatSessionId').then(lastSessionId => {
        if (lastSessionId) {
          console.log('🔄 Restoring last session:', lastSessionId);
          setSessionId(lastSessionId);
        }
      }).catch(err => console.error('Failed to restore session:', err));
    }
  }, [id, sessionId]);
  
  // 🧠 ENHANCEMENT: Store default child ID for AI context
  const [defaultChildId, setDefaultChildId] = useState<string | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
  }, []);

  const load = useCallback(async () => {
    console.log('📥 Loading messages...', { sessionId, hasUser: !!user, isLoading: isLoadingRef.current, isSending: isSendingRef.current });
    
    if (!user) {
      console.log('⚠️ No user found, stopping load');
      isLoadingRef.current = false;
      setLoading(false);
      return;
    }
    
    // 🚫 CRITICAL FIX: Don't reload while AI is responding
    if (isSendingRef.current) {
      console.log('⏸️ AI is responding, skipping reload to prevent restart');
      return;
    }

    // If no session ID yet, start with empty messages (new chat)
    if (!sessionId) {
      console.log('📝 No session yet, starting new chat');
      isLoadingRef.current = false;
      setLoading(false);
      setMessages([]);
      return;
    }
    
    // 🛡️ Prevent duplicate calls while already loading
    if (isLoadingRef.current) {
      console.log('⏳ Already loading, skipping duplicate call');
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      console.log('🔄 Fetching messages for session:', sessionId);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const dataPromise = listMessages(sessionId);
      
      const data = await Promise.race([dataPromise, timeoutPromise]);
      console.log('✅ Messages loaded:', data.length, 'messages:', data.map(m => ({ id: m.id, sender: m.sender, content: m.content.substring(0, 50) })));
      setMessages(data);
      console.log('📌 Messages state updated');
    } catch (e: any) {
      console.error('❌ Load messages error:', e);
      console.error('Error message:', e?.message);
      console.error('Error code:', e?.code);
      
      // Show user-friendly error
      if (e?.message === 'Request timeout') {
        Alert.alert(
          t('common.timeout'),
          t('errors.loadMessagesFailed'),
          [{ text: t('common.ok') }]
        );
      } else if (e?.code === 'PGRST116') {
        // Session not found - this is OK, just empty
        console.log('📝 Session not found, starting fresh');
      } else {
        Alert.alert(
          t('common.error'),
          t('errors.loadMessagesError'),
          [{ text: t('common.ok') }]
        );
      }
      
      // 🛡️ FIX: Fallback ke cached messages jika ada, jangan langsung kosongkan
      if (messagesRef.current.length > 0) {
        console.log('💾 Restoring from cache:', messagesRef.current.length, 'messages');
        setMessages(messagesRef.current);
      } else {
        setMessages([]);
      }
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
      scrollToBottom();
    }
  }, [sessionId, user, scrollToBottom]);

  // 🔥 FIX Bug #6: Reload messages when screen regains focus
  // This ensures chat history persists when user navigates away and returns
  // Note: useFocusEffect runs on mount AND on focus, so we don't need separate useEffect
  useFocusEffect(
    useCallback(() => {
      console.log('👀 Screen focused, loading messages...', { sessionId, hasUser: !!user });
      
      // 🛡️ FIX: Reset isSendingRef jika user kembali ke screen
      // Ini memastikan load() bisa berjalan bahkan jika AI masih merespons sebelumnya
      if (isSendingRef.current) {
        console.log('⚠️ Resetting isSendingRef on screen focus');
        isSendingRef.current = false;
      }
      
      // Always call load() to handle both new chat and existing session
      load();
    }, [sessionId, user, load])
  );
  
  // 🧠 ENHANCEMENT Bug #7: Fetch default child for AI context
  useEffect(() => {
    const fetchDefaultChild = async () => {
      if (!user) return;
      
      try {
        const child = await getDefaultChild(user.id);
        if (child) {
          console.log('✅ Default child loaded for AI context:', child.name);
          setDefaultChildId(child.id);
        } else {
          console.log('ℹ️ No children found for AI context');
        }
      } catch (error) {
        console.error('❌ Failed to fetch default child:', error);
        // Continue without child context
      }
    };
    
    fetchDefaultChild();
  }, [user]);

  const handleImagePick = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          t('chat.permissionRequired'),
          t('chat.galleryPermissionMessage'),
          [{ text: t('common.ok') }]
        );
        return;
      }

      // Launch image picker (no cropping, full quality)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // ✅ No cropping required
        quality: 1, // ✅ Full quality, no compression
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        Alert.alert(
          t('chat.imageSelected'),
          t('chat.imageSelectedMessage'),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        t('common.error'),
        t('errors.pickImageFailed'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      // Stop recording
      stopRecording();
    } else {
      // Start recording
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      // For now, simulate recording without expo-av
      // In production, you would use expo-av Audio.Recording
      setIsRecording(true);
      setRecordingDuration(0);
      startPulseAnimation();

      // Start timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 60) {
            // Auto stop after 60 seconds
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

      Alert.alert(
        t('chat.recordingStarted'),
        t('chat.recordingStartedMessage'),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert(
        t('common.error'),
        t('errors.startRecordingFailed'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const stopRecording = () => {
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
    
    stopPulseAnimation();
    const duration = recordingDuration;
    setIsRecording(false);
    setRecordingDuration(0);

    if (duration > 0) {
      Alert.alert(
        t('chat.recordingCompleted'),
        t('chat.recordingCompletedMessage', { duration: duration.toString() }),
        [
          {
            text: t('chat.send'),
            onPress: () => {
              setInput(`[Voice message: ${duration}s]`);
            }
          },
          {
            text: t('common.cancel'),
            style: 'cancel'
          }
        ]
      );
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      stopPulseAnimation();
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const userMsg: OptimisticMessage = {
      id: `temp-user-${Date.now()}`,
      session_id: sessionId || 'temp',
      sender: 'user',
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
      optimistic: true,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    scrollToBottom();
    setSending(true);
    setIsTyping(true);
    
    // 🚫 CRITICAL: Set flag to prevent reload during AI response
    isSendingRef.current = true;
    console.log('🔒 Locked reload during AI response');
    
    // Create temporary assistant message for streaming
    const tempAssistantId = `temp-assistant-${Date.now()}`;
    const assistantMsg: OptimisticMessage = {
      id: tempAssistantId,
      session_id: sessionId || 'temp',
      sender: 'assistant',
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
      optimistic: true,
    };
    
    try {
      // Use streaming for better UX
      // 🧠 Pass defaultChildId and aiPersona for AI context enhancement
      console.log('🔍 DEBUG ChatSession: Sending message with child_id:', defaultChildId, 'ai_persona:', aiPersona);
      await sendChatMessageStreaming(
        sessionId || undefined, 
        userMsg.content,
        // onChunk: Update message content as chunks arrive
        (chunk: string) => {
          setMessages((prev) => {
            const existing = prev.find(m => m.id === tempAssistantId);
            if (existing) {
              return prev.map(m => 
                m.id === tempAssistantId 
                  ? { ...m, content: m.content + chunk }
                  : m
              );
            } else {
              // First chunk, add the message
              assistantMsg.content = chunk;
              return [...prev, assistantMsg];
            }
          });
          scrollToBottom();
        },
        // onComplete: Replace with actual message from DB
        async (newSessionId: string, messageId: string) => {
          console.log('📝 Stream complete, session:', newSessionId);
          setIsTyping(false);
          
          // Update session ID if it was created
          if (newSessionId && newSessionId !== sessionId) {
            setSessionId(newSessionId);
            // 🔥 Update URL to include sessionId for proper history navigation
            router.replace(`/chat/${newSessionId}`);
          }
          
          // Refresh actual messages from DB
          const latest = await listMessages(newSessionId);
          setMessages(latest);
          scrollToBottom();
          
          // 🔓 CRITICAL: Unlock reload after AI completes response
          isSendingRef.current = false;
          console.log('🔓 Unlocked reload after AI response complete');
        },
        // onError: Handle errors
        (error: Error) => {
          console.error('Streaming error:', error);
          throw error;
        },
        // 🧠 childId for personalized AI responses
        defaultChildId || undefined,
        // 🎨 aiPersona for custom response style
        aiPersona
      );
    } catch (e: any) {
      // Check if usage limit reached
      if (e?.message === 'USAGE_LIMIT_REACHED') {
        setIsTyping(false);
        // Remove optimistic user message
        setMessages((prev) => prev.filter(m => m.id !== userMsg.id));
        // Show upgrade modal
        setShowUpgradeModal(true);
        return;
      }
      
      // Suppress error log di production, hanya log di development
      if (__DEV__) {
        console.error('Send chat error', e);
      }
      
      // Fallback response jika Edge Function gagal
      const fallbackResponses: { [key: string]: string } = {
        'tips menenangkan': '💡 Beberapa cara menenangkan bayi:\n• Gendong dengan lembut\n• Nyanyikan lagu pengantar tidur\n• Buat suasana tenang dan redup\n• Cek kebutuhan dasar (lapar, popok, dll)',
        'jadwal makan': '🍼 Jadwal makan bayi:\n• 0-3 bulan: Setiap 2-3 jam\n• 3-6 bulan: Setiap 3-4 jam\n• 6+ bulan: 3x makan + 2x camilan\n• Selalu ikuti sinyal lapar bayi',
        'tidur': '😴 Tips tidur bayi:\n• Ciptakan rutinitas tidur\n• Kamar gelap & sejuk\n• White noise membantu\n• Hindari layar sebelum tidur\n• Konsisten dengan jadwal',
        'milestone': '🎯 Milestone bayi:\n• 0-3 bulan: Angkat kepala, senyum sosial\n• 3-6 bulan: Berguling, duduk dengan bantuan\n• 6-9 bulan: Merangkak, duduk sendiri\n• 9-12 bulan: Berdiri, kata pertama',
      };
      
      // Cari respons yang paling sesuai
      let response = '😊 Maaf, fitur AI chat sementara tidak tersedia. Berikut beberapa tips umum:\n\n';
      const userInput = userMsg.content.toLowerCase();
      
      let foundMatch = false;
      for (const [keyword, answer] of Object.entries(fallbackResponses)) {
        if (userInput.includes(keyword)) {
          response = answer + '\n\n💡 Fitur AI chat akan segera aktif kembali!';
          foundMatch = true;
          break;
        }
      }
      
      if (!foundMatch) {
        response += '• Pastikan bayi cukup tidur\n• Berikan ASI/susu formula sesuai jadwal\n• Jaga kebersihan dan kenyamanan\n• Ajak bermain dan berinteraksi\n• Konsultasi dengan dokter jika ada kekhawatiran\n\n💡 Fitur AI chat akan segera aktif kembali!';
      }
      
      // Add fallback response as new message
      setIsTyping(false);
      const fallbackMessage: OptimisticMessage = {
        id: `fallback-${Date.now()}`,
        session_id: sessionId || 'temp',
        sender: 'assistant',
        role: 'assistant',
        content: response,
        created_at: new Date().toISOString(),
        optimistic: true,
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setSending(false);
      
      // 🔓 CRITICAL: Always unlock reload even on error
      isSendingRef.current = false;
      console.log('🔓 Unlocked reload (finally block)');
    }
  };

  const quickPrompts = [
    t('chat.quickPrompt1'),
    t('chat.quickPrompt2'),
    t('chat.quickPrompt3'),
    t('chat.quickPrompt4'),
  ];

  const handleClearChat = () => {
    Alert.alert(
      t('chat.clearChat'),
      t('chat.confirmClearChat'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            setMenuVisible(false);
            Alert.alert(t('common.success'), t('success.chatCleared'));
          }
        }
      ]
    );
  };

  const handleExportChat = async () => {
    setMenuVisible(false);
    if (messages.length === 0) {
      Alert.alert(t('common.info'), t('chat.noMessagesToExport'));
      return;
    }

    try {
      const chatText = messages
        .map(m => `[${m.sender === 'user' ? t('chat.you') : 'Umai'}] ${m.content}`)
        .join('\n\n');
      
      await Share.share({
        message: `${t('chat.chatWith')}\n\n${chatText}`,
        title: t('chat.exportChatTitle')
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleNewChat = () => {
    Alert.alert(
      t('chat.newChat'),
      t('chat.confirmNewChat'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('chat.startNew'),
          onPress: () => {
            setSessionId(null);
            setMessages([]);
            setMenuVisible(false);
            router.push('/chat');
          }
        }
      ]
    );
  };

  const handleDeleteSession = () => {
    Alert.alert(
      t('chat.deleteConversation'),
      t('chat.confirmDeleteConversation'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('chat.deletePermanent'),
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement delete session from database
              setMenuVisible(false);
              router.back();
              Alert.alert(t('common.success'), t('success.conversationDeleted'));
            } catch (error) {
              Alert.alert(t('common.error'), t('errors.deleteConversationFailed'));
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Message | OptimisticMessage }) => {
    return <MessageBubble message={item} showTimestamp={true} mascotExpression={mascotExpression} />;
  };

  return (
    <View style={styles.container}>
      {/* Upgrade Modal */}
      <UpgradeModal
        visible={showUpgradeModal}
        onDismiss={() => setShowUpgradeModal(false)}
        onUpgrade={(tier) => {
          setShowUpgradeModal(false);
          router.push('/subscription');
        }}
        currentUsage={{
          feature: 'Chat Messages',
          used: usageLimitInfo.used,
          limit: usageLimitInfo.limit,
        }}
        source="chat"
      />
      
      {/* 🎨 AI Settings Modal */}
      <Modal
        visible={aiSettingsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAiSettingsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAiSettingsVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.aiSettingsModal}>
              <ScrollView contentContainerStyle={styles.aiSettingsContent} showsVerticalScrollIndicator={false}>
              <Text variant="titleLarge" style={styles.settingsTitle}>
                {t('chat.aiSettings')}
              </Text>
              
              {/* Mascot Expression Selection */}
              <Text variant="titleMedium" style={styles.settingsSectionTitle}>
                {t('chat.chooseMascot')}
              </Text>
              <View style={styles.mascotGrid}>
                {(['happy', 'waving', 'thumbs-up', 'sleeping'] as MascotExpression[]).map((expression) => (
                  <TouchableOpacity
                    key={expression}
                    style={[
                      styles.mascotOption,
                      mascotExpression === expression && styles.mascotOptionSelected,
                    ]}
                    onPress={async () => {
                      try {
                        await setMascotExpression(expression);
                        Alert.alert(t('common.success'), t('chat.mascotUpdated'));
                      } catch (error) {
                        console.error('Error updating mascot:', error);
                        Alert.alert(t('common.error'), t('errors.updateMascotFailed'));
                      }
                    }}
                  >
                    <Image 
                      source={mascotImages[expression]} 
                      style={styles.mascotOptionImage}
                      resizeMode="contain"
                    />
                    <Text variant="bodySmall" style={styles.mascotOptionLabel}>
                      {t(`chat.mascot.${expression}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* AI Personality Selection */}
              <Text variant="titleMedium" style={[styles.settingsSectionTitle, { marginTop: theme.spacing.lg }]}>
                {t('chat.aiPersonality')}
              </Text>
              <View style={styles.personalityList}>
                {(['friendly', 'professional', 'encouraging', 'concise'] as AIPersona[]).map((persona) => (
                  <TouchableOpacity
                    key={persona}
                    style={[
                      styles.personalityOption,
                      aiPersona === persona && styles.personalityOptionSelected,
                    ]}
                    onPress={async () => {
                      try {
                        await setAIPersona(persona);
                        Alert.alert(t('common.success'), t('chat.personalityUpdated'));
                      } catch (error) {
                        console.error('Error updating AI persona:', error);
                        Alert.alert(t('common.error'), t('errors.updatePersonalityFailed'));
                      }
                    }}
                  >
                    <MaterialCommunityIcons 
                      name={aiPersona === persona ? 'radiobox-marked' : 'radiobox-blank'} 
                      size={24} 
                      color={aiPersona === persona ? theme.colors.primary : theme.colors.textSecondary} 
                    />
                    <View style={styles.personalityContent}>
                      <Text variant="bodyLarge" style={styles.personalityLabel}>
                        {t(`chat.persona.${persona}.name`)}
                      </Text>
                      <Text variant="bodySmall" style={styles.personalityDescription}>
                        {t(`chat.persona.${persona}.description`)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              
              <CustomButton
                title={t('common.close')}
                variant="secondary"
                onPress={() => setAiSettingsVisible(false)}
                style={styles.closeButton}
              />
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      
      {/* Header */}
      <AppHeader
        title="Umai"
        subtitle="AI Chat"
        showBackButton
        variant="white"
        customRight={
          <View style={styles.headerRight}>
            <View style={styles.avatarCircle}>
              <Image 
                source={mascotImages[mascotExpression]} 
                style={styles.avatarImage}
                resizeMode="contain"
              />
            </View>
            {/* 🎨 FIX: Add AI settings icon */}
            <IconButton
              icon="cog"
              size={20}
              onPress={() => setAiSettingsVisible(true)}
              iconColor={theme.colors.textSecondary}
            />
          </View>
        }
        menuItems={[
          {
            title: t('chat.newChat'),
            icon: 'message-plus',
            onPress: handleNewChat,
          },
          {
            title: t('chat.exportChat'),
            icon: 'share-variant',
            onPress: handleExportChat,
          },
          {
            title: t('chat.clearFromView'),
            icon: 'broom',
            onPress: handleClearChat,
          },
          ...(sessionId ? [{
            title: t('chat.deletePermanent'),
            icon: 'delete-forever',
            onPress: handleDeleteSession,
            divider: true,
          }] : []),
        ]}
      />
      
      {/* Messages Area */}
      <KeyboardAvoidingView 
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>{t('chat.loadingMessages')}</Text>
          </View>
        ) : (
          <>
            {messages.length === 0 ? (
              <ScrollView contentContainerStyle={styles.emptyContainer}>
                <View style={styles.welcomeSection}>
                  <View style={styles.welcomeAvatar}>
                    <Image 
                      source={mascotImages[mascotExpression]} 
                      style={styles.welcomeAvatarImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.welcomeBubble}>
                    <Text style={styles.welcomeText}>
                      {t('chat.welcomeMessage', { name: user?.email?.split('@')[0] || t('chat.parentName') })}
                    </Text>
                    <Text style={styles.welcomeTime}>
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '.')}
                    </Text>
                  </View>
                </View>

                <Text variant="bodyMedium" style={styles.quickQuestionsTitle}>
                  {t('chat.quickQuestions')}
                </Text>
                <View style={styles.quickPrompts}>
                  {quickPrompts.map((prompt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.promptButton}
                      onPress={() => setInput(prompt)}
                    >
                      <Text style={styles.promptText}>{prompt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(m) => m.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListFooterComponent={<AnimatedBuddyLoading visible={isTyping} expression={mascotExpression} />}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </>
        )}
      
      <View>
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>
              {t('chat.recording')} {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
            </Text>
            <Text style={styles.recordingHint}>{t('chat.tapStopToFinish')}</Text>
          </View>
        )}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <View style={styles.imagePreview}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <MaterialCommunityIcons name="close-circle" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.inputRow}>
          <TouchableOpacity onPress={handleImagePick}>
            <IconButton 
              icon="image" 
              size={24}
              iconColor={selectedImage ? theme.colors.primary : theme.colors.textSecondary}
              onPress={handleImagePick}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder={t('chat.typeMessage')}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
          />
         
          {isRecording ? (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <IconButton 
                icon="stop-circle" 
                size={24}
                iconColor="#FF6B6B"
                onPress={handleVoiceRecord}
              />
            </Animated.View>
          ) : (
            <IconButton 
              icon="microphone" 
              size={24}
              iconColor={theme.colors.textSecondary}
              onPress={handleVoiceRecord}
            />
          )}
          <TouchableOpacity 
            style={[
              styles.sendButtonCircle,
              (!input.trim() && !selectedImage) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={sending || (!input.trim() && !selectedImage)}
          >
            <MaterialCommunityIcons 
              name="send" 
              size={20} 
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  messagesContainer: {
    flex: 1,
  },
  header: { 
    backgroundColor: 'white',
    paddingTop: 40,
    paddingBottom: 12,
    paddingHorizontal: 8,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 38,
    height: 38,
  },
  headerTitle: { 
    color: theme.colors.textPrimary, 
    fontWeight: '600',
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.textSecondary,
  },
  list: { 
    padding: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 20,
    paddingTop: 24,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  welcomeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  welcomeAvatarImage: {
    width: 44,
    height: 44,
  },
  welcomeBubble: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 18,
    ...theme.shadows.small,
  },
  welcomeText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  welcomeTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  quickQuestionsTitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  quickPrompts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  promptButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  promptText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  inputRow: { 
    flexDirection: 'row', 
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1, 
    borderTopColor: theme.colors.divider,
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.textPrimary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxHeight: 100,
  },
  previewButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  previewText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  sendButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.babyBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D0D0D0',
    opacity: 0.5,
  },
  recordingIndicator: {
    backgroundColor: '#FFF5F5',
    borderTopWidth: 1,
    borderTopColor: '#FFE0E0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B6B',
  },
  recordingText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  recordingHint: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  imagePreviewContainer: {
    padding: 12,
    paddingBottom: 8,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  imagePreview: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    flex: 1,
  },
  mascotHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  mascotLabel: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  inputWrapper: {
    marginBottom: 0,
  },
  sendButton: { 
    margin: 0,
  },
  // AI Settings Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20, // 🎨 Padding horizontal saja
  },
  aiSettingsModal: {
    backgroundColor: theme.colors.white,
    borderRadius: 16, // 🎨 Rounded corners
    width: 340, // 🎨 Fixed width, tidak 100%
    maxHeight: '85%', // 🎨 Max height
    overflow: 'hidden', // 🎨 CRITICAL: Agar borderRadius terlihat
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  aiSettingsContent: {
    padding: 20, // 🎨 Konsisten dengan modal upgrade (20px)
  },
  settingsTitle: {
    marginBottom: 16, // 🎨 Reduced untuk compact layout
    color: theme.colors.textPrimary,
    fontWeight: '700',
    fontSize: 18, // 🎨 Sedikit lebih kecil
    textAlign: 'center',
  },
  settingsSectionTitle: {
    marginTop: 12, // 🎨 Reduced spacing
    marginBottom: 10, // 🎨 Reduced spacing
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 15, // 🎨 Sedikit lebih kecil
  },
  mascotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10, // 🎨 Reduced gap
    marginBottom: 12, // 🎨 Reduced margin
  },
  mascotOption: {
    width: '22%',
    alignItems: 'center',
    padding: 10, // 🎨 Reduced padding
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borders.radius.medium,
    backgroundColor: theme.colors.white,
  },
  mascotOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#E3F2FD',
  },
  mascotOptionImage: {
    width: 45, // 🎨 Sedikit lebih kecil
    height: 45,
    marginBottom: 6, // 🎨 Reduced margin
  },
  mascotOptionLabel: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
  personalityList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  personalityOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12, // 🎨 Reduced padding
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borders.radius.medium,
    backgroundColor: theme.colors.white,
  },
  personalityOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#E3F2FD',
  },
  personalityContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  personalityLabel: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
    marginBottom: theme.spacing.xs,
  },
  personalityDescription: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  closeButton: {
    marginTop: theme.spacing.xl,
  },
});
