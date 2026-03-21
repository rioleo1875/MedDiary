let selectedMemberId: string | null = null;

export const setSelectedMember = (id: string | null) => {
  selectedMemberId = id;
};

export const getSelectedMember = () => {
  return selectedMemberId;
};