import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { UserProvider } from './src/context/Usercontext';

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

  if(!isAuth){
    return (
      <SafeAreaView style={{flex:1}}>
        <Register onRegisterSuccess={() => setIsAuth(true)} />
      </SafeAreaView>
    );
  }

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
          label="Dashboard" 
          active={tab==='Dashboard'} 
          onPress={()=>setTab('Dashboard')} 
        />
        <TabButton 
          label="Timetable" 
          active={tab==='Timetable'} 
          onPress={()=>setTab('Timetable')} 
        />
        <TabButton 
          label="Planner" 
          active={tab==='Planner'} 
          onPress={()=>setTab('Planner')} 
        />
        <TabButton 
          label="Profile" 
          active={tab==='Profile'} 
          onPress={()=>setTab('Profile')} 
        />
      </View>
    </SafeAreaView>
  );
}

function TabButton({label, active, onPress}){
  return (
    <TouchableOpacity 
      style={[styles.tabBtn, active && styles.tabActive]} 
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
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
    justifyContent:'space-around'
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
  }
});
