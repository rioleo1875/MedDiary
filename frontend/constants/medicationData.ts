import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSelectedMember } from "./selectedMember"; // ✅ IMPORTANT

export type Medication = {
  id: string;
  name: string;
  type: "regular" | "temporary";
};

export let medications: Medication[] = [];

// 🔥 Dynamic key per member
const getKey = () => {
  const id = getSelectedMember();
  return `MEDICATIONS_${id}`;
};

// LOAD
export const loadMedications = async () => {
  const key = getKey();
  if (!key) return;

  const data = await AsyncStorage.getItem(key);
  medications.length = 0;

  if (data) {
    medications.push(...JSON.parse(data));
  }
};

// SAVE
export const saveMedications = async () => {
  const key = getKey();
  if (!key) return;

  await AsyncStorage.setItem(key, JSON.stringify(medications));
};