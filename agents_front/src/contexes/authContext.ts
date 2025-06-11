import {createContext} from "react";
import {User} from "@/types/auth";
import {authService, AuthService} from "@/services/AuthService";

export type AuthContextType = {
    user: User | null,
    setUser: (user: User|null) => void,
    authService: AuthService
}

const defaultContext = {
    user: null,
    setUser: () => {},
    authService: authService
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export default AuthContext;