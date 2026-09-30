export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthCredentials = {
  email: string;
  password: string;
};
