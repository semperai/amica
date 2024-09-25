import { createContext } from "react";
import { AmicaLife } from "./amicaLife";

const amicaLife = new AmicaLife();

export const AmicaLifeContext = createContext({ amicaLife });