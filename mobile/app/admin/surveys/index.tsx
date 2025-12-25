import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import apiService, { Survey } from '@/services/api';

export default function AdminSurveysScreen() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout, user } = useAuth();

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const data = await apiService.getSurveys();
      setSurveys(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load surveys');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSurveys();
  };

  const handleDeleteSurvey = (id: number, title: string) => {
    Alert.alert(
      'Hapus Survei',
      `Apakah Anda yakin ingin menghapus "${title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteSurvey(id);
              loadSurveys();
              Alert.alert('Sukses', 'Survei berhasil dihapus');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete survey');
            }
          },
        },
      ]
    );
  };

  const renderSurvey = ({ item }: { item: Survey }) => (
    <View style={styles.surveyCard}>
      <View style={styles.cardContent}>
        <Text style={styles.surveyTitle} numberOfLines={2}>{item.title}</Text>
        {item.description && (
          <Text style={styles.surveyDescription} numberOfLines={3}>
            {item.description}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => router.push(`/admin/surveys/${item.id}`)}
      >
        <Text style={styles.viewButtonText}>Lihat Hasil Survey</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ff9e64" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a5f" />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutIcon}>↪</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerContentWrapper}>
          <View style={styles.headerContent}>
            <Text style={styles.headerGreeting}>Hallo..</Text>
            <Text style={styles.headerName}>{user?.name || 'Pengguna'}</Text>
            <Text style={styles.headerSubtitle}>Selamat datang KampusQ</Text>
          </View>

          {/* Magnifying Glass Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('@/assets/images/survey_logo.png')}
              style={styles.magnifyingGlass}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Orange Circle Background */}
        <View style={styles.orangeCircle} />

        {/* Rounded Button */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity 
            style={styles.createSurveyButton}
            onPress={() => router.push('/admin/surveys/create')}
          >
            <Text style={styles.createSurveyButtonText}>Buat Kebijakan Kampus</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Survey List */}
      <FlatList
        data={surveys}
        renderItem={renderSurvey}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada survei</Text>
            <Text style={styles.emptySubtext}>Buat survei pertama Anda sekarang</Text>
          </View>
        }
        scrollIndicatorInsets={{ right: 1 }}
      />
    </SafeAreaView>
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
    backgroundColor: '#f5f5f5',
  },

  /* Header Styles */
  headerContainer: {
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    zIndex: 10,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '400',
  },
  logoutButton: {
    padding: 8,
  },
  logoutIcon: {
    fontSize: 22,
    color: '#fff',
  },

  /* Header Content */
  headerContentWrapper: {
    position: 'relative',
    zIndex: 2,
    marginBottom: 32,
  },
  headerContent: {
    flex: 1,
  },
  headerGreeting: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 4,
  },
  headerName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '400',
  },

  /* Illustration Container */
  illustrationContainer: {
    position: 'absolute',
    right: -30,
    top: -20,
    width: 200,
    height: 200,
    zIndex: 1,
  },
  magnifyingGlass: {
    width: '100%',
    height: '100%',
  },

  /* Orange Circle Background */
  orangeCircle: {
    position: 'absolute',
    right: -80,
    bottom: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#ff9e64',
    opacity: 0.85,
    zIndex: 0,
  },

  /* Button Wrapper */
  buttonWrapper: {
    position: 'relative',
    zIndex: 3,
    marginHorizontal: 0,
  },
  createSurveyButton: {
    backgroundColor: 'rgba(255, 158, 100, 0.95)',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginHorizontal: -20,
    marginLeft: 20,
    marginRight: 20,
  },
  createSurveyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  /* List Content */
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 16,
    paddingBottom: 20,
  },

  /* Survey Card */
  surveyCard: {
    backgroundColor: '#b8cfe8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    marginBottom: 14,
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a5f',
    marginBottom: 8,
    lineHeight: 22,
  },
  surveyDescription: {
    fontSize: 13,
    color: '#445566',
    lineHeight: 18,
  },

  /* View Button */
  viewButton: {
    backgroundColor: '#ff9e64',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
});