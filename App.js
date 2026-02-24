import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { UserProvider } from './src/context/Usercontext';
import { Ionicons } from '@expo/vector-icons';

import Register from './src/Screen/Register';
import Dashboard from './src/Screen/Dashboard';
import Timetable from './src/Screen/Timetable';
import Planner from './src/Screen/Planner';
import Profile from './src/Screen/Profile';

export default function App(){

  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  );
}

function MainApp(){

  const [isAuth, setIsAuth] = useState(false);
  const [tab, setTab] = useState('Profile');

  // if(!isAuth){
  //   return (
  //     <SafeAreaView style={{flex:1}}>
  //       <Register onRegisterSuccess={() => setIsAuth(true)} />
  //     </SafeAreaView>
  //   );
  // }

  function renderScreen(){
    switch(tab){
      case 'Dashboard': return <Dashboard />;
      case 'Timetable': return <Timetable />;
      case 'Planner': return <Planner />;
      case 'Profile': return <Profile />;
      default: return <Dashboard />;
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>

       <View style={styles.tabBar}>
        <TabButton
          title="Dashboard"
          iconName="home"
          onPress={() => setTab('Dashboard')}
          isActive={tab === 'Dashboard'}
        />
        <TabButton
          title="Timetable"
          iconName="calendar"
          onPress={() => setTab('Timetable')}
          isActive={tab === 'Timetable'}
        />
        <TabButton
          title="Planner"
          iconName="clipboard"
          onPress={() => setTab('Planner')}
          isActive={tab === 'Planner'}
        />
        <TabButton
          title="Profile"
          iconName="person"
          onPress={() => setTab('Profile')}
          isActive={tab === 'Profile'}
        />
      </View>
    </SafeAreaView>
  );
}

function TabButton({ title, iconName, onPress, isActive }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabButton}>
      <View style={[styles.tabCircle, isActive && styles.activeTabCircle]}>
        <Ionicons name={iconName} size={24} color={isActive ? 'white' : 'black'} />
      </View>
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#fff'
  },
  content:{
    flex:1
  },
 tabBar:{
    height:72,
    flexDirection:'row',
    borderTopWidth:1,
    borderColor:'#eee',
    backgroundColor:'#f7eaf3',
    alignItems:'center',
    justifyContent:'space-around',
    marginBottom: 20, // Adjusted to move the tab bar higher
  },
  tabBtn:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
    paddingVertical:10
  },
  tabText:{
    color:'#6b3550'
  },
  tabActive:{
    backgroundColor:'#f0c8df',
    borderRadius:20,
    marginHorizontal:6
  },
  tabTextActive:{
    fontWeight:'700',
    color:'#3b1730'
  },
    tabCircle:{
    width:60,
    height:60,
    borderRadius:50,
    backgroundColor:'#e0e0e0',
    justifyContent:'center',
    alignItems:'center',
  },
  activeTabCircle:{
    backgroundColor:'#6200ee',
  },
});
