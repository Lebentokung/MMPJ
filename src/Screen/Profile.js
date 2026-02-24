import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Modal,
    Image,
    Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";


const ProfileScreen = () => {
    const [studentId, setStudentId] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [year, setYear] = useState("");
    const [faculty, setFaculty] = useState("");

    const [modalVisible, setModalVisible] = useState(false);

    const handleSave = () => {
        setModalVisible(false);
        Alert.alert("บันทึกข้อมูลเรียบร้อย");
    };

    const handleDelete = () => {
        Alert.alert(
            "ยืนยันการลบ",
            "คุณต้องการลบข้อมูลทั้งหมดใช่หรือไม่?",
            [
                {
                    text: "ยกเลิก",
                    style: "cancel",
                },
                {
                    text: "ยืนยัน",
                    style: "destructive",
                    onPress: () => {
                        setStudentId("");
                        setName("");
                        setEmail("");
                        setYear("");
                        setFaculty("");
                        Alert.alert("ลบข้อมูลเรียบร้อย");
                    },
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Profile</Text>


                <View style={styles.avatarContainer}>
                    <Ionicons name="person-outline" size={60} color="#b76e99" />
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="รหัสนิสิต"
                    value={studentId}
                    onChangeText={setStudentId}
                    editable={false}
                />

                <TextInput
                    style={styles.input}
                    placeholder="ชื่อ"
                    value={name}
                    onChangeText={setName}
                    editable={false}
                />

                <TextInput
                    style={styles.input}
                    placeholder="อีเมล"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    editable={false}
                />

                <TextInput
                    style={styles.input}
                    placeholder="ชั้นปี"
                    value={year}
                    onChangeText={setYear}
                    editable={false}
                />

                <TextInput
                    style={styles.input}
                    placeholder="คณะ"
                    value={faculty}
                    onChangeText={setFaculty}
                    editable={false}
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.buttonText}>EDIT</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                    >
                        <Text style={styles.buttonText}>DELETE ALL DATA</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={{ fontWeight: '700', marginBottom: 8 }}>Edit Profile</Text>
                        <TextInput placeholder="รหัสนิสิต" style={styles.input} />
                        <TextInput placeholder="ชื่อ" style={styles.input} />
                        <TextInput placeholder="Email" style={styles.input} />
                        <TextInput placeholder="ชั้นปี" style={styles.input} />
                        <TextInput placeholder="คณะ" style={styles.input} />


                        <View style={{ flexDirection: 'row', marginTop: 12 }}>
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
    avatarContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: "#b76e99",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginBottom: 20,
        backgroundColor: "#fff",
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#c084a1",
        width:'80%',
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

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
    modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 6 }
    , segControl: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', marginVertical: 8 }
    , segBtn: { flex: 1, padding: 10, alignItems: 'center' }
    , segActive: { backgroundColor: '#f2d7ec' }
    , examRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f6e6f1' }
    , rowBtn: { padding: 6 }
});

export default ProfileScreen;