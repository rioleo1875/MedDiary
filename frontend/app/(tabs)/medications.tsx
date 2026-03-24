import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

const API_URL = "YOUR_BACKEND_URL"; 

export default function Medications() {
  const { memberId } = useLocalSearchParams();
  const [medications, setMedications] = useState<any[]>([]);

  const fetchMedications = async () => {
    try {
      const res = await fetch(`${API_URL}/medications/${memberId}`, {
        headers: {
          "x-user-id": "1", 
        },
      });

      const data = await res.json();
      setMedications(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load medications");
    }
  };

  useEffect(() => {
    if (memberId) fetchMedications();
  }, [memberId]);


  const handleDelete = async (medId: number) => {
    try {
      await fetch(`${API_URL}/medications/${medId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": "1",
        },
      });

      
      fetchMedications();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to delete medication");
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.medName}>{item.med_name}</Text>

      {item.dosage && (
        <Text style={styles.detail}>Dose: {item.dosage}</Text>
      )}
      {item.frequency && (
        <Text style={styles.detail}>Frequency: {item.frequency}</Text>
      )}

      {/* DELETE BUTTON */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDelete(item.med_id)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>

        <Text style={styles.title}>Medications</Text>

        <FlatList
          data={medications}
          keyExtractor={(item) => item.med_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />

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

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    color: "#1f2937",
  },


  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
  },

  medName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#111827",
  },

  detail: {
    fontSize: 14,
    color: "#374151",
  },

  deleteBtn: {
    marginTop: 10,
    alignSelf: "flex-end",
  },

  deleteText: {
    color: "red",
    fontWeight: "600",
  },
});