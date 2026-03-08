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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Spacer (breathing space) */}
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

      {/* Medical ID Card */}
      <View style={styles.card}>
        <Image source={Images.avatar} style={styles.avatar} />

        <View style={{ flex: 1 }}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  content: {
    padding: 16,
    paddingBottom: 28,
  },

  /* Top spacing */
  topSpacer: {
    height: 24,
  },

  /* Header */
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

  /* Medical Card */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },

  info: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 4,
  },

  /* Grid */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 18,
  },

  tile: {
    width: "48%",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
    elevation: 2,
  },

  tileText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },

  /* Activity */
  activityContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1f2937",
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

  /* Emergency */
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

  /* Summary */
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
});
