import { createContext, useContext } from "react";

export interface SocketRuntimeValue {
  subscribeCombinedStream: (
    streamPath: string,
    listener: (payload: unknown) => void,
  ) => () => void;
}

export const SocketContext = createContext<SocketRuntimeValue | null>(null);

export const useSocketRuntime = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocketRuntime must be used within a SocketProvider");
  }

  return context;
};
