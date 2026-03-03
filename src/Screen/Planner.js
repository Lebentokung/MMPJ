import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function PlannerScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>ไม่มีข้อมูล</Text>
        <Text style={styles.emptySub}>Empty planner</Text>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff4fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ead7e3',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6b3550',
  },
  emptySub: {
    marginTop: 6,
    color: '#8d7f87',
  },
});
