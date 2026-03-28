import { useState, useEffect, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, Alert } from "react-native";
import { API_BASE } from "../context/MemberContext"


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,   
    shouldShowList: true,    
  }),
});



export type Medication = {
  med_id: number;
  med_name: string;
};

export type Reminder = {
  reminder_id: number;
  med_id: number;
  med_name: string;
  hour: number;   // 0-23
  minute: number; // 0-59
  label: string | null;
  notification_id: string | null;
};


export async function requestNotificationPermissions(): Promise<boolean> {
  console.log("Requesting notification permissions...");
  
  if (!Device.isDevice) {
    console.log("Not a real device, skipping notifications");
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  console.log("Existing permission status:", existing);
  
  if (existing === "granted") {
    console.log("Permissions already granted");
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  console.log("Permission request result:", status);
  
  if (status !== "granted") {
    Alert.alert(
      "Permission Required",
      "Please enable notifications in your device settings to receive medication reminders."
    );
    return false;
  }

  if (Platform.OS === "android") {
    console.log("Setting up Android notification channel");
    await Notifications.setNotificationChannelAsync("medication-reminders", {
      name: "Medication Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
    });
  }

  console.log("Permissions granted successfully");
  return true;
}


async function scheduleNotification(
  medName: string,
  hour: number,
  minute: number,
  label: string | null
): Promise<string> {
  const title = label ? `${label} — ${medName}` : `Time to take ${medName}`;

  console.log("Scheduling notification:", { title, hour, minute });

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: "Tap to open MedDiary",
        sound: "default",
        data: { medName },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        repeats: true, 
      } as Notifications.DailyTriggerInput,
    });

    console.log("Notification scheduled successfully:", id);
    return id;
  } catch (error) {
    console.error("Failed to schedule notification:", error);
    throw error;
  }
}



export function useReminders(memberId: number | null, userId: number) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);


  const fetchReminders = useCallback(async () => {
    if (!memberId) return;
    try {
      const res = await fetch(`${API_BASE}/api/reminders/${memberId}`, {
        headers: { "x-user-id": String(userId) },
      });
      const data: Reminder[] = await res.json();
      setReminders(data);
    } catch (err) {
      console.error("useReminders: fetchReminders error", err);
    }
  }, [memberId, userId]);

  const fetchMedications = useCallback(async () => {
  if (!memberId) return;
  try {
    const res = await fetch(`${API_BASE}/api/medications/${memberId}`, {
      headers: { "x-user-id": String(userId) },
    });
    const data: Medication[] = await res.json();
    setMedications(data);
  } catch (err) {
    console.error("useReminders: fetchMedications error", err);
  }
}, [memberId, userId]);

 
  useEffect(() => {
    const init = async () => {
      if (!memberId) return;
      setLoading(true);
      await fetchReminders();
      await fetchMedications();
      setLoading(false);
    };
    init();
  }, [memberId]);


  const addReminder = async (
    medId: number,
    medName: string,
    hour: number,
    minute: number,
    label: string | null
  ): Promise<boolean> => {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return false;

    setLoading(true);
    try {
 
      const res = await fetch(`${API_BASE}/api/reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": String(userId),
        },
        body: JSON.stringify({
          med_id: medId,
          member_id: memberId,
          hour,
          minute,
          label,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        Alert.alert("Error", err.error ?? "Failed to save reminder");
        return false;
      }

      const { reminder_id } = await res.json();

      
      const notifId = await scheduleNotification(medName, hour, minute, label);


      await fetch(`${API_BASE}/api/reminders/${reminder_id}/notification`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": String(userId),
        },
        body: JSON.stringify({ notification_id: notifId }),
      });

      await fetchReminders();
      return true;
    } catch (err) {
      console.error("useReminders: addReminder error", err);
      Alert.alert("Error", "Failed to add reminder");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteReminder = async (reminderId: number): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/reminders/${reminderId}`, {
        method: "DELETE",
        headers: { "x-user-id": String(userId) },
      });

      if (!res.ok) return;

      const { notification_id } = await res.json();

      
      if (notification_id) {
        await Notifications.cancelScheduledNotificationAsync(notification_id);
      }

      await fetchReminders();
    } catch (err) {
      console.error("useReminders: deleteReminder error", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    reminders,
    medications,
    loading,
    addReminder,
    deleteReminder,
    fetchReminders,
  };
}