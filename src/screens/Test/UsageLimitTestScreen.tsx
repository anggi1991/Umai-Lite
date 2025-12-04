import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Card, ActivityIndicator, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { runUsageLimitTests } from '../../tests/usageLimitIntegrationTest';

interface TestResult {
  testName: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

export default function UsageLimitTestScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [summary, setSummary] = useState({ total: 0, passed: 0, failed: 0 });

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      const results = await runUsageLimitTests();
      setTestResults(results);
      
      const passed = results.filter(r => r.status === 'PASS').length;
      const failed = results.filter(r => r.status === 'FAIL').length;
      
      setSummary({
        total: results.length,
        passed,
        failed,
      });
    } catch (error: any) {
      console.error('Test execution error:', error);
      setTestResults([{
        testName: 'Test Execution',
        status: 'FAIL',
        message: error.message,
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            🧪 Usage Limit Integration Test
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Test monetization flow untuk Free tier limits
          </Text>
        </View>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.infoTitle}>
              📋 Test Coverage
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              • Initial usage status (Free tier limits)
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              • Increment usage count (AI tips 1, 2, 3)
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              • Limit reached scenario (4th tip fails)
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              • Chat message limits (10 messages)
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              • USAGE_LIMIT_REACHED error handling
            </Text>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleRunTests}
          disabled={isRunning}
          style={styles.runButton}
          icon="play"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>

        {isRunning && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Executing test suite...</Text>
          </View>
        )}

        {testResults.length > 0 && (
          <>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.summaryTitle}>
                  📊 Test Results
                </Text>
                <View style={styles.summaryRow}>
                  <Text variant="bodyLarge">Total: {summary.total}</Text>
                  <Text variant="bodyLarge" style={styles.passedText}>
                    ✅ Passed: {summary.passed}
                  </Text>
                  <Text variant="bodyLarge" style={styles.failedText}>
                    ❌ Failed: {summary.failed}
                  </Text>
                </View>
              </Card.Content>
            </Card>

            <Divider style={styles.divider} />

            {testResults.map((result, index) => (
              <Card
                key={index}
                style={[
                  styles.resultCard,
                  result.status === 'PASS' ? styles.passCard : styles.failCard,
                ]}
              >
                <Card.Content>
                  <View style={styles.resultHeader}>
                    <Text variant="titleMedium" style={styles.resultTitle}>
                      {result.status === 'PASS' ? '✅' : '❌'} {result.testName}
                    </Text>
                    <Text
                      variant="labelLarge"
                      style={[
                        styles.statusBadge,
                        result.status === 'PASS'
                          ? styles.passBadge
                          : styles.failBadge,
                      ]}
                    >
                      {result.status}
                    </Text>
                  </View>
                  
                  <Text variant="bodyMedium" style={styles.resultMessage}>
                    {result.message}
                  </Text>
                  
                  {result.details && (
                    <View style={styles.detailsContainer}>
                      <Text variant="labelMedium" style={styles.detailsLabel}>
                        Details:
                      </Text>
                      <Text variant="bodySmall" style={styles.detailsText}>
                        {JSON.stringify(result.details, null, 2)}
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            ⚠️ Note: Tests will reset your current usage limits
          </Text>
          <Text variant="bodySmall" style={styles.footerText}>
            Make sure database migration is applied before running
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#e3f2fd',
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1976d2',
  },
  infoText: {
    marginBottom: 6,
    color: '#333',
  },
  runButton: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  summaryCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  summaryTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  passedText: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
  failedText: {
    color: '#f44336',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  resultCard: {
    marginBottom: 12,
  },
  passCard: {
    backgroundColor: '#f1f8f4',
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  failCard: {
    backgroundColor: '#fef5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    flex: 1,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  passBadge: {
    backgroundColor: '#4caf50',
    color: '#fff',
  },
  failBadge: {
    backgroundColor: '#f44336',
    color: '#fff',
  },
  resultMessage: {
    color: '#333',
    marginBottom: 8,
  },
  detailsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  detailsLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  detailsText: {
    fontFamily: 'monospace',
    color: '#333',
  },
  footer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
  },
  footerText: {
    color: '#856404',
    marginBottom: 4,
  },
});
