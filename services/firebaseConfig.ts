
// ------------------------------------------------------------------
// LOCAL AUTH SERVICE (No Firebase)
// ------------------------------------------------------------------

const MOCK_USER = {
  uid: 'local-user-123',
  displayName: 'المحامي (محلي)',
  email: 'lawyer@local.app',
  photoURL: ''
};

let authSubscribers: ((user: any) => void)[] = [];

// Check local storage on load
const isLocalLoggedIn = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('lexschedule_auth_status') === 'logged_in';
};

export const getCurrentUserId = (): string | null => {
  return isLocalLoggedIn() ? MOCK_USER.uid : null;
};

export const initializeAuthListener = (callback: (user: any) => void) => {
  authSubscribers.push(callback);
  
  // Trigger immediately with current status
  callback(isLocalLoggedIn() ? MOCK_USER : null);
  
  return () => {
    authSubscribers = authSubscribers.filter(cb => cb !== callback);
  };
};

export const loginWithGoogle = async () => {
  console.log("Simulating Login...");
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  localStorage.setItem('lexschedule_auth_status', 'logged_in');
  notifySubscribers(MOCK_USER);
  return MOCK_USER;
};

export const logoutUser = async () => {
  localStorage.removeItem('lexschedule_auth_status');
  notifySubscribers(null);
};

const notifySubscribers = (user: any) => {
  authSubscribers.forEach(cb => cb(user));
};

// No-op functions since cloud sync is removed
export const subscribeToAppointments = (userId: string, callback: (appts: any[]) => void) => {
  return () => {};
};

export const saveAppointmentToCloud = async (userId: string, appointment: any) => {
  return;
};

export const deleteAppointmentFromCloud = async (userId: string, appointmentId: string) => {
  return;
};
