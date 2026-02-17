import React, { useContext } from "react";
import { View, Text, StyleSheet, FlatList } from 'react-native'
import { UserContext } from "./context/UserContext";

const UserListScreen = () => {
    const { users } = useContext(UserContext)

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