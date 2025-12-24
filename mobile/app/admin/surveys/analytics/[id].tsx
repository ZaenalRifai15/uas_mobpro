import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import apiService from '@/services/api';

interface QuestionStat {
  question_id: number;
  question_text: string;
  setuju: number;
  tidak_setuju: number;
  setuju_percentage: number;
  tidak_setuju_percentage: number;
}

interface Analytics {
  survey: {
    id: number;
    title: string;
    description: string;
    is_active: boolean;
  };
  statistics: {
    total_responden: number;
    total_pertanyaan: number;
    total_setuju: number;
    total_tidak_setuju: number;
    setuju_percentage: number;
    tidak_setuju_percentage: number;
  };
  questions_stats: QuestionStat[];
  gemini_analysis: {
    summary: string;
    insight: string;
  } | null;
}

export default function SurveyAnalyticsScreen() {
  const { id } = useLocalSearchParams();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [id]);

  const loadAnalytics = async () => {
    try {
      const data = await apiService.getSurveyAnalytics(Number(id));
      setAnalytics(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load analytics');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.centerContainer}>
        <Text>No analytics data available</Text>
      </View>
    );
  }

  const { survey, statistics, questions_stats, gemini_analysis } = analytics;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Survey Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{survey.title}</Text>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: survey.is_active ? '#34C759' : '#FF3B30' },
              ]}
            />
            <Text style={styles.statusText}>
              {survey.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
          {survey.description && (
            <Text style={styles.description}>{survey.description}</Text>
          )}
        </View>

        {/* Overall Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Overall Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{statistics.total_responden}</Text>
              <Text style={styles.statLabel}>Total Responden</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{statistics.total_pertanyaan}</Text>
              <Text style={styles.statLabel}>Total Questions</Text>
            </View>
          </View>

          <View style={styles.answersCard}>
            <View style={styles.answerRow}>
              <View style={styles.answerInfo}>
                <View style={[styles.answerDot, { backgroundColor: '#34C759' }]} />
                <Text style={styles.answerLabel}>Setuju</Text>
              </View>
              <Text style={styles.answerValue}>
                {statistics.total_setuju} ({statistics.setuju_percentage}%)
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${statistics.setuju_percentage}%`,
                    backgroundColor: '#34C759',
                  },
                ]}
              />
            </View>

            <View style={styles.answerRow}>
              <View style={styles.answerInfo}>
                <View style={[styles.answerDot, { backgroundColor: '#FF3B30' }]} />
                <Text style={styles.answerLabel}>Tidak Setuju</Text>
              </View>
              <Text style={styles.answerValue}>
                {statistics.total_tidak_setuju} ({statistics.tidak_setuju_percentage}%)
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${statistics.tidak_setuju_percentage}%`,
                    backgroundColor: '#FF3B30',
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Per Question Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Statistics per Question</Text>
          {questions_stats.map((question, index) => (
            <View key={question.question_id} style={styles.questionCard}>
              <Text style={styles.questionNumber}>Question {index + 1}</Text>
              <Text style={styles.questionText}>{question.question_text}</Text>

              <View style={styles.questionStats}>
                <View style={styles.statRow}>
                  <View style={styles.statRowHeader}>
                    <View
                      style={[styles.statDot, { backgroundColor: '#34C759' }]}
                    />
                    <Text style={styles.statRowLabel}>Setuju</Text>
                  </View>
                  <Text style={styles.statRowValue}>
                    {question.setuju} ({question.setuju_percentage}%)
                  </Text>
                </View>
                <View style={styles.miniProgressBar}>
                  <View
                    style={[
                      styles.miniProgressFill,
                      {
                        width: `${question.setuju_percentage}%`,
                        backgroundColor: '#34C759',
                      },
                    ]}
                  />
                </View>

                <View style={styles.statRow}>
                  <View style={styles.statRowHeader}>
                    <View
                      style={[styles.statDot, { backgroundColor: '#FF3B30' }]}
                    />
                    <Text style={styles.statRowLabel}>Tidak Setuju</Text>
                  </View>
                  <Text style={styles.statRowValue}>
                    {question.tidak_setuju} ({question.tidak_setuju_percentage}%)
                  </Text>
                </View>
                <View style={styles.miniProgressBar}>
                  <View
                    style={[
                      styles.miniProgressFill,
                      {
                        width: `${question.tidak_setuju_percentage}%`,
                        backgroundColor: '#FF3B30',
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Gemini AI Analysis */}
        {gemini_analysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤖 AI Analysis by Gemini</Text>
            
            <View style={styles.analysisCard}>
              <Text style={styles.analysisTitle}>Summary</Text>
              <Text style={styles.analysisText}>{gemini_analysis.summary}</Text>
            </View>

            <View style={styles.analysisCard}>
              <Text style={styles.analysisTitle}>Insight & Recommendations</Text>
              <Text style={styles.analysisText}>{gemini_analysis.insight}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Surveys</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  answersCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  answerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  answerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  answerLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  answerValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  questionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionNumber: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 6,
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 12,
  },
  questionStats: {
    marginTop: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statRowLabel: {
    fontSize: 14,
    color: '#666',
  },
  statRowValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  miniProgressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  analysisCard: {
    backgroundColor: '#E6F4FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  backButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#fff',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
