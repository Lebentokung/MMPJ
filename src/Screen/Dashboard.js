import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DashboardScreen = () => {
  const [timetable, setTimetable] = useState([]);
  const [exams, setExams] = useState([]);

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
    return timetable
      .filter((item) => timeToMinutes(item.start) > currentMinutes)
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upcoming Classes</Text>
      {nextClasses.length > 0 ? (
        <FlatList
          data={nextClasses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.classItem}>
              <Text style={styles.classText}>{item.name}</Text>
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
});

export default DashboardScreen;