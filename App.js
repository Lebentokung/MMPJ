import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { UserProvider } from './src/context/Usercontext';
import { Ionicons } from '@expo/vector-icons';

import Dashboard from './src/Screen/Dashboard';
import Timetable from './src/Screen/Timetable';
import Planner from './src/Screen/Planner';
import Profile from './src/Screen/Profile';

export default function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}

function MainApp() {
  const [tab, setTab] = useState('Dashboard');
  const [plannerAddRequest, setPlannerAddRequest] = useState(false);

  const triggerPlannerAdd = () => {
    setTab('Planner');
    setPlannerAddRequest(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {tab === 'Dashboard' && <Dashboard onPlannerQuickAdd={triggerPlannerAdd} />}
        {tab === 'Timetable' && <Timetable />}
        {tab === 'Planner' && (
          <Planner
            plannerAddRequest={plannerAddRequest}
            clearPlannerAddRequest={() => setPlannerAddRequest(false)}
          />
        )}
        {tab === 'Profile' && <Profile />}
      </View>

      <View style={styles.tabBar}>
        <TabButton title="Dashboard" iconName="home" onPress={() => setTab('Dashboard')} isActive={tab === 'Dashboard'} />
        <TabButton title="Timetable" iconName="calendar" onPress={() => setTab('Timetable')} isActive={tab === 'Timetable'} />
        <TabButton title="Planner" iconName="clipboard" onPress={() => setTab('Planner')} isActive={tab === 'Planner'} />
        <TabButton title="Profile" iconName="person" onPress={() => setTab('Profile')} isActive={tab === 'Profile'} />
      </View>
    </SafeAreaView>
  );
}

function TabButton({ title, iconName, onPress, isActive }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabBtn}>
      <View style={[styles.tabCircle, isActive && styles.activeTabCircle]}>
        <Ionicons name={iconName} size={22} color={isActive ? '#fff' : '#b07090'} />
      </View>
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff0f7',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    height: 76,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#f5d0e8',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 8,
    shadowColor: '#c06090',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fce8f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabCircle: {
    backgroundColor: '#d4609a',
    shadowColor: '#d4609a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  tabText: {
    marginTop: 3,
    fontSize: 10,
    color: '#b07090',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#d4609a',
    fontWeight: '700',
  },
});
