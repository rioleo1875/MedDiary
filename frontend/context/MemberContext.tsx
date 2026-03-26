import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";



export type Member = {
  member_id: number;
  name: string;
  age: number;
  gender: string;
  blood_group: string;
  relation: string;
  allergies?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
};

type MemberContextType = {
  userId: number;
  members: Member[];
  activeMember: Member | null;
  setActiveMember: (member: Member) => void;
  refreshMembers: () => Promise<void>;
  loading: boolean;
};



const MemberContext = createContext<MemberContextType | null>(null);


export const API_BASE = process.env.EXPO_PUBLIC_API_URL || "https://meddiary-production.up.railway.app";



export function MemberProvider({ children }: { children: React.ReactNode }) {

  const userId = 1;

  const [members, setMembers] = useState<Member[]>([]);
  const [activeMember, setActiveMemberState] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMembers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/family/members`, {
        headers: { "x-user-id": String(userId) },
      });
      const data: Member[] = await res.json();
      setMembers(data);

   
      const storedId = await AsyncStorage.getItem("activeMemberId");
      const storedMember = data.find(
        (m) => m.member_id === Number(storedId)
      );

      if (storedMember) {
        setActiveMemberState(storedMember);
      } else {
        
        const self =
          data.find((m) => m.relation === "Self") ?? data[0] ?? null;
        setActiveMemberState(self);
        if (self) {
          await AsyncStorage.setItem(
            "activeMemberId",
            String(self.member_id)
          );
        }
      }
    } catch (err) {
      console.error("MemberContext: failed to fetch members", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  const setActiveMember = useCallback(async (member: Member) => {
    setActiveMemberState(member);
    await AsyncStorage.setItem("activeMemberId", String(member.member_id));
  }, []);

  return (
    <MemberContext.Provider
      value={{ userId, members, activeMember, setActiveMember, refreshMembers, loading }}
    >
      {children}
    </MemberContext.Provider>
  );
}

export function useMember() {
  const ctx = useContext(MemberContext);
  if (!ctx) throw new Error("useMember must be used inside <MemberProvider>");
  return ctx;
}