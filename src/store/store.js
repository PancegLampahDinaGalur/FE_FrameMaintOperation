import { configureStore } from "@reduxjs/toolkit";
import { authReducer, persistAuthState } from "./authSlice";
import { teamApi } from "../services/teamApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [teamApi.reducerPath]: teamApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(teamApi.middleware),
});

let previousAuthState = store.getState().auth;
store.subscribe(() => {
  const authState = store.getState().auth;
  if (
    authState.accessToken !== previousAuthState.accessToken ||
    authState.rememberMe !== previousAuthState.rememberMe
  ) {
    persistAuthState(authState);
    previousAuthState = authState;
  }
});
