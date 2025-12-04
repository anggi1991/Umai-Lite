import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Divider, ActivityIndicator } from 'react-native-paper';
import { runAllTests as runAnalyticsTests, testAnalyticsService, testSubscriptionService } from '../../tests/analyticsSubscriptionTest';
import { runUsageLimitsTests } from '../../tests/usageLimitsTest';

export default function TestAnalyticsScreen() {
  const [testOutput, setTestOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (message: string) => {
    setTestOutput(prev => [...prev, message]);
  };

  const runTests = async (testType: 'all' | 'analytics' | 'subscription' | 'usage-limits') => {
    setIsRunning(true);
    setTestOutput([]);
    
    // Override console.log to capture output
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      addLog(args.join(' '));
      originalLog(...args);
    };

    try {
      switch (testType) {
        case 'all':
          await runAnalyticsTests();
          addLog('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          await runUsageLimitsTests();
          break;
        case 'analytics':
          await testAnalyticsService();
          break;
        case 'subscription':
          await testSubscriptionService();
          break;
        case 'usage-limits':
          await runUsageLimitsTests();
          break;
      }
    } catch (error) {
      addLog(`Error: ${error}`);
    } finally {
      console.log = originalLog;
      setIsRunning(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Title 
            title="🧪 Test Suite" 
            subtitle="Run tests to verify monetization features"
          />
          <Card.Content>
            <Text style={styles.sectionTitle}>📊 Core Services</Text>
            <View style={styles.buttonGroup}>
              <Button
                mode="outlined"
                onPress={() => runTests('analytics')}
                disabled={isRunning}
                style={styles.button}
                icon="chart-line"
              >
                Analytics Service
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => runTests('subscription')}
                disabled={isRunning}
                style={styles.button}
                icon="card-account-details"
              >
                Subscription Service
              </Button>
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>💰 Monetization Features</Text>
            <View style={styles.buttonGroup}>
              <Button
                mode="contained"
                onPress={() => runTests('usage-limits')}
                disabled={isRunning}
                style={styles.button}
                icon="shield-check"
              >
                Usage Limits & Referrals (8 Tests)
              </Button>
            </View>

            <Divider style={styles.divider} />

            <Button
              mode="contained-tonal"
              onPress={() => runTests('all')}
              disabled={isRunning}
              style={styles.button}
              icon="play-circle"
            >
              🚀 Run All Tests
            </Button>

            {isRunning && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" />
                <Text style={styles.loadingText}>Running tests...</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {testOutput.length > 0 && (
          <Card style={styles.outputCard}>
            <Card.Title title="Test Output" />
            <Card.Content>
              <ScrollView style={styles.outputScroll}>
                {testOutput.map((line, index) => (
                  <Text key={index} style={styles.outputText}>
                    {line}
                  </Text>
                ))}
              </ScrollView>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  description: {
    marginBottom: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
    color: '#333',
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    marginVertical: 4,
  },
  divider: {
    marginVertical: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  outputCard: {
    marginBottom: 16,
  },
  outputScroll: {
    maxHeight: 400,
  },
  outputText: {
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
});
