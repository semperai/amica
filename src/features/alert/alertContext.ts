import { createContext } from "react";
import { Alert } from "./alert";

const alert = new Alert();

export const AlertContext = createContext({ alert });
