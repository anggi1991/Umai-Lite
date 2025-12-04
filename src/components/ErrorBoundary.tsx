import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ Error Boundary caught error:', error);
    console.error('Error Info:', errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>⚠️ Something went wrong</Text>
            
            <Text style={styles.subtitle}>Error Details:</Text>
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {this.state.error?.toString()}
              </Text>
            </View>

            {this.state.errorInfo && (
              <>
                <Text style={styles.subtitle}>Component Stack:</Text>
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                </View>
              </>
            )}

            <Text style={styles.helpText}>
              Common fixes:{'\n'}
              • Check Supabase connection{'\n'}
              • Verify .env variables{'\n'}
              • Clear cache and restart{'\n'}
              • Check console for details
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  errorText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
  helpText: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    fontSize: 14,
    lineHeight: 22,
    color: '#856404',
  },
});
