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

const PlannerScreen = () => {
  const [studyTimes, setStudyTimes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activityName, setActivityName] = useState("");
  const [activityDate, setActivityDate] = useState("");

  useEffect(() => {
    loadPlannerData();
    initializeStudyTimes(); // Add this to initialize study times
  }, []);

  async function loadPlannerData() {
    try {
      const rawStudyTimes = await AsyncStorage.getItem("studyTimes");
      setStudyTimes(rawStudyTimes ? JSON.parse(rawStudyTimes) : []);

      const rawActivities = await AsyncStorage.getItem("activities");
      setActivities(rawActivities ? JSON.parse(rawActivities) : []);
    } catch (error) {
      console.error("Failed to load planner data:", error);
    }
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

  function addActivity() {
    if (!activityName.trim() || !activityDate.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const newActivity = {
      id: Date.now().toString(),
      name: activityName,
      date: activityDate,
    };

    const updatedActivities = [newActivity, ...activities];
    saveActivities(updatedActivities);
    setActivityName("");
    setActivityDate("");
    setModalVisible(false);
  }

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
        <Text style={styles.header}>Extracurricular Activities</Text>
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.activityItem}>
              <Text>{item.name}</Text>
              <Text>{item.date}</Text>
            </View>
          )}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Activity</Text>
        </TouchableOpacity>
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
});

export default PlannerScreen;
