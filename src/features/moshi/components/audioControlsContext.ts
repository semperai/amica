import { createContext } from "react";
import { AudioControls } from "./audioControls";

const audioControls = new AudioControls();

export const AudioControlsContext = createContext({ audioControls });