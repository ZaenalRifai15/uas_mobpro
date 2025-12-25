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
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Memuat Analytics...</Text>
          <Text style={styles.loadingSubtext}>Menganalisis data survei dengan AI</Text>
        </View>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No analytics data available</Text>
      </View>
    );
  }

  const { survey, statistics, questions_stats, gemini_analysis } = analytics;

  return (
    <View style={styles.container}>
      {/* Header dengan gradient background */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.headerSubtitle}>Detail Survey</Text>
          <Text style={styles.headerTitle}>{survey.title}</Text>
          {survey.description && (
            <Text style={styles.headerDescription}>{survey.description}</Text>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Challenge Badge */}
          <View style={styles.challengeCard}>
            <View style={styles.challengeIcon}>
              <Text style={styles.challengeIconText}>🎯</Text>
            </View>
            <Text style={styles.challengeTitle}>Challenge!</Text>
            <Text style={styles.challengeDescription}>
              {survey.description || 'Selesaikan semua pertanyaan untuk mendapatkan insight yang lengkap'}
            </Text>
          </View>

          {/* Overall Statistics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pertanyaan ({statistics.total_pertanyaan})</Text>
            
            {/* Stats Summary Cards */}
            <View style={styles.statsRow}>
              <View style={styles.statMiniCard}>
                <Text style={styles.statMiniValue}>{statistics.total_responden}</Text>
                <Text style={styles.statMiniLabel}>Total Responden</Text>
              </View>
              <View style={styles.statMiniCard}>
                <Text style={[styles.statMiniValue, { color: '#10B981' }]}>
                  {statistics.setuju_percentage}%
                </Text>
                <Text style={styles.statMiniLabel}>Setuju</Text>
              </View>
              <View style={styles.statMiniCard}>
                <Text style={[styles.statMiniValue, { color: '#EF4444' }]}>
                  {statistics.tidak_setuju_percentage}%
                </Text>
                <Text style={styles.statMiniLabel}>Tidak Setuju</Text>
              </View>
            </View>

            {/* Per Question Cards */}
            {questions_stats.map((question, index) => (
              <View key={question.question_id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionLabel}>PERTANYAAN {index + 1}</Text>
                </View>
                <Text style={styles.questionText}>{question.question_text}</Text>
                
                <View style={styles.answersContainer}>
                  {/* Setuju */}
                  <View style={styles.answerItem}>
                    <View style={styles.answerBadge}>
                      <Text style={styles.answerBadgeText}>Setuju</Text>
                    </View>
                    <View style={styles.answerStats}>
                      <Text style={styles.answerCount}>{question.setuju}</Text>
                      <Text style={styles.answerPercentage}>
                        ({question.setuju_percentage}%)
                      </Text>
                    </View>
                  </View>

                  {/* Tidak Setuju */}
                  <View style={styles.answerItem}>
                    <View style={[styles.answerBadge, styles.answerBadgeNo]}>
                      <Text style={styles.answerBadgeText}>Tidak Setuju</Text>
                    </View>
                    <View style={styles.answerStats}>
                      <Text style={styles.answerCount}>{question.tidak_setuju}</Text>
                      <Text style={styles.answerPercentage}>
                        ({question.tidak_setuju_percentage}%)
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Gemini AI Analysis */}
          {gemini_analysis && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Analysis</Text>
              
              <View style={styles.analysisCard}>
                <View style={styles.analysisHeader}>
                  <Text style={styles.analysisIcon}>🤖</Text>
                  <Text style={styles.analysisLabel}>Gemini AI Insights</Text>
                </View>
                
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSubtitle}>Summary</Text>
                  <Text style={styles.analysisText}>{gemini_analysis.summary}</Text>
                </View>

                <View style={styles.analysisDivider} />

                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSubtitle}>Insight & Recommendations</Text>
                  <Text style={styles.analysisText}>{gemini_analysis.insight}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryButtonText}>Kembali</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 250,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  headerContainer: {
    backgroundColor: '#334155',
    paddingTop: 30,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContent: {
    marginBottom: 0,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  challengeCard: {
    backgroundColor: '#DBEAFE',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeIconText: {
    fontSize: 24,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#1E3A8A',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statMiniCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statMiniValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statMiniLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  questionHeader: {
    marginBottom: 12,
  },
  questionLabel: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
    marginBottom: 16,
    lineHeight: 22,
  },
  answersContainer: {
    gap: 10,
  },
  answerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  answerBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  answerBadgeNo: {
    backgroundColor: '#FEE2E2',
  },
  answerBadgeText: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
  answerStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  answerCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  answerPercentage: {
    fontSize: 12,
    color: '#64748B',
  },
  analysisCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  analysisLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  analysisSection: {
    marginBottom: 16,
  },
  analysisDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  analysisSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#F97316',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#DC2626',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tertiaryButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
});