import React,{ useState,useContext} from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Usercontext } from "../context/Usercontext";

const RegisterScreen = ({ onRegisterSuccess }) => {

    const { dispatch } = useContext(Usercontext);

    const [form , setForm] = useState({
        nisitid: '',
        fullname: '',
        email: '',
        kna:'',
        password: '',
        confirmPassword: '',
        image: null
    });

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setForm({...form, image: result.assets[0].uri});
        }
    };

    const handleRegister = () => {
        if (!form.fullname || !form.email || !form.kna || !form.password || !form.confirmPassword) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (form.password !== form.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        dispatch({ type: 'ADD_USER', payload: form });

        Alert.alert('Success', 'User registered successfully', [
            { 
                text: 'OK', 
                onPress: () => onRegisterSuccess() // 🔥 แก้ตรงนี้
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <Text style={{fontSize:22, marginBottom:20}}>Register Screen</Text>

            <View style={styles.imageSection}>
                <TouchableOpacity onPress={pickImage}>
                    {form.image ? (
                        <Image source={{ uri: form.image }} style={styles.avatar} />
                    ) : (
                        <Ionicons name="camera" size={40} color="gray" />
                    )}
                </TouchableOpacity>
            </View>

            <TextInput
                placeholder="Nisit ID"
                value={form.nisitid}
                onChangeText={(text) => setForm({...form, nisitid: text})}
                style={styles.input}
            />

            <TextInput
                placeholder="Fullname"
                value={form.fullname}
                onChangeText={(text) => setForm({...form, fullname: text})}
                style={styles.input}
            />

            <TextInput
                placeholder="Email"
                value={form.email}
                onChangeText={(text) => setForm({...form, email: text})}
                style={styles.input}
            />

            <TextInput
                placeholder="KNA"
                value={form.kna}
                onChangeText={(text) => setForm({...form, kna: text})}
                style={styles.input}
            />

            <TextInput
                placeholder="Password"
                value={form.password}
                secureTextEntry
                onChangeText={(text) => setForm({...form, password: text})}
                style={styles.input}
            />

            <TextInput
                placeholder="Confirm Password"
                value={form.confirmPassword}
                secureTextEntry
                onChangeText={(text) => setForm({...form, confirmPassword: text})}
                style={styles.input}
            />

            <TouchableOpacity style={styles.bt} onPress={handleRegister}>
                <Text style={{ color: 'white' }}>Register</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,    
        backgroundColor: '#fff',    
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageSection: {
        alignItems: 'center',
        marginVertical: 10,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    input: {
        height: 50,
        borderRadius:10,
        borderWidth:1,
        borderColor:'gray',
        paddingHorizontal:15,
        marginBottom:15,
        width: 200,
    },
    bt: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        width: 200,
        alignItems: 'center' 
    }
});

export default RegisterScreen;
