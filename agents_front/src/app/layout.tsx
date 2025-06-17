'use client'
import "./globals.css";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v13-appRouter";
import { Roboto } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import AuthContext, {AuthContextType} from "@/contexes/authContext";
import { useState } from "react";
import {User} from "@/types/auth";
import {authService} from "@/services/AuthService";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [ user, setUser ] = useState<User|null>(null);
  const authContext: AuthContextType = {
    user,
    setUser,
    authService
  };

  return (
    <html lang="en" className={roboto.variable}>
      <head>
        <title>Agents</title>
      </head>
      <body className="w-screen h-screen">
        <AuthContext.Provider value={authContext}>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              {children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </AuthContext.Provider>
      </body>
    </html>
  );
}
