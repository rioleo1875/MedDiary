import AsyncStorage from "@react-native-async-storage/async-storage";

export type Medication = {
  id: string;
  name: string;
  type: "regular" | "temporary";
};

export type Reminder = {
  id: string;
  med: string;
  hour: string;
  minute: string;
  period: "AM" | "PM";
};

export type FamilyMember = {
  id: string;
  name: string;
  age: number;
  gender: string;
  blood: string;
  relation: string;

  medications: Medication[];
  reminders: Reminder[];
};

export let familyMembers: FamilyMember[] = [];

// ✅ FIXED KEY (MATCH ALL FILES)
const KEY = "familyMembers";

export const loadFamily = async () => {
  const data = await AsyncStorage.getItem(KEY);
  if (data) {
    familyMembers.length = 0;
    familyMembers.push(...JSON.parse(data));
  }
};

export const saveFamily = async () => {
  await AsyncStorage.setItem(KEY, JSON.stringify(familyMembers));
};