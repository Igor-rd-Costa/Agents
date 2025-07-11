'use client'
import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField";
import {useRouter} from "next/navigation";
import Link from "next/link";
import React, {useContext, useEffect, useRef} from "react";
import AuthContext from "@/contexes/authContext";

export default function Page() {
    const router = useRouter();
    const { user, setUser, authService } = useContext(AuthContext);
    const usernameInput = useRef<HTMLInputElement>(null);
    const emailInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            router.push("/");
        }
    }, [user, router]);

    const onRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        const username = usernameInput.current?.value ?? null;
        const email = emailInput.current?.value ?? null;
        const password = passwordInput.current?.value ?? null;
        if (!username || !email || !password) {
            return;
        }
        const u = await authService.register({username, email, password});
        if (u) {
            setUser(u);
            router.push("/");
        }
    }

    return (
        <div className="w-full h-full">
            <div className="lg:w-[45%] h-full grid grid-cols-1 justify-items-center pt-[3rem] bg-[#101010FF]">
                <form className="grid max-w-[24rem] w-full mt-[5rem] h-fit p-2 gap-y-4" onSubmit={onRegister}>
                    <h2 className="text-[1.8rem] justify-self-center">Register</h2>
                    <p className="text-[0.8rem] w-full text-[#CCCF] mt-8 text-center">Already have an account?
                      <Link className="underline hover:text-white ml-1" href="/login">Log in</Link>
                    </p>
                    <TextField inputRef={usernameInput} variant={'standard'} label="Username"></TextField>
                    <TextField inputRef={emailInput} variant={'standard'} label="Email"></TextField>
                    <TextField inputRef={passwordInput} variant={'standard'} label="Password" type="password"></TextField>
                    <Button variant="contained" type="submit">Register</Button>
                </form>
            </div>
        </div>
    );
}