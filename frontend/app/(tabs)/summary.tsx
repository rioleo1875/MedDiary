import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useMember, API_BASE } from "../../context/MemberContext";

export default function GenerateSummary() {
  const router = useRouter();

  const { activeMember, userId } = useMember();

  const handleGeneratePDF = async () => {
    if (!activeMember) {
      Alert.alert("No Member", "Please select a family member first.");
      return;
    }

    try {
      console.log('Summary: Generating PDF for member:', activeMember.member_id);
      const url = `${API_BASE}/api/summary/generate/${activeMember.member_id}?userId=${userId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-user-id': userId.toString(),
          'Accept': 'application/pdf'
        }
      });

      if (response.ok) {
        console.log('Summary: PDF generation successful');
        Alert.alert("Success", "PDF generated successfully!");
      } else {
        console.error('Summary: PDF generation failed:', response.status);
        Alert.alert("Error", "Failed to generate PDF. Please try again.");
      }
    } catch (err) {
      console.error('Summary: Error generating PDF:', err);
      Alert.alert("Error", "Failed to generate summary. Please check your connection.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.title}>Medical Summary</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* MEMBER CARD */}
        {activeMember && (
          <View style={styles.memberCard}>
            <View style={styles.memberAvatar}>
              <Text style={styles.memberAvatarText}>
                {activeMember.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.memberName}>{activeMember.name}</Text>
              <Text style={styles.memberSub}>
                {activeMember.blood_group} · Age {activeMember.age}
              </Text>
            </View>
          </View>
        )}

        {/* GENERATE CARD */}
        <View style={styles.card}>
          <Text style={styles.infoText}>
            Generate a complete medical summary PDF including patient details,
            medications, and all test results with status indicators.
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleGeneratePDF}>
            <Ionicons
              name="document-text-outline"
              size={18}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>Generate PDF</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          This summary is generated using stored medical data and rule-based
          evaluation. It is for informational purposes only.
        </Text>

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
    marginBottom: 24,
  },

  title: { fontSize: 18, fontWeight: "600", color: "#1f2937" },

  memberCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#29A9F8",
  },

  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#29A9F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  memberAvatarText: { color: "#fff", fontWeight: "700", fontSize: 20 },
  memberName: { fontWeight: "700", fontSize: 16, color: "#1f2937" },
  memberSub: { fontSize: 13, color: "#6b7280", marginTop: 2 },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  infoText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 20,
  },

  button: {
    backgroundColor: "#29A9F8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  note: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 16,
    textAlign: "center",
    lineHeight: 18,
  },
});