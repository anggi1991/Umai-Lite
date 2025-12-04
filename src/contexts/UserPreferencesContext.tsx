import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

export type MascotExpression = 'happy' | 'waving' | 'thumbs-up' | 'sleeping';
export type AIPersona = 'friendly' | 'professional' | 'encouraging' | 'concise';

interface UserPreferences {
  mascotExpression: MascotExpression;
  aiPersona: AIPersona;
}

interface UserPreferencesContextType extends UserPreferences {
  setMascotExpression: (expression: MascotExpression) => Promise<void>;
  setAIPersona: (persona: AIPersona) => Promise<void>;
  loading: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
};

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [mascotExpression, setMascotExpressionState] = useState<MascotExpression>('happy');
  const [aiPersona, setAIPersonaState] = useState<AIPersona>('friendly');
  const [loading, setLoading] = useState(true);

  // Load preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        console.log('[UserPreferences] No user, using defaults');
        setLoading(false);
        return;
      }

      try {
        console.log('[UserPreferences] Loading preferences for user:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('mascot_expression, ai_persona')
          .eq('id', user.id) // Changed from user_id to id
          .single();

        if (error) {
          console.error('[UserPreferences] Error loading preferences:', error);
          // Set defaults even if error
          setMascotExpressionState('happy');
          setAIPersonaState('friendly');
          return;
        }

        if (data) {
          setMascotExpressionState((data.mascot_expression as MascotExpression) || 'happy');
          setAIPersonaState((data.ai_persona as AIPersona) || 'friendly');
          console.log('[UserPreferences] Loaded:', data);
        }
      } catch (error) {
        console.error('[UserPreferences] Load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Update mascot expression in database
  const setMascotExpression = async (expression: MascotExpression) => {
    if (!user) {
      console.warn('[UserPreferences] Cannot update mascot: no user logged in');
      throw new Error('User not logged in');
    }

    try {
      console.log('[UserPreferences] Updating mascot expression:', expression);
      console.log('[UserPreferences] User ID:', user.id);
      
      const { error } = await supabase
        .from('profiles')
        .update({ mascot_expression: expression })
        .eq('id', user.id); // Changed from user_id to id

      if (error) {
        console.error('[UserPreferences] Error updating mascot:', error);
        throw error;
      }

      setMascotExpressionState(expression);
      console.log('[UserPreferences] Mascot expression updated successfully');
    } catch (error) {
      console.error('[UserPreferences] Update error:', error);
      throw error;
    }
  };

  // Update AI persona in database
  const setAIPersona = async (persona: AIPersona) => {
    if (!user) {
      console.warn('[UserPreferences] Cannot update persona: no user logged in');
      throw new Error('User not logged in');
    }

    try {
      console.log('[UserPreferences] Updating AI persona:', persona);
      console.log('[UserPreferences] User ID:', user.id);
      
      const { error } = await supabase
        .from('profiles')
        .update({ ai_persona: persona })
        .eq('id', user.id); // Changed from user_id to id

      if (error) {
        console.error('[UserPreferences] Error updating persona:', error);
        throw error;
      }

      setAIPersonaState(persona);
      console.log('[UserPreferences] AI persona updated successfully');
    } catch (error) {
      console.error('[UserPreferences] Update error:', error);
      throw error;
    }
  };

  const value: UserPreferencesContextType = {
    mascotExpression,
    aiPersona,
    setMascotExpression,
    setAIPersona,
    loading,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
