import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  Pressable,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Usercontext } from "../context/Usercontext";

const ProfileScreen = () => {
  const { profile, saveProfile, resetAppDataExceptProfile } = useContext(Usercontext);

  const [editStudentId, setEditStudentId] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editFaculty, setEditFaculty] = useState("");
  const [editAvatar, setEditAvatar] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);

  const openEditModal = () => {
    setEditStudentId(profile.studentId);
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditYear(profile.year);
    setEditFaculty(profile.faculty);
    setEditAvatar(profile.avatar);
    setModalVisible(true);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("ต้องอนุญาตให้เข้าถึงรูปภาพก่อน");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setEditAvatar(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    saveProfile({
      studentId: editStudentId,
      name: editName,
      email: editEmail,
      year: editYear,
      faculty: editFaculty,
      avatar: editAvatar,
    });

    setModalVisible(false);
    Alert.alert("บันทึกข้อมูลเรียบร้อย");
  };

  const handleDelete = () => {
    Alert.alert("ลบข้อมูลทั้งหมด", "ต้องการลบทั้งหมด ยกเว้นโปรไฟล์ หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: () => {
          resetAppDataExceptProfile();
          Alert.alert("ลบข้อมูลเรียบร้อย");
        },
      },
    ]);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Profile</Text>

        <TouchableOpacity style={styles.avatarContainer} onPress={openEditModal}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person-outline" size={60} color="#b76e99" />
          )}
        </TouchableOpacity>

        <Text style={styles.subheader}>รหัสนิสิต</Text> 
        <TextInput style={styles.input} value={profile.studentId} editable={false} placeholder="รหัสนิสิต" />
        <Text style={styles.subheader}>ชื่อ</Text>
        <TextInput style={styles.input} value={profile.name} editable={false} placeholder="ชื่อ" />
        <Text style={styles.subheader}>อีเมล</Text>
        <TextInput style={styles.input} value={profile.email} editable={false} placeholder="อีเมล" />
        <Text style={styles.subheader}>ชั้นปี</Text>
        <TextInput style={styles.input} value={profile.year} editable={false} placeholder="ชั้นปี" />
        <Text style={styles.subheader}>คณะ</Text>
        <TextInput style={styles.input} value={profile.faculty} editable={false} placeholder="คณะ" />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Text style={styles.buttonText}>EDIT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.buttonText}>DELETE ALL DATA</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Edit Profile</Text>

            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
              {editAvatar ? (
                <Image source={{ uri: editAvatar }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person-outline" size={60} color="#fde3f2" />
              )}
            </TouchableOpacity>

            <TextInput style={styles.input} value={editStudentId} onChangeText={setEditStudentId} placeholder="รหัสนิสิต" />
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="ชื่อ" />
            <TextInput style={styles.input} value={editEmail} onChangeText={setEditEmail} placeholder="Email" />
            <TextInput style={styles.input} value={editYear} onChangeText={setEditYear} placeholder="ชั้นปี" />
            <TextInput style={styles.input} value={editFaculty} onChangeText={setEditFaculty} placeholder="คณะ" />

            <View style={{ flexDirection: "row", marginTop: 12 }}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalBtn, { backgroundColor: "#b96aa2" }]}
                onPress={handleSave}
              >
                <Text style={{ color: "#fff" }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff4fb",
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#7a3e65",
  },
  subheader: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "left",
    marginLeft:28,
    marginBottom: 5,
    color: "#7a3e65",
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ececec",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    width: "80%",
    alignSelf: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#b76e99",
    padding: 12,
    borderRadius: 10,
    width: "40%",
    alignItems: "center",
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: "#d9534f",
    padding: 12,
    borderRadius: 10,
    width: "40%",
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 6,
  },
});

export default ProfileScreen;