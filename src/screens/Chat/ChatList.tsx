import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, Button, List } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { listChatSessions, createChatSession } from '../../services/chatService';
import { ChatSession } from '../../types/database';
import { BabyBuddyEmptyState } from '../../components/mascot';
import { useTranslation } from '../../hooks/useTranslation';
import theme from '../../theme';
import { router } from 'expo-router';

export default function ChatListScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await listChatSessions(user.id);
      setSessions(data);
    } catch (e) {
      console.error('List sessions error', e);
      Alert.alert(t('common.error'), t('errors.loadChatFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const startNewChat = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const session = await createChatSession(user.id, undefined, t('chat.newSession'));
      router.push(`/chat/${session.id}`);
    } catch (e) {
      Alert.alert(t('common.error'), t('errors.createChatFailed'));
    } finally {
      setCreating(false);
    }
  };

  const renderItem = ({ item }: { item: ChatSession }) => (
    <List.Item
      title={item.title || t('chat.noTitle')}
      description={new Date(item.updated_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
      onPress={() => router.push(`/chat/${item.id}`)}
      left={(props) => <List.Icon {...props} icon="message" />}
    />
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.babyBlue, theme.colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Button icon="arrow-left" onPress={() => router.back()} textColor="#fff">{t('common.back')}</Button>
        <Text variant="titleLarge" style={styles.headerTitle}>💬 {t('chat.title')}</Text>
        <View style={{ width: 72 }} />
      </LinearGradient>
      {loading ? (
        <View style={styles.center}><ActivityIndicator /><Text>{t('common.loading')}</Text></View>
      ) : sessions.length === 0 ? (
        <BabyBuddyEmptyState
          message={t('chat.noSessions')}
          submessage={t('chat.startChatMessage')}
          expression="waving"
        />
      ) : (
        <FlatList data={sessions} keyExtractor={(s) => s.id} renderItem={renderItem} contentContainerStyle={styles.list} />
      )}
      <FAB icon="plus" style={styles.fab} onPress={startNewChat} loading={creating} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  header: { 
    padding: theme.spacing.lg,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: theme.borders.radius.large,
    borderBottomRightRadius: theme.borders.radius.large,
  },
  headerTitle: { 
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  center: { 
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: { 
    margin: theme.spacing.lg,
  },
  emptyText: { 
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  list: { 
    paddingBottom: 120,
    padding: theme.spacing.md,
  },
  fab: { 
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
});
