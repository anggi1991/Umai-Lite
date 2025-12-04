/**
 * Custom Icon Components using Mascot Assets
 * Baby-friendly custom icons matching brand mascot
 */

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

// Icon mapping for activities
export const mascotIcons = {
  // Navigation icons
  home: require('../../assets/mascot/baby-buddy-happy.png'),
  journal: require('../../assets/mascot/Mood.png'),
  chat: require('../../assets/mascot/baby-buddy-waving.png'),
  stats: require('../../assets/mascot/growth.png'),
  profile: require('../../assets/mascot/baby-buddy-thumbs-up.png'),
  
  // Activity icons
  feeding: require('../../assets/mascot/feeding.png'),
  sleep: require('../../assets/mascot/Sleep.png'),
  diaper: require('../../assets/mascot/diaper.png'),
  growth: require('../../assets/mascot/growth.png'),
  mood: require('../../assets/mascot/Mood.png'),
  
  // Mood icons
  happy: require('../../assets/mascot/Happy.png'),
  excited: require('../../assets/mascot/Excited.png'),
  calm: require('../../assets/mascot/calm.png'),
  sad: require('../../assets/mascot/sad.png'),
  crying: require('../../assets/mascot/crying.png'),
  angry: require('../../assets/mascot/Angry.png'),
  fussy: require('../../assets/mascot/Fussy.png'),
  sleepy: require('../../assets/mascot/Sleepy.png'),
  
  // Baby Buddy variants
  buddyHappy: require('../../assets/mascot/baby-buddy-happy.png'),
  buddyWaving: require('../../assets/mascot/baby-buddy-waving.png'),
  buddySleeping: require('../../assets/mascot/baby-buddy-sleeping.png'),
  buddyThumbsUp: require('../../assets/mascot/baby-buddy-thumbs-up.png'),
};

export type MascotIconName = keyof typeof mascotIcons;

interface MascotIconProps {
  name: MascotIconName;
  size?: number;
  style?: any;
  tintColor?: string;
}

export const MascotIcon: React.FC<MascotIconProps> = ({
  name,
  size = 24,
  style,
  tintColor,
}) => {
  return (
    <Image
      source={mascotIcons[name]}
      style={[
        {
          width: size,
          height: size,
        },
        tintColor && { tintColor },
        style,
      ]}
      resizeMode="contain"
    />
  );
};

// Icon container with background (for cards)
interface IconContainerProps {
  name: MascotIconName;
  size?: number;
  containerSize?: number;
  backgroundColor?: string;
  borderRadius?: number;
}

export const MascotIconContainer: React.FC<IconContainerProps> = ({
  name,
  size = 32,
  containerSize = 56,
  backgroundColor = '#F8F9FA',
  borderRadius,
}) => {
  return (
    <View
      style={{
        width: containerSize,
        height: containerSize,
        borderRadius: borderRadius ?? containerSize / 2,
        backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MascotIcon name={name} size={size} />
    </View>
  );
};

export default MascotIcon;
