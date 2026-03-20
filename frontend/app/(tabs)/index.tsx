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
import { Images } from "../../constants/Images";

export default function HomeScreen() {
  const router = useRouter();

  const activities = [
    { id: "1", type: "Test Result", text: "Blood test updated", date: "05 Feb 2026" },
    { id: "2", type: "Medication", text: "Ibuprofen dosage changed", date: "07 Feb 2026" },
  ];

  return (
    <View style={{ flex: 1 }}>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Top Spacer */}
        <View style={styles.topSpacer} />

        {/* App Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>
            <Text style={styles.med}>Med</Text>
            <Text style={styles.diary}>Diary</Text>
          </Text>
          <Text style={styles.tagline}>
            Your family medical records, in one place
          </Text>
        </View>

        {/* Medical ID */}
        <Text style={styles.sectionTitle}>Medical ID</Text>

        <View style={styles.card}>
          <Image source={Images.avatar} style={styles.avatar} />

          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={styles.name}>Archana A</Text>
            <Text style={styles.info}>Blood Group: A+</Text>
            <Text style={styles.info}>Age: 21</Text>
            <Text style={styles.info}>Emergency Contact: Ajeesh A</Text>
          </View>
        </View>

        {/* Quick Access Grid */}
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
              onPress={() => router.push(`/(tabs)/${item.route}` as any)}
            >
              <Text style={styles.tileText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          {activities.map((item) => (
            <View key={item.id} style={styles.activityItem}>
              <View>
                <Text style={styles.activityType}>{item.type}</Text>
                <Text style={styles.activityText}>{item.text}</Text>
              </View>
              <Text style={styles.activityDate}>{item.date}</Text>
            </View>
          ))}
        </View>

        {/* Emergency Access */}
        <TouchableOpacity
          style={styles.emergencyBar}
          onPress={() => router.push("/(tabs)/emergency")}
        >
          <Text style={styles.emergencyText}>Emergency Access</Text>
          <Text style={styles.emergencySub}>View Emergency Profile</Text>
        </TouchableOpacity>

        {/* Generate Medical Summary */}
        <TouchableOpacity
          style={styles.summaryBar}
          onPress={() => router.push("/(tabs)/summary")}
        >
          <Text style={styles.summaryText}>Generate Medical Summary</Text>
          <Text style={styles.summarySub}>
            View consolidated medical information
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Floating Chatbot Button */}
      <TouchableOpacity
  style={styles.chatBubble}
  onPress={() => router.push("../(tabs)/chatbot")}
>
  <Ionicons name="chatbubbles-sharp" size={28} color="#29A9F8"/>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaf6ff",
    padding: 20,
  },

  content: {
    paddingBottom: 28,
  },

  topSpacer: {
    height: 24,
  },

  header: {
    marginBottom: 22,
  },

  appName: {
    fontSize: 30,
    fontWeight: "bold",
  },

  med: {
    color: "#29A9F8",
  },

  diary: {
    color: "#1f2937",
  },

  tagline: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
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
    alignItems: "center",
    marginBottom: 22,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,

    borderLeftWidth: 6,
    borderLeftColor: "#29A9F8",
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#eaf6ff",
  },

  name: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1f2937",
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
    marginTop: 18,
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
    color: "#1f2937",
  },

  activityContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 15,
    marginTop: 10,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

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
    color: "#374151",
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

    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },

    elevation: 6,
  },

  
});