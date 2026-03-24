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
import { useRouter } from "expo-router";
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import ChatBubble from "../../components/ChatBubble";
import { API_BASE } from "../../context/MemberContext";

export default function TestScreen() {
  const router = useRouter();

  const [tests, setTests] = useState<any[]>([]);

 
  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/pdf",
      } as any);

      const res = await fetch(`${API_BASE}/api/ocr/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          "x-user-id": "1", 
        },
        body: formData,
      });

      const data = await res.json();

      if (data.tests) {
        setTests(data.tests);
        Alert.alert("Success", "Report analyzed successfully");
      } else {
        Alert.alert("No data extracted");
      }

    } catch (err) {
      console.error(err);
      Alert.alert("Upload failed");
    }
  };


  const getStatus = (value: number) => {
    if (value < 12) return { label: "Abnormal", color: "#e63946" };
    if (value < 13) return { label: "Borderline", color: "#f59e0b" };
    return { label: "Normal", color: "#16a34a" };
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >

         
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>

            <Text style={styles.title}>Test Results</Text>

            <View style={{ width: 24 }} />
          </View>

          
          <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload}>
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={styles.uploadText}>Upload Report</Text>
          </TouchableOpacity>

          
          {tests.length === 0 ? (
            <Text style={styles.empty}>
              Upload a report to see results
            </Text>
          ) : (
            tests.map((t, i) => {
              const status = getStatus(t.value);

              return (
                <View key={i} style={styles.card}>

                  {/* NAME */}
                  <Text style={styles.name}>{t.name}</Text>

                  {/* VALUE */}
                  <Text style={styles.value}>{t.value}</Text>

                  {/* RANGE */}
                  <Text style={styles.info}>
                    Normal Range: {t.normalRange}
                  </Text>

                  {/* DATE */}
                  <Text style={styles.updated}>
                    Last Updated: {t.lastUpdated}
                  </Text>

                 
                  <View style={styles.statusRow}>
                    <View style={[styles.dot, { backgroundColor: status.color }]} />
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>

                </View>
              );
            })
          )}

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
    color: "#1f2937",
  },

  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#29A9F8",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },

  uploadText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1f2937",
  },

  value: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 6,
  },

  info: {
    color: "#6b7280",
    marginTop: 4,
  },

  updated: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 6,
  },

  /* 🚦 TRAFFIC LIGHT */
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },

  statusText: {
    fontWeight: "600",
    fontSize: 12,
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#6b7280",
  },
});