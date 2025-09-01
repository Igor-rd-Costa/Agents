'use client'
import "./globals.css";
import {AppRouterCacheProvider} from "@mui/material-nextjs/v13-appRouter";
import {Roboto} from 'next/font/google';
import {ThemeProvider} from '@mui/material/styles';
import theme from '../theme';
import React, {RefObject, useEffect, useState} from "react";
import {User} from "@/types/auth";
import {authService} from "@/services/AuthService";
import chatService from "@/services/ChatService";
import mcpService from "@/services/MCPService";
import AppContext, {AppContextType, AppView} from "@/contexes/appContext";
import {SideMenuRef} from "@/components/layouts/pageLayout/sideMenu/SideMenu";
import {useRouter} from "next/navigation";
import {Chat} from "@/types/chat/Chat";
import dashboardService from "@/services/DashboardService";
import {DashboardDTO} from "@/types/dashboard";

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
  const [ view, setView ] = useState<AppView>(AppView.DASHBOARDS);
  const [ chat, setChat ] = useState<Chat>(new Chat());
  const [ dashboard, setDashboard ] = useState<DashboardDTO>(null);
  const [ mcp, setMcp ] = useState<any>({});
  const [ sideMenuRef, setSideMenuRef ] = useState<RefObject<SideMenuRef|null>>({current: null});
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      authService.getLoggedUser().then(loggedUser => {
        if (loggedUser !== null) {
          setUser(loggedUser);
        } else {
          router.push('/login');
        }
      });
    }
  }, [user])


  const appContext: AppContextType = {
    authContext: {
      user,
      setUser,
      authService
    },
    viewContext: {
      view,
      setView
    },
    dashboardContext: {
      dashboard,
      setDashboard,
      dashboardService: dashboardService
    },
    chatContext: {
      chat,
      setChat,
      chatService
    },
    mcpContext: {
      mcp,
      setMcp,
      mcpService
    },
    components: {
      sideMenuRef,
      setSideMenuRef
    }
  }

  return (
    <html lang="en" className={roboto.variable}>
      <head>
        <title>Agents</title>
      </head>
      <body className="w-screen h-screen">
        <AppRouterCacheProvider>
          <AppContext.Provider value={appContext}>
            <ThemeProvider theme={theme}>
              {children}
            </ThemeProvider>
          </AppContext.Provider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
