import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { DEFAULT_MARKET_SYMBOL } from "../../constants/markets";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface AppState {
  connectionStatus: ConnectionStatus;
  requestedSymbol: string;
}

const initialState: AppState = {
  connectionStatus: "connecting",
  requestedSymbol: DEFAULT_MARKET_SYMBOL,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setConnectionStatus(state, action: PayloadAction<ConnectionStatus>) {
      state.connectionStatus = action.payload;
    },
    setRequestedSymbol(state, action: PayloadAction<string>) {
      state.requestedSymbol = action.payload;
    },
  },
});

export const { setConnectionStatus, setRequestedSymbol } = appSlice.actions;
export const appReducer = appSlice.reducer;
