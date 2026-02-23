import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Modal, TextInput } from "react-native";
import { Usercontext } from "../context/Usercontext";

const ProfileScreen = () => {
  const { userState, dispatch } = useContext(Usercontext);
  const user = userState[0]; // Assuming the first user is the logged-in user

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    nisitid: user?.nisitid || "",
    fullname: user?.fullname || "",
    email: user?.email || "",
    kna: user?.kna || "",
    image: user?.image || null,
  });

  const handleEdit = () => {
    setModalVisible(true);
  };

  const handleSave = () => {
    dispatch({ type: "UPDATE_USER", payload: form });
    setModalVisible(false);
    Alert.alert("Success", "Profile updated successfully");
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Image source={{ uri: user.image }} style={styles.profileImage} />
          <Text style={styles.text}>Student ID: {user.nisitid}</Text>
          <Text style={styles.text}>Name: {user.fullname}</Text>
          <Text style={styles.text}>Email: {user.email}</Text>
          <Text style={styles.text}>Faculty: {user.kna}</Text>

          <TouchableOpacity style={styles.button} onPress={handleEdit}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={() => dispatch({ type: "CLEAR_USERS" })}
          >
            <Text style={styles.buttonText}>Clear All</Text>
          </TouchableOpacity>

          <Modal visible={modalVisible} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <Text style={styles.label}>Student ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Student ID"
                  value={form.nisitid}
                  onChangeText={(text) => setForm({ ...form, nisitid: text })}
                />
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={form.fullname}
                  onChangeText={(text) => setForm({ ...form, fullname: text })}
                />
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={form.email}
                  onChangeText={(text) => setForm({ ...form, email: text })}
                />
                <Text style={styles.label}>Faculty</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Faculty"
                  value={form.kna}
                  onChangeText={(text) => setForm({ ...form, kna: text })}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.clearButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <Text style={styles.text}>No user data available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  clearButton: {
    backgroundColor: "#e53935",
  },
  buttonText: {
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
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

export default ProfileScreen;