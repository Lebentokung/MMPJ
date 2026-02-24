import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Modal, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';
import { Alert } from 'react-native';
import { TouchableOpacity } from 'react-native';

const DashboardScreen = () => {
  const [timetable, setTimetable] = useState([]);
  const [exams, setExams] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [viewMode, setViewMode] = useState('Days');

  const [name, setName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [room, setRoom] = useState("");

  const [type, setType] = useState("class");

  useEffect(() => {
    loadTimetable();
  }, []);

  useEffect(() => {
    loadExamtable();
  }, []);

  async function loadTimetable() {
    const raw = await AsyncStorage.getItem("timetable");
    setTimetable(raw ? JSON.parse(raw) : []);
  }

  function getNextClasses() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentMinutes = timeToMinutes(currentTime);
    const todayIndex = now.getDay(); // 0 = Sun, 1 = Mon, ...

    function dayNameToIndex(day) {
      const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return map[day] ?? 1;
    }

    return timetable
      .map((item) => {
        const startMin = timeToMinutes(item.start);
        const dayIndex = dayNameToIndex(item.day);
        let dayDiff = (dayIndex - todayIndex + 7) % 7;
        // if it's today but already passed, treat as next week's occurrence
        if (dayDiff === 0 && startMin <= currentMinutes) dayDiff = 7;
        const minutesUntil = dayDiff * 24 * 60 + (startMin - currentMinutes);
        return { ...item, minutesUntil };
      })
      .sort((a, b) => a.minutesUntil - b.minutesUntil);
  }

  const nextClasses = getNextClasses();

  async function loadExamtable() {
    const raw = await AsyncStorage.getItem("exams");
    setExams(raw ? JSON.parse(raw) : []);
  }

  function getNextExams() {
    return exams.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  }

  const nextExams = getNextExams();

  function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  const handleQuickAdd = async () => {
    if (!name || !start || !end || !room) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const newItem = { id: Date.now().toString(), name, start, end, room };

    try {
      const rawActivities = await AsyncStorage.getItem("activities");
      const activities = rawActivities ? JSON.parse(rawActivities) : [];
      const updatedActivities = [...activities, newItem];
      await AsyncStorage.setItem("activities", JSON.stringify(updatedActivities));

      Alert.alert("Success", "Item added successfully!");
      loadTimetable();
      loadExamtable();
    } catch (error) {
      Alert.alert("Error", "Failed to save data.");
    }

    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
        <Text style={styles.header}>Upcoming Classes</Text>
        {nextClasses.length > 0 ? (
          <FlatList 
            style = {styles.boxlist}
            data={nextClasses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.classItem}>
                <Text style={styles.classText}>{item.name}</Text>
                <Text style={styles.classText}>{item.day}</Text>
                <Text style={styles.classText}>{item.classDate}/{item.classMonth}</Text>
                <Text style={styles.classText}>{item.start} - {item.end}</Text>
                <Text style={styles.classText}>Room: {item.room}</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noClasses}>No upcoming classes</Text>
        )}

        <Text style={styles.header}>กิจกรรมนอกหลักสูตร</Text>
        {nextClasses.length > 0 ? (
          <FlatList
            style = {styles.boxlist}
            data={nextClasses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.examItem}>
                <Text style={styles.classText}>{item.name}</Text>
                <Text style={styles.classText}>{item.start} - {item.end}</Text>
                <Text style={styles.classText}>Room: {item.room}</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noClasses}>No upcoming classes</Text>
        )}

        <Text style={styles.header}>Upcoming Exam</Text>
        {nextExams.length > 0 ? (
          <FlatList
            data={nextExams}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.examItem}>
                <Text style={styles.classText}>{item.title}</Text>
                <Text style={styles.classText}>{item.start} - {item.end}</Text>
                <Text style={styles.classText}>Location: {item.location}</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noClasses}>No upcoming exams</Text>
        )}

        <TouchableOpacity
          style={styles.quickAddButton}
          onPress={() => {
            setModalVisible(true);
          }}
        >
          <Text style={styles.quickAddText}>Quick Add</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Quick Add</Text>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Start"
                value={start}
                onChangeText={setStart}
              />
              <TextInput
                style={styles.input}
                placeholder="End"
                value={end}
                onChangeText={setEnd}
              />
              <TextInput
                style={styles.input}
                placeholder="Room"
                value={room}
                onChangeText={setRoom}
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleQuickAdd}
              >
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
        </Modal>
      </View>
    );
};

      const styles = StyleSheet.create({
        container: {
        flex: 1,
      padding: 20,
      backgroundColor: "#fff",
  },
      header: {
        fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
  },
      classItem: {
        padding: 15,
      marginBottom: 10,
      backgroundColor: "#f0f0f0",
      borderRadius: 5,
  },
      classText: {
        fontSize: 16,
  },
      noClasses: {
        fontSize: 16,
      color: "#888",
      textAlign: "center",
      marginTop: 20,
  },
      examItem: {
        padding: 15,
      marginBottom: 10,
  },
      quickAddButton: {
        position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: "#007BFF",
      padding: 15,
      borderRadius: 50,
  },
      quickAddText: {
        color: "#fff",
      fontWeight: "bold",
  },
      modalOverlay: {
        flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
      modalContent: {
        width: "80%",
      padding: 20,
      backgroundColor: "#fff",
      borderRadius: 10,
      elevation: 5,
  },
      modalHeader: {
        fontSize: 20,
      fontWeight: "bold",
      marginBottom: 15,
  },
      input: {
        width: "100%",
      padding: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
  },
      saveButton: {
        backgroundColor: "#28a745",
      padding: 10,
      borderRadius: 5,
      marginBottom: 10,
  },
      saveButtonText: {
        color: "#fff",
      textAlign: "center",
      fontWeight: "bold",
  },
      cancelButton: {
        backgroundColor: "#dc3545",
      padding: 10,
      borderRadius: 5,
  },
      cancelButtonText: {
        color: "#fff",
      textAlign: "center",
      fontWeight: "bold",
  },
      picker: {
        width: "100%",
      marginBottom: 10,
  },
  boxlist :{
   backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    width: "100%",
    height: 500
  }
});

      export default DashboardScreen;