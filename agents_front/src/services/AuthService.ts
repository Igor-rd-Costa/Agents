import axios from 'axios'
import {LoginDTO, RegisterDTO} from "@/types/auth";


class AuthService {
    private route: string = "http://127.0.0.1:8000/auth";

    async Login(info: LoginDTO) {
        const result = await axios.post<string>(`${this.route}/login`, info);
        if (result.status === 200) {
            return result.data;
        }
        return null;
    }

    async Register(info: RegisterDTO) {
        const result = await axios.post(`${this.route}/register`, info);
        return result.status === 200;
    }
}

export const authService = new AuthService();