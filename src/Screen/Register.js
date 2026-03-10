import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function App() {

    const [isLoginMode, setIsLoginMode] = useState(true)

    const [studentId, setStudentId] = useState("")
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [year, setYear] = useState("")
    const [faculty, setFaculty] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const handleAuth = () => {

        if (isLoginMode) {

            if (!email || !password) {
                Alert.alert("แจ้งเตือน", "กรอก Email และ Password ให้ครบ")
                return
            }

            Alert.alert("สำเร็จ", "เข้าสู่ระบบสำเร็จ (Demo)")
        }

        else {

            if (!studentId || !name || !email || !year || !faculty || !password || !confirmPassword) {
                Alert.alert("แจ้งเตือน", "กรอกข้อมูลให้ครบทุกช่อง")
                return
            }

            if (password !== confirmPassword) {
                Alert.alert("แจ้งเตือน", "Password และ Confirm Password ไม่ตรงกัน")
                return
            }

            Alert.alert("สำเร็จ", "สมัครสมาชิกสำเร็จ (Demo)")
        }
    }

    return (

        <View style={styles.container}>

            <Text style={styles.title}>
                {isLoginMode ? "Welcome" : "Register"}
            </Text>

            <View style={styles.card}>

                {!isLoginMode && (

                    <>

                        <View style={styles.inputBox}>
                            <Ionicons name="card-outline" size={20} color="#777" />
                            <TextInput
                                placeholder="รหัสนิสิต"
                                style={styles.input}
                                value={studentId}
                                onChangeText={setStudentId}
                            />
                        </View>

                        <View style={styles.inputBox}>
                            <Ionicons name="person-outline" size={20} color="#777" />
                            <TextInput
                                placeholder="ชื่อ-สกุล"
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <View style={styles.inputBox}>
                            <Ionicons name="school-outline" size={20} color="#777" />
                            <TextInput
                                placeholder="ชั้นปี"
                                style={styles.input}
                                value={year}
                                onChangeText={setYear}
                            />
                        </View>

                        <View style={styles.inputBox}>
                            <Ionicons name="library-outline" size={20} color="#777" />
                            <TextInput
                                placeholder="คณะ"
                                style={styles.input}
                                value={faculty}
                                onChangeText={setFaculty}
                            />
                        </View>

                    </>

                )}

                <View style={styles.inputBox}>
                    <Ionicons name="mail-outline" size={20} color="#777" />
                    <TextInput
                        placeholder="อีเมล"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputBox}>
                    <Ionicons name="lock-closed-outline" size={20} color="#777" />
                    <TextInput
                        placeholder="Password"
                        secureTextEntry
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                {!isLoginMode && (

                    <View style={styles.inputBox}>
                        <Ionicons name="lock-closed-outline" size={20} color="#777" />
                        <TextInput
                            placeholder="Confirm Password"
                            secureTextEntry
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

                )}

                <TouchableOpacity style={styles.button} onPress={handleAuth}>
                    <Text style={styles.buttonText}>
                        {isLoginMode ? "Login" : "Register"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setIsLoginMode(!isLoginMode)}
                    style={{ marginTop: 15 }}
                >

                    <Text style={styles.switchText}>
                        {isLoginMode
                            ? "ยังไม่มีบัญชีใช่ไหม สมัครสมาชิกที่นี่"
                            : "มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่"}
                    </Text>

                </TouchableOpacity>

            </View>

        </View>

    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f7d3d3"
    },

    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#5c0f2b"
    },

    card: {
        width: "85%",
        backgroundColor: "#fff",
        padding: 25,
        borderRadius: 15
    },

    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 15
    },

    input: {
        flex: 1,
        padding: 12
    },

    button: {
        backgroundColor: "#ff8fa3",
        padding: 15,
        borderRadius: 10,
        alignItems: "center"
    },

    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16
    },

    switchText: {
        color: "#4694d3",
        textAlign: "center"
    }

})