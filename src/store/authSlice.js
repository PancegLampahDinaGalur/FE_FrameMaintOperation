import { createSlice } from "@reduxjs/toolkit";

const accessTokenKey = "frame-maint-access-token";
const rememberedTokenKey = "frame-maint-remembered-token";
const rememberedToken = typeof window === "undefined"
  ? null
  : localStorage.getItem(rememberedTokenKey);
const storedToken = typeof window === "undefined"
  ? null
  : sessionStorage.getItem(accessTokenKey) || rememberedToken;

const authSlice = createSlice({
  name: "auth",
  initialState: { accessToken: storedToken, rememberMe: Boolean(rememberedToken) },
  reducers: {
    setCredentials(state, action) {
      const { accessToken, rememberMe } = action.payload;
      state.accessToken = accessToken;
      state.rememberMe = rememberMe;
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.rememberMe = false;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export const authReducer = authSlice.reducer;

export function persistAuthState(state) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(accessTokenKey);
  localStorage.removeItem(rememberedTokenKey);
  if (!state.accessToken) return;
  if (state.rememberMe) {
    localStorage.setItem(rememberedTokenKey, state.accessToken);
  } else {
    sessionStorage.setItem(accessTokenKey, state.accessToken);
  }
}
