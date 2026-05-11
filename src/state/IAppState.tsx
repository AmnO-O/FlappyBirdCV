import type { JSX } from "react";

export interface AppContext{
    changeState : (newState : IAppState) => void; 
}

export interface IAppState{
    render : (context : AppContext) => JSX.Element;
}