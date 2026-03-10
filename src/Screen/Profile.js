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

const PINK = {
  primary: '#d4609a',
  light: '#fce8f5',
  medium: '#f0aed4',
  dark: '#8c2f60',
  bg: '#fff8fc',
  card: '#fff',
  border: '#f5d0e8',
  text: '#5a1f40',
  sub: '#9e6080',
};

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

  const fields = [
    { icon: 'card-outline', label: 'รหัสนิสิต', value: profile.studentId, placeholder: 'ยังไม่ได้กรอก' },
    { icon: 'person-outline', label: 'ชื่อ-สกุล', value: profile.name, placeholder: 'ยังไม่ได้กรอก' },
    { icon: 'mail-outline', label: 'อีเมล', value: profile.email, placeholder: 'ยังไม่ได้กรอก' },
    { icon: 'school-outline', label: 'ชั้นปี', value: profile.year, placeholder: 'ยังไม่ได้กรอก' },
    { icon: 'business-outline', label: 'คณะ', value: profile.faculty, placeholder: 'ยังไม่ได้กรอก' },
  ];

  return (
    <>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerBand}>
          <Text style={styles.appTitle}>👤 Profile</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={openEditModal}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={52} color={PINK.primary} />
            )}
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{profile.name || 'ยังไม่ได้ตั้งชื่อ'}</Text>
          <Text style={styles.profileSub}>{profile.faculty || ''}</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          {fields.map((field, idx) => (
            <View key={idx} style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name={field.icon} size={18} color={PINK.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{field.label}</Text>
                <Text style={[styles.infoValue, !field.value && styles.infoEmpty]}>
                  {field.value || field.placeholder}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Ionicons name="pencil" size={16} color="#fff" />
            <Text style={styles.btnText}>แก้ไขข้อมูล</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={16} color="#e05070" />
          <Text style={styles.deleteBtnText}>ลบข้อมูลทั้งหมด</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>✏️ แก้ไขข้อมูลโปรไฟล์</Text>

            <TouchableOpacity style={styles.avatarPickerBtn} onPress={pickImage}>
              {editAvatar ? (
                <Image source={{ uri: editAvatar }} style={styles.modalAvatarImg} />
              ) : (
                <View style={styles.modalAvatarPlaceholder}>
                  <Ionicons name="camera" size={28} color={PINK.primary} />
                  <Text style={styles.avatarPickerText}>เพิ่มรูปภาพ</Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput style={styles.input} value={editStudentId} onChangeText={setEditStudentId} placeholder="รหัสนิสิต" placeholderTextColor="#cca0bb" />
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="ชื่อ-สกุล" placeholderTextColor="#cca0bb" />
            <TextInput style={styles.input} value={editEmail} onChangeText={setEditEmail} placeholder="อีเมล" placeholderTextColor="#cca0bb" />
            <TextInput style={styles.input} value={editYear} onChangeText={setEditYear} placeholder="ชั้นปี" placeholderTextColor="#cca0bb" />
            <TextInput style={styles.input} value={editFaculty} onChangeText={setEditFaculty} placeholder="คณะ" placeholderTextColor="#cca0bb" />

            <View style={styles.modalBtns}>
              <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.saveBtn]} onPress={handleSave}>
                <Text style={styles.saveBtnText}>บันทึก</Text>
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
    backgroundColor: PINK.bg,
    paddingBottom: 40,
  },
  headerBand: {
    backgroundColor: PINK.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: PINK.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 8,
  },
  appTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: PINK.light,
    borderWidth: 3,
    borderColor: PINK.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: PINK.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: PINK.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '800',
    color: PINK.text,
  },
  profileSub: {
    fontSize: 13,
    color: PINK.sub,
    marginTop: 2,
  },
  infoSection: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: PINK.border,
    overflow: 'hidden',
    shadowColor: PINK.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: PINK.border,
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PINK.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: PINK.sub, fontWeight: '600', marginBottom: 1 },
  infoValue: { fontSize: 14, color: PINK.text, fontWeight: '600' },
  infoEmpty: { color: '#ccc', fontWeight: '400' },
  buttonRow: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  editButton: {
    backgroundColor: PINK.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    shadowColor: PINK.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  deleteButton: {
    marginHorizontal: 20,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ffc0cc',
    backgroundColor: '#fff5f7',
  },
  deleteBtnText: { color: '#e05070', fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#e0c0d0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: PINK.text, marginBottom: 14 },
  avatarPickerBtn: {
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalAvatarImg: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2, borderColor: PINK.primary,
  },
  modalAvatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 2, borderColor: PINK.border,
    borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: PINK.light,
  },
  avatarPickerText: { fontSize: 10, color: PINK.sub, marginTop: 4 },
  input: {
    borderWidth: 1.5, borderColor: PINK.border,
    padding: 10, borderRadius: 10,
    marginVertical: 5, backgroundColor: PINK.bg,
    color: PINK.text, fontSize: 14,
  },
  modalBtns: { flexDirection: 'row', marginTop: 14, gap: 10 },
  modalBtn: { flex: 1, padding: 13, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f3eaf0' },
  saveBtn: { backgroundColor: PINK.primary },
  cancelBtnText: { color: PINK.sub, fontWeight: '700' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
});

export default ProfileScreen;





// import React, { useContext, useState } from "react";
// import {
//   View, Text, TextInput, StyleSheet, TouchableOpacity,
//   Alert, ScrollView, Modal, Pressable, Image,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import { Usercontext } from "../context/Usercontext";

// const PINK = {
//   primary: '#d4609a',
//   light: '#fce8f5',
//   medium: '#f0aed4',
//   dark: '#8c2f60',
//   bg: '#fff8fc',
//   card: '#fff',
//   border: '#f5d0e8',
//   text: '#5a1f40',
//   sub: '#9e6080',
// };

// const ProfileScreen = () => {
//   const { profile, saveProfile, resetAppData } = useContext(Usercontext);

//   const [editStudentId, setEditStudentId] = useState("");
//   const [editName, setEditName] = useState("");
//   const [editEmail, setEditEmail] = useState("");
//   const [editYear, setEditYear] = useState("");
//   const [editFaculty, setEditFaculty] = useState("");
//   const [editAvatar, setEditAvatar] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);

//   const openEditModal = () => {
//     setEditStudentId(profile.studentId);
//     setEditName(profile.name);
//     setEditEmail(profile.email);
//     setEditYear(profile.year);
//     setEditFaculty(profile.faculty);
//     setEditAvatar(profile.avatar);
//     setModalVisible(true);
//   };

//   const pickImage = async () => {
//     const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permission.granted) {
//       Alert.alert("ต้องอนุญาตให้เข้าถึงรูปภาพก่อน");
//       return;
//     }
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true, aspect: [1, 1], quality: 1,
//     });
//     if (!result.canceled) setEditAvatar(result.assets[0].uri);
//   };

//   const handleSave = () => {
//     saveProfile({ studentId: editStudentId, name: editName, email: editEmail, year: editYear, faculty: editFaculty, avatar: editAvatar });
//     setModalVisible(false);
//     Alert.alert("✅ บันทึกข้อมูลเรียบร้อย");
//   };

//   const handleDelete = () => {
  //   Alert.alert("ลบข้อมูลทั้งหมด", "ต้องการลบทั้งหมด ยกเว้นโปรไฟล์ หรือไม่?", [
  //     { text: "ยกเลิก", style: "cancel" },
  //     {
  //       text: "ลบ",
  //       style: "destructive",
  //       onPress: () => {
  //         resetAppDataExceptProfile();
  //         Alert.alert("ลบข้อมูลเรียบร้อย");
  //       },
  //     },
  //   ]);
  // };

//   const fields = [
//     { icon: 'card-outline', label: 'รหัสนิสิต', value: profile.studentId, placeholder: 'ยังไม่ได้กรอก' },
//     { icon: 'person-outline', label: 'ชื่อ-สกุล', value: profile.name, placeholder: 'ยังไม่ได้กรอก' },
//     { icon: 'mail-outline', label: 'อีเมล', value: profile.email, placeholder: 'ยังไม่ได้กรอก' },
//     { icon: 'school-outline', label: 'ชั้นปี', value: profile.year, placeholder: 'ยังไม่ได้กรอก' },
//     { icon: 'business-outline', label: 'คณะ', value: profile.faculty, placeholder: 'ยังไม่ได้กรอก' },
//   ];

//   return (
//     <>
//       <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
//         {/* Header */}
//         <View style={styles.headerBand}>
//           <Text style={styles.appTitle}>👤 Profile</Text>
//         </View>

//         {/* Avatar */}
//         <View style={styles.avatarSection}>
//           <TouchableOpacity style={styles.avatarContainer} onPress={openEditModal}>
//             {profile.avatar ? (
//               <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
//             ) : (
//               <Ionicons name="person" size={52} color={PINK.primary} />
//             )}
//             <View style={styles.avatarEditBadge}>
//               <Ionicons name="camera" size={12} color="#fff" />
//             </View>
//           </TouchableOpacity>
//           <Text style={styles.profileName}>{profile.name || 'ยังไม่ได้ตั้งชื่อ'}</Text>
//           <Text style={styles.profileSub}>{profile.faculty || ''}</Text>
//         </View>

//         {/* Info Cards */}
//         <View style={styles.infoSection}>
//           {fields.map((field, idx) => (
//             <View key={idx} style={styles.infoRow}>
//               <View style={styles.infoIcon}>
//                 <Ionicons name={field.icon} size={18} color={PINK.primary} />
//               </View>
//               <View style={styles.infoContent}>
//                 <Text style={styles.infoLabel}>{field.label}</Text>
//                 <Text style={[styles.infoValue, !field.value && styles.infoEmpty]}>
//                   {field.value || field.placeholder}
//                 </Text>
//               </View>
//             </View>
//           ))}
//         </View>

//         {/* Buttons */}
//         <View style={styles.buttonRow}>
//           <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
//             <Ionicons name="pencil" size={16} color="#fff" />
//             <Text style={styles.btnText}>แก้ไขข้อมูล</Text>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
//           <Ionicons name="trash-outline" size={16} color="#e05070" />
//           <Text style={styles.deleteBtnText}>ลบข้อมูลทั้งหมด</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Edit Modal */}
//       <Modal animationType="slide" transparent visible={modalVisible}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHandle} />
//             <Text style={styles.modalTitle}>✏️ แก้ไขข้อมูลโปรไฟล์</Text>

//             <TouchableOpacity style={styles.avatarPickerBtn} onPress={pickImage}>
//               {editAvatar ? (
//                 <Image source={{ uri: editAvatar }} style={styles.modalAvatarImg} />
//               ) : (
//                 <View style={styles.modalAvatarPlaceholder}>
//                   <Ionicons name="camera" size={28} color={PINK.primary} />
//                   <Text style={styles.avatarPickerText}>เพิ่มรูปภาพ</Text>
//                 </View>
//               )}
//             </TouchableOpacity>

//             <TextInput style={styles.input} value={editStudentId} onChangeText={setEditStudentId} placeholder="รหัสนิสิต" placeholderTextColor="#cca0bb" />
//             <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="ชื่อ-สกุล" placeholderTextColor="#cca0bb" />
//             <TextInput style={styles.input} value={editEmail} onChangeText={setEditEmail} placeholder="อีเมล" placeholderTextColor="#cca0bb" />
//             <TextInput style={styles.input} value={editYear} onChangeText={setEditYear} placeholder="ชั้นปี" placeholderTextColor="#cca0bb" />
//             <TextInput style={styles.input} value={editFaculty} onChangeText={setEditFaculty} placeholder="คณะ" placeholderTextColor="#cca0bb" />

//             <View style={styles.modalBtns}>
//               <Pressable style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
//                 <Text style={styles.cancelBtnText}>ยกเลิก</Text>
//               </Pressable>
//               <Pressable style={[styles.modalBtn, styles.saveBtn]} onPress={handleSave}>
//                 <Text style={styles.saveBtnText}>บันทึก</Text>
//               </Pressable>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     backgroundColor: PINK.bg,
//     paddingBottom: 40,
//   },
//   headerBand: {
//     backgroundColor: PINK.primary,
//     paddingHorizontal: 20,
//     paddingTop: 16,
//     paddingBottom: 18,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     shadowColor: PINK.primary,
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.3,
//     shadowRadius: 12,
//     elevation: 8,
//     marginBottom: 8,
//   },
//   appTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 1 },
//   avatarSection: {
//     alignItems: 'center',
//     paddingTop: 20,
//     paddingBottom: 10,
//   },
//   avatarContainer: {
//     width: 110,
//     height: 110,
//     borderRadius: 55,
//     backgroundColor: PINK.light,
//     borderWidth: 3,
//     borderColor: PINK.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//     position: 'relative',
//     shadowColor: PINK.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//     elevation: 6,
//   },
//   avatarImage: { width: '100%', height: '100%' },
//   avatarEditBadge: {
//     position: 'absolute',
//     bottom: 8,
//     right: 8,
//     backgroundColor: PINK.primary,
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   profileName: {
//     marginTop: 12,
//     fontSize: 18,
//     fontWeight: '800',
//     color: PINK.text,
//   },
//   profileSub: {
//     fontSize: 13,
//     color: PINK.sub,
//     marginTop: 2,
//   },
//   infoSection: {
//     marginHorizontal: 20,
//     marginTop: 14,
//     backgroundColor: '#fff',
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: PINK.border,
//     overflow: 'hidden',
//     shadowColor: PINK.primary,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: PINK.border,
//     gap: 12,
//   },
//   infoIcon: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: PINK.light,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   infoContent: { flex: 1 },
//   infoLabel: { fontSize: 11, color: PINK.sub, fontWeight: '600', marginBottom: 1 },
//   infoValue: { fontSize: 14, color: PINK.text, fontWeight: '600' },
//   infoEmpty: { color: '#ccc', fontWeight: '400' },
//   buttonRow: {
//     marginHorizontal: 20,
//     marginTop: 20,
//   },
//   editButton: {
//     backgroundColor: PINK.primary,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     padding: 14,
//     borderRadius: 14,
//     shadowColor: PINK.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
//   deleteButton: {
//     marginHorizontal: 20,
//     marginTop: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     padding: 14,
//     borderRadius: 14,
//     borderWidth: 1.5,
//     borderColor: '#ffc0cc',
//     backgroundColor: '#fff5f7',
//   },
//   deleteBtnText: { color: '#e05070', fontWeight: '700', fontSize: 14 },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
//   modalContent: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//   },
//   modalHandle: {
//     width: 40, height: 4, borderRadius: 2,
//     backgroundColor: '#e0c0d0',
//     alignSelf: 'center',
//     marginBottom: 16,
//   },
//   modalTitle: { fontSize: 16, fontWeight: '700', color: PINK.text, marginBottom: 14 },
//   avatarPickerBtn: {
//     alignSelf: 'center',
//     marginBottom: 14,
//   },
//   modalAvatarImg: {
//     width: 90, height: 90, borderRadius: 45,
//     borderWidth: 2, borderColor: PINK.primary,
//   },
//   modalAvatarPlaceholder: {
//     width: 90, height: 90, borderRadius: 45,
//     borderWidth: 2, borderColor: PINK.border,
//     borderStyle: 'dashed',
//     alignItems: 'center', justifyContent: 'center',
//     backgroundColor: PINK.light,
//   },
//   avatarPickerText: { fontSize: 10, color: PINK.sub, marginTop: 4 },
//   input: {
//     borderWidth: 1.5, borderColor: PINK.border,
//     padding: 10, borderRadius: 10,
//     marginVertical: 5, backgroundColor: PINK.bg,
//     color: PINK.text, fontSize: 14,
//   },
//   modalBtns: { flexDirection: 'row', marginTop: 14, gap: 10 },
//   modalBtn: { flex: 1, padding: 13, borderRadius: 12, alignItems: 'center' },
//   cancelBtn: { backgroundColor: '#f3eaf0' },
//   saveBtn: { backgroundColor: PINK.primary },
//   cancelBtnText: { color: PINK.sub, fontWeight: '700' },
//   saveBtnText: { color: '#fff', fontWeight: '700' },
// });

// export default ProfileScreen;
