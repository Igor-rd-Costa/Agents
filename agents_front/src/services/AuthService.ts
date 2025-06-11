import axios from 'axios'
import {LoginDTO, RegisterDTO, User} from "@/types/auth";


export class AuthService {
    private route: string = "http://127.0.0.1:8000/auth";

    async Login(info: LoginDTO) {
        const {status, data} = await axios.post<User>(`${this.route}/login`, info, {withCredentials: true});
        if (status === 200) {
            return data;
        }
        return null;
    }

    async Register(info: RegisterDTO) {
        const {status, data} = await axios.post<User>(`${this.route}/register`, info, {withCredentials: true});
        if (status === 200) {
            return data;
        }
        return null;
    }
}

export const authService = new AuthService();