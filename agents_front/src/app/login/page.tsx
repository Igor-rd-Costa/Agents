'use client'
import React, {useContext, useEffect, useRef} from 'react'
import Link from 'next/link'
import Button from '@mui/material/Button';
import TextField from "@mui/material/TextField";
import {useRouter} from "next/navigation";
import AuthContext from "@/contexes/authContext";

export default function Page() {
    const router = useRouter();
    const { user, setUser, authService } = useContext(AuthContext);
    const emailInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            router.push("/");
        }
    }, [user, router]);

    const onLogin = async (e: React.FormEvent)=> {
        e.preventDefault();
        const email = emailInput.current?.value ?? null;
        const password = passwordInput.current?.value ?? null;
        if (!email || !password) {
            return;
        }
        const u = await authService.Login({email, password});
        if (u) {
            setUser(u);
            router.push("/");
        }
    }

    return (
        <div className="w-full h-full">
            <div className="lg:w-[45%] h-full grid grid-cols-1 justify-items-center pt-[3rem] bg-[#101010FF]">
                <form className="grid max-w-[24rem] w-full mt-[5rem] h-fit p-2 gap-y-4" onSubmit={onLogin}>
                    <h2 className="text-[1.8rem] justify-self-center">Login</h2>
                    <p className="text-[0.8rem] text-[#BBBF] mt-8 text-center">Don&#39;t have an account?
                        <Link className="underline hover:text-white ml-1" href="/register">Create one for free</Link>
                    </p>
                    <TextField inputRef={emailInput} variant={'standard'} label="Email"/>
                    <TextField inputRef={passwordInput} variant={'standard'} label="Password" type="password"/>
                    <Button variant="contained" type="submit">Login</Button>
                </form>
            </div>
        </div>
    );
}