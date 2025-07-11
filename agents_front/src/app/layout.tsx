'use client'
import "./globals.css";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v13-appRouter";
import { Roboto } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import AuthContext, {AuthContextType} from "@/contexes/authContext";
import {useEffect, useState} from "react";
import {User} from "@/types/auth";
import {authService} from "@/services/AuthService";
import ChatContext, {ChatContextType} from "@/contexes/chatContext";
import chatService from "@/services/ChatService";
import {Chat} from "@/types/chat";
import MCPContext, {MCPContextType} from "@/contexes/mcpContext";
import mcpService from "@/services/MCPService";

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
  const [ chat, setChat ] = useState<Chat>(chatService.emptyChat());
  const [ mcp, setMcp ] = useState<any>({});
  const [validatedUser, setValidatedUser] = useState(false);

  useEffect(() => {
    if (user === null) {
      authService.getLoggedUser().then(loggedUser => {
        if (loggedUser !== null) {
          setUser(loggedUser);
          setValidatedUser(true)
        }
      });
    } else {
      setValidatedUser(true);
    }
  }, [user])


  const authContext: AuthContextType = {
    user,
    setUser,
    authService
  };

  const chatContext: ChatContextType = {
    chat,
    setChat,
    chatService
  }

  const mcpContext: MCPContextType = {
    mcp,
    setMcp,
    mcpService
  };



  return (
    <html lang="en" className={roboto.variable}>
      <head>
        <title>Agents</title>
      </head>
      <body className="w-screen h-screen">
      <AuthContext.Provider value={authContext}>
        <MCPContext.Provider value={mcpContext}>
          <ChatContext.Provider value={chatContext}>
            <AppRouterCacheProvider>
              <ThemeProvider theme={theme}>
                {children}
              </ThemeProvider>
            </AppRouterCacheProvider>
          </ChatContext.Provider>
        </MCPContext.Provider>
      </AuthContext.Provider>
      </body>
    </html>
  );
}
