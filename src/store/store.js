import { configureStore } from "@reduxjs/toolkit";
import { teamApi } from "../services/teamApi";

export const store = configureStore({
  reducer: {
    [teamApi.reducerPath]: teamApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(teamApi.middleware),
});
