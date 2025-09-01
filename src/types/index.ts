export interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth?: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, dateOfBirth: string) => Promise<void>;
  verifyOtp: (email: string, otp: string, password: string, name: string, dateOfBirth: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}