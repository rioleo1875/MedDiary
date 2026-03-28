import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import ChatBubble from "../../components/ChatBubble";
import { useMember, API_BASE } from "../../context/MemberContext";
import { useAuth } from "../../context/AuthContext";

export default function FamilyScreen() {
  const router = useRouter();
  const { members, activeMember, setActiveMember, refreshMembers } = useMember();
  const { userId } = useAuth();

  useFocusEffect(
    useCallback(() => {
      refreshMembers();
    }, [refreshMembers])
  );

  const deleteMember = async (memberId: number) => {
    Alert.alert(
      "Delete Member",
      "Are you sure you want to delete this family member?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
          try {
            const res = await fetch(`${API_BASE}/api/family/members/${memberId}`, {
              method: "DELETE",
              headers: { "x-user-id": String(userId) }
            });
            
            if (res.ok) {
              await refreshMembers();
              Alert.alert("Success", "Family member deleted successfully");
            } else {
              Alert.alert("Error", "Failed to delete family member");
            }
          } catch (error) {
            console.error("Delete member error:", error);
            Alert.alert("Error", "Failed to delete family member");
          }
        }}
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container}>

          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>

            <Text style={styles.title}>Family Members</Text>

            <View style={{ width: 24 }} />
          </View>

          {/* ADD BUTTON */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/(tabs)/add-member")}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addText}> Add Member</Text>
          </TouchableOpacity>

          {/* MEMBERS */}
          {members.map((m) => (
            <TouchableOpacity
              key={m.member_id}
              style={[styles.card, activeMember?.member_id === m.member_id && styles.activeCard]}
              onPress={async () => {
                await setActiveMember(m);
                router.push("/(tabs)");
              }}
            >

              <View style={styles.cardHeader}>
                <Text style={styles.name}>{m.name}</Text>
                <Text style={styles.relation}>{m.relation}</Text>
              </View>

              <Text style={styles.info}>Age: {m.age}</Text>
              <Text style={styles.info}>Gender: {m.gender}</Text>
              <Text style={styles.info}>Blood Group: {m.blood_group}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/add-member",
                      params: { member: JSON.stringify(m) },
                    })
                  }
                >
                  <Text style={styles.edit}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => deleteMember(m.member_id)}>
                  <Text style={styles.delete}>Delete</Text>
                </TouchableOpacity>
              </View>

            </TouchableOpacity>
          ))}
        </ScrollView>

        <ChatBubble />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf6ff",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
  },

  addBtn: {
    flexDirection: "row",
    backgroundColor: "#29A9F8",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  addText: {
    color: "#fff",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 4,
  },

  activeCard: {
    backgroundColor: "#e0f2fe",
    borderWidth: 2,
    borderColor: "#29A9F8",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: {
    fontWeight: "700",
    fontSize: 16,
  },

  relation: {
    color: "#29A9F8",
    fontWeight: "600",
  },

  info: {
    color: "#6b7280",
    marginTop: 4,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  edit: {
    color: "#29A9F8",
    fontWeight: "600",
  },

  delete: {
    color: "#e63946",
    fontWeight: "600",
  },
});