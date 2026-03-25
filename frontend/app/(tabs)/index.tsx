import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Images } from "../../constants/Images";
import { useMember } from "../../context/MemberContext";
import { useAuth } from "../../context/AuthContext";

export default function HomeScreen() {
  const router = useRouter();
  const { activeMember } = useMember();
  const { logout } = useAuth();

  const getRecentActivities = () => {
    if (!activeMember) return [];
    
    const activitiesList = [];
    
    // Add placeholder for now - we'll fetch real medications from API
    activitiesList.push({
      id: "placeholder",
      type: "Info",
      text: "No recent activity",
      date: "-"
    });
    
    return activitiesList;
  };

  const activities = getRecentActivities();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          {/* HEADER */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.appName}>
                <Text style={styles.med}>Med</Text>
                <Text style={styles.diary}>Diary</Text>
              </Text>

              <Text style={styles.tagline}>
                {activeMember
                  ? `Viewing ${activeMember.name}'s Profile`
                  : "Your family medical records, in one place"}
              </Text>
            </View>

            {/* ✅ FIXED ONLY THIS BLOCK */}
            {activeMember ? (
              <TouchableOpacity
                onPress={async () => {
                  await logout();
                  router.replace("/auth/login");
                }}
              >
                <Ionicons
                  name="exit-outline"
                  size={24}
                  color="#e63946"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={async () => {
                  await logout();
                  router.replace("/auth/login");
                }}
              >
                <Ionicons
                  name="log-out-outline"
                  size={24}
                  color="#e63946"
                />
              </TouchableOpacity>
            )}

          </View>

          {/* MEDICAL ID */}
          <Text style={styles.sectionTitle}>Medical ID</Text>

          <View style={styles.card}>
            {/* <Image source={Images.avatar} style={styles.avatar} /> */}

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {activeMember ? activeMember.name : "Select a Family Member"}
              </Text>

              <Text style={styles.info}>
                Blood Group: {activeMember ? activeMember.blood_group : "Not set"}
              </Text>

              <Text style={styles.info}>
                Age: {activeMember ? activeMember.age : "Not set"}
              </Text>

              <Text style={styles.info}>
                 Emergency Contact: {activeMember?.emergency_contact_name ? `${activeMember.emergency_contact_name} (${activeMember.emergency_contact_phone})` : "Not set"}
              </Text>
            </View>
          </View>

          {/* QUICK ACCESS */}
          <View style={styles.grid}>
            {[
              { label: "Family", route: "family" },
              { label: "Medications", route: "medications" },
              { label: "Test Results", route: "tests" },
              { label: "Immunizations", route: "immunizations" },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tile}
                onPress={() =>
                  router.push(`/(tabs)/${item.route}` as any)
                }
              >
                <Text style={styles.tileText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ACTIVITY */}
          <View style={styles.activityContainer}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>

            {activities.map((item) => (
              <View key={item.id} style={styles.activityItem}>
                <View>
                  <Text style={styles.activityType}>
                    {item.type}
                  </Text>
                  <Text style={styles.activityText}>
                    {item.text}
                  </Text>
                </View>

                <Text style={styles.activityDate}>
                  {item.date}
                </Text>
              </View>
            ))}
          </View>

          {/* EMERGENCY */}
          <TouchableOpacity
            style={styles.emergencyBar}
            onPress={() => router.push("/(tabs)/emergency")}
          >
            <Text style={styles.emergencyText}>
              Emergency Access
            </Text>
            <Text style={styles.emergencySub}>
              View Emergency Profile
            </Text>
          </TouchableOpacity>

          {/* SUMMARY */}
          <TouchableOpacity
            style={styles.summaryBar}
            onPress={() => router.push("/(tabs)/summary")}
          >
            <Text style={styles.summaryText}>
              Generate Medical Summary
            </Text>
            <Text style={styles.summarySub}>
              View consolidated medical information
            </Text>
          </TouchableOpacity>

        </ScrollView>

        {/* CHAT */}
        <TouchableOpacity
          style={styles.chatBubble}
          onPress={() => router.push("/(tabs)/chatbot")}
        >
          <Ionicons
            name="chatbubbles-sharp"
            size={28}
            color="#29A9F8"
          />
        </TouchableOpacity>

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

  content: {
    paddingBottom: 100,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  appName: {
    fontSize: 30,
    fontWeight: "bold",
  },

  med: { color: "#29A9F8" },
  diary: { color: "#1f2937" },

  tagline: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#1f2937",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    marginBottom: 20,
    elevation: 4,
    borderLeftWidth: 6,
    borderLeftColor: "#29A9F8",
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
  },

  info: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 4,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },

  tile: {
    width: "47%",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: "center",
    elevation: 3,
  },

  tileText: {
    fontSize: 14,
    fontWeight: "600",
  },

  activityContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 15,
    marginTop: 10,
    elevation: 4,
  },

  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  activityType: {
    fontSize: 13,
    fontWeight: "600",
    color: "#29A9F8",
  },

  activityText: {
    fontSize: 14,
  },

  activityDate: {
    fontSize: 12,
    color: "#6b7280",
  },

  emergencyBar: {
    backgroundColor: "#e63946",
    borderRadius: 12,
    padding: 18,
    marginTop: 14,
    alignItems: "center",
  },

  emergencyText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },

  emergencySub: {
    color: "#fee2e2",
    marginTop: 4,
  },

  summaryBar: {
    backgroundColor: "#29A9F8",
    borderRadius: 12,
    padding: 18,
    marginTop: 10,
    alignItems: "center",
  },

  summaryText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
  },

  summarySub: {
    color: "#dbeafe",
    marginTop: 4,
    fontSize: 13,
  },

  chatBubble: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#ffffff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});