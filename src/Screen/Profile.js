import React, { useContext } from "react";
import { View, Text, StyleSheet, FlatList } from 'react-native'
import { Usercontext } from "../context/Usercontext";

const UserListScreen = () => {
    const { users } = useContext(Usercontext)

    return (
        <View>
            <Text>User List</Text>
            <FlatList
                data={users}
            />
        </View>
    )
}

const styles = StyleSheet.create({

});

export default UserListScreen