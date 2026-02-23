import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DashboardScreen = () => {
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    loadTimetable();
  }, []);

  async function loadTimetable() {
    const raw = await AsyncStorage.getItem("timetable");
    setTimetable(raw ? JSON.parse(raw) : []);
  }

  function getNextClasses() {
    const now = new Date();
    const currentTime = `${now.getHours()}:${now.getMinutes()}`;
    return timetable
      .filter((item) => item.start > currentTime)
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  const nextClasses = getNextClasses();

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
});

export default DashboardScreen;
