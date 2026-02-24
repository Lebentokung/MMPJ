import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACT_KEY = 'activity';

const PlannerScreen = () => {
  const [studyTimes, setStudyTimes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activityName, setActivityName] = useState("");
  const [activityDate, setActivityDate] = useState("");

  const [activity, setActivity] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [actname, setActName] = useState('');
  const [actcode, setActCode] = useState('');
  const [actroom, setActRoom] = useState('');
  const [actday, setActDay] = useState('Mon');
  const [actclassDate, setActClassDate] = useState('');
  const [actclassMonth, setActClassMonth] = useState('');
  const [actstart, setActStart] = useState('09:00');
  const [actend, setActEnd] = useState('10:00');

  useEffect(() => {
    loadPlannerData();
    initializeStudyTimes(); // Add this to initialize study times
  }, []);

  async function loadAct(){
    const raw = await AsyncStorage.getItem(ACT_KEY);
    setActivity(raw? JSON.parse(raw) : []);
  }
  
  async function saveAct(newList){
    setActivity(newList);
    await AsyncStorage.setItem(ACT_KEY, JSON.stringify(newList));
  }

  async function loadPlannerData() {
    try {
      const rawActivities = await AsyncStorage.getItem("activities");
      setActivities(rawActivities ? JSON.parse(rawActivities) : []);
    } catch (error) {
      console.error("Failed to load planner data:", error);
    }
  }

    function openAdd(){
    setEditingId(null);
    setName(''); setCode(''); setRoom(''); setDay('Mon'); setClassDate(''); setClassMonth(''); setStart('09:00'); setEnd('10:00');
    setModalVisible(true);
  }

  function openEdit(item){
    setEditingId(item.id);
    setName(item.name||''); setCode(item.code||''); setRoom(item.room||''); setDay(item.day||'Mon'); setClassDate(item.classDate||''); setClassMonth(item.classMonth||''); setStart(item.start||'09:00'); setEnd(item.end||'10:00');
    setModalVisible(true);
  }

  function addActivity(){
      if (!actname.trim()) return Alert.alert('Please add a subject name');
      
      if (hasTimeConflict(actday, actstart, actend, editingId)) {
        return Alert.alert('Time Conflict', 'This time slot overlaps with another class on ' + actday);
      }
      
      if (editingId){
        const newList = activity.map(it=> it.id===editingId ? {...it, name: actname, code: actcode, room: actroom, day: actday, classDate: actclassDate, classMonth: actclassMonth, start: actstart, end: actend} : it);
        saveAct(newList);
        setEditingId(null);
      } else {
        const item = {id: Date.now().toString(), name: actname, code: actcode, room: actroom, day: actday, classDate: actclassDate, classMonth: actclassMonth, start: actstart, end: actend};
        saveAct([item, ...activity]);
      }
      setModalVisible(false);
    }

  function initializeStudyTimes() {
    const defaultTimes = [
      { id: "1", time: "08:00-10:00", checked: false },
      { id: "2", time: "10:00-12:00", checked: false },
      { id: "3", time: "12:00-14:00", checked: false },
      { id: "4", time: "14:00-16:00", checked: false },
      { id: "5", time: "16:00-18:00", checked: false },
    ];
    setStudyTimes(defaultTimes);
    AsyncStorage.setItem("studyTimes", JSON.stringify(defaultTimes));
  }

  async function saveActivities(newActivities) {
    try {
      setActivities(newActivities);
      await AsyncStorage.setItem("activities", JSON.stringify(newActivities));
    } catch (error) {
      console.error("Failed to save activities:", error);
    }
  }

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dayNames = {
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday',
    'Sun': 'Sunday'
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.header}>Study Time Checklist</Text>
        <FlatList
          data={studyTimes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.checklistItem}>
              <Text>{item.time}</Text>
              <TouchableOpacity
                style={styles.checkButton}
                onPress={() => {
                  const updatedTimes = studyTimes.map((time) =>
                    time.id === item.id
                      ? { ...time, checked: !time.checked }
                      : time
                  );
                  setStudyTimes(updatedTimes);
                  AsyncStorage.setItem("studyTimes", JSON.stringify(updatedTimes));
                }}
              >
                <Text style={{ color: "white" }}>
                  {item.checked ? "Uncheck" : "Check"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <View style={styles.bottomSection}>
        <Text style={{fontWeight:'700', marginVertical:8}}>Planner Activities</Text>
          <FlatList data={days} keyExtractor={d=>d} renderItem={({item})=>{
            const items = activity.filter(i=>i.day===item);
            return (
              <View style={styles.dayBlock}>
                <Text style={styles.dayTitle}>{dayNames[item]}</Text>
                {items.length===0 ? <Text style={{opacity:0.6}}>No classes</Text> : items.map(it=> (
                  <View key={it.id} style={styles.classRow}>
                    <View>
                      <Text style={{fontWeight:'600'}}>{it.name} ({it.code})</Text>
                      {(it.classDate || it.classMonth) ? <Text>{it.classDate || '-'} / {it.classMonth || '-'}</Text> : null}
                      <Text>{it.start} - {it.end} • {it.room}</Text>
                    </View>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                      <TouchableOpacity onPress={()=>openEdit(it)} style={[styles.rowBtn, {marginRight:8}]}><Text>Edit</Text></TouchableOpacity>
                      <TouchableOpacity onPress={()=>remove(it.id)} style={styles.del}><Text>Delete</Text></TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            );
          }} />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add Activity</Text>
            <TextInput
              style={styles.input}
              placeholder="Activity Name"
              value={activityName}
              onChangeText={setActivityName}
            />
            <TextInput
              style={styles.input}
              placeholder="Activity Date"
              value={activityDate}
              onChangeText={setActivityDate}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={addActivity}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topSection: {
    flex: 1,
    padding: 20,
  },
  bottomSection: {
    flex: 1,
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  checklistItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  checkButton: {
    backgroundColor: "#6200ee",
    padding: 10,
    borderRadius: 5,
  },
  activityItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: "#6200ee",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    backgroundColor: "#6200ee",
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: "#fff",
  },
  cancelButton: {
    backgroundColor: "#e53935",
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "#fff",
  },
  modalOverlay:{flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end'},
  modalContent:{backgroundColor:'#fff', padding:16, borderTopLeftRadius:12, borderTopRightRadius:12},
  modalBtn:{flex:1, padding:12, borderRadius:8, alignItems:'center', marginHorizontal:6}
});

export default PlannerScreen;