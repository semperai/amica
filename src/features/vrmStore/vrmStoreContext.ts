import { createContext } from "react";
import { VrmStore } from "./vrmStore";

const vrmStore = new VrmStore();

export const VrmStoreContext = createContext({ vrmStore });