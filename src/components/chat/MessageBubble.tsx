import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Clipboard, Alert, Image } from 'react-native';
import { Text, Menu } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { useUserPreferences, MascotExpression } from '../../contexts/UserPreferencesContext';
import theme from '../../theme';
import { Message } from '../../types/database';

// Import mascot images for AI avatar
const mascotImages = {
  happy: require('../../assets/mascot/baby-buddy-happy.png'),
  waving: require('../../assets/mascot/baby-buddy-waving.png'),
  'thumbs-up': require('../../assets/mascot/baby-buddy-thumbs-up.png'),
  sleeping: require('../../assets/mascot/baby-buddy-sleeping.png'),
};

interface MessageBubbleProps {
  message: Message | OptimisticMessage;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  mascotExpression?: MascotExpression;
}

interface OptimisticMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'assistant';
  role: string | null;
  content: string;
  created_at: string;
  optimistic?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showTimestamp = true,
  showAvatar = true,
  mascotExpression: propExpression,
}) => {
  const { mascotExpression: contextExpression } = useUserPreferences();
  const mascotExpression = propExpression || contextExpression;
  const [menuVisible, setMenuVisible] = useState(false);
  const isUser = message.sender === 'user';

  const handleCopy = () => {
    Clipboard.setString(message.content);
    setMenuVisible(false);
    Alert.alert('✅ Disalin', 'Pesan berhasil disalin ke clipboard');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}.${minutes}`;
  };

  const markdownStyles = {
    body: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      lineHeight: 20,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 8,
    },
    strong: {
      fontWeight: 'bold' as const,
    },
    em: {
      fontStyle: 'italic' as const,
    },
    bullet_list: {
      marginTop: 8,
      marginBottom: 8,
      marginLeft: 0,
    },
    ordered_list: {
      marginTop: 8,
      marginBottom: 8,
      marginLeft: 0,
    },
    list_item: {
      marginBottom: 4,
      flexDirection: 'row' as const,
    },
    bullet_list_icon: {
      marginRight: 8,
      marginLeft: 0,
    },
    code_inline: {
      backgroundColor: '#E3F2FD',
      padding: 2,
      paddingHorizontal: 4,
      borderRadius: 3,
      fontFamily: 'monospace' as const,
    },
  };

  return (
    <View style={[styles.bubbleRow, isUser ? styles.rowRight : styles.rowLeft]}>
      {!isUser && showAvatar && (
        <View style={styles.avatarContainer}>
          <Image 
            source={mascotImages[mascotExpression]} 
            style={styles.avatarImage}
            resizeMode="contain"
          />
        </View>
      )}
      
      <View style={styles.bubbleContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity
              onLongPress={() => setMenuVisible(true)}
              activeOpacity={0.8}
            >
              {isUser ? (
                <View style={[styles.bubble, styles.userBubble]}>
                  <Text style={styles.userBubbleText}>{message.content}</Text>
                </View>
              ) : (
                <View style={[styles.bubble, styles.assistantBubble]}>
                  <Markdown style={markdownStyles}>{message.content}</Markdown>
                </View>
              )}
            </TouchableOpacity>
          }
        >
          <Menu.Item onPress={handleCopy} leadingIcon="content-copy" title="Salin" />
        </Menu>
        {showTimestamp && (
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
            {formatTime(message.created_at)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleRow: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  bubbleContainer: {
    maxWidth: '78%',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
    ...theme.shadows.small,
  },
  avatarImage: {
    width: 32,
    height: 32,
  },
  bubble: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: '#FECDD6',
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: theme.colors.white,
    borderBottomLeftRadius: 4,
    ...theme.shadows.small,
  },
  userBubbleText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    color: theme.colors.textSecondary,
  },
  userTimestamp: {
    textAlign: 'right',
  },
  assistantTimestamp: {
    textAlign: 'left',
    marginLeft: 2,
  },
});
