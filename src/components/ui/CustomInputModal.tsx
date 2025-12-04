import React from 'react';
import { Modal, View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import theme from '../../theme';

interface CustomInputModalProps {
  visible: boolean;
  title: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export const CustomInputModal: React.FC<CustomInputModalProps> = ({
  visible,
  title,
  placeholder,
  onSubmit,
  onCancel,
}) => {
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    if (!visible) setValue('');
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            autoFocus
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={onCancel}>
              <Text style={styles.buttonText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={() => onSubmit(value)}
            >
              <Text style={[styles.buttonText, styles.submitText]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
