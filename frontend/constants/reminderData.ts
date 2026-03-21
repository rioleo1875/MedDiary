import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSelectedMember } from "./selectedMember"; // ✅ IMPORTANT

export type Reminder = {
  id: string;
  med: string;
  hour: string;
  minute: string;
  period: "AM" | "PM";
};

export let reminders: Reminder[] = [];

// 🔥 Dynamic key per member
const getKey = () => {
  const id = getSelectedMember();
  return id ? `REMINDERS_${id}` : null;
};

// LOAD
export const loadReminders = async () => {
  const key = getKey();
  if (!key) return;

  const data = await AsyncStorage.getItem(key);
  reminders.length = 0;

  if (data) {
    reminders.push(...JSON.parse(data));
  }
};

// SAVE
export const saveReminders = async () => {
  const key = getKey();
  if (!key) return;

  await AsyncStorage.setItem(key, JSON.stringify(reminders));
};