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
  Platform,
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

  const handleDeleteSurvey = async (id: number, title: string) => {
    console.log('handleDeleteSurvey called for:', id, title);
    console.log('Platform:', Platform.OS);
    
    // For web, use window.confirm since Alert.alert doesn't work
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Apakah Anda yakin ingin menghapus "${title}"?\n\nSemua data terkait (pertanyaan, jawaban, dan analisis) akan ikut terhapus.`
      );
      
      if (!confirmed) {
        console.log('Delete cancelled by user');
        return;
      }

      console.log('User confirmed delete, starting deletion for ID:', id);
      try {
        console.log('Calling apiService.deleteSurvey with ID:', id);
        const result = await apiService.deleteSurvey(id);
        console.log('Delete API response:', JSON.stringify(result));
        
        alert(result?.message || 'Survei berhasil dihapus');
        console.log('Reloading surveys list');
        loadSurveys();
      } catch (error: any) {
        console.error('Delete error caught:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        alert(`Gagal menghapus survey: ${error.message || 'Unknown error'}`);
      }
    } else {
      // For mobile, use Alert.alert
      Alert.alert(
        'Hapus Survei',
        `Apakah Anda yakin ingin menghapus "${title}"?\n\nSemua data terkait (pertanyaan, jawaban, dan analisis) akan ikut terhapus.`,
        [
          { 
            text: 'Batal', 
            style: 'cancel',
            onPress: () => console.log('Delete cancelled by user')
          },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: async () => {
              console.log('User confirmed delete, starting deletion for ID:', id);
              try {
                console.log('Calling apiService.deleteSurvey with ID:', id);
                const result = await apiService.deleteSurvey(id);
                console.log('Delete API response:', JSON.stringify(result));
                
                Alert.alert(
                  'Sukses', 
                  result?.message || 'Survei berhasil dihapus',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        console.log('Reloading surveys list');
                        loadSurveys();
                      },
                    },
                  ]
                );
              } catch (error: any) {
                console.error('Delete error caught:', error);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
                
                Alert.alert(
                  'Error', 
                  `Gagal menghapus survey: ${error.message || 'Unknown error'}`
                );
              }
            },
          },
        ]
      );
    }
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

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => router.push(`/admin/surveys/${item.id}`)}
        >
          <Text style={styles.viewButtonText}>Lihat Hasil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButtonSmall}
          onPress={() => handleDeleteSurvey(item.id, item.title)}
        >
          <Text style={styles.deleteButtonSmallText}>🗑️ Hapus</Text>
        </TouchableOpacity>
      </View>
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
            <Text style={styles.logoutIcon}>⎋</Text>
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
    fontSize: 32,
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
    backgroundColor: '#0C203B4A',
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

  /* Button Row */
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },

  /* View Button */
  viewButton: {
    flex: 1,
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

  /* Delete Button Small */
  deleteButtonSmall: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  deleteButtonSmallText: {
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