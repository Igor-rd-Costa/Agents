'use client'
import EditNoteIcon from "@mui/icons-material/EditNote"
import Menu from "@mui/icons-material/Menu"
import {useContext, useEffect, useRef, useState} from "react";
import ChatContext from "@/contexes/chatContext";
import {Chat} from "@/types/chat";
import SmartToyIcon from "@mui/icons-material/SmartToy"
import PersonIcon from "@mui/icons-material/Person"
import {usePathname} from "next/navigation";
import {TalksChildren} from "@/components/layouts/pageLayout/sideMenu/children/TalksChildren";
import AuthContext from "@/contexes/authContext";

type MenuItemProps = {
    icon: React.ReactNode,
    label: string,
    route: string,
    selected?: boolean
}

type MenuItemInfo = MenuItemProps & {
    children: React.ReactNode
}

const MenuItem = ({icon = <></>, label = "", route= "", selected = false}: MenuItemProps) => {
    return (
        <a href={route} className={`flex gap-x-2 ${selected ? 'text-white' : ''} hover:text-white cursor-pointer`}>
            {icon} {label}
        </a>
    );
}

const menuItems: MenuItemInfo[] = [
    {icon: <EditNoteIcon/>, label: "Conversas", route: '/', children: <TalksChildren/>},
    {icon: <SmartToyIcon/>, label: "Agentes", route: '/agents', children: <></>},
];

export default function SideMenu() {
    const chatContext = useContext(ChatContext);
    const authContext = useContext(AuthContext);
    const [chats, setChats] = useState<Chat[]>([]);
    const isExpanded = useRef<boolean>(true);
    const section = useRef<HTMLElement>(null);
    const menuAnimation = useRef<Animation|null>(null);
    const pathName = usePathname();

    useEffect(() => {
        chatContext.chatService.getChats().then(c => {
            setChats(c)
        });
    }, []);

    useEffect(() => {
        if (chatContext.chat.id !== null && chats.filter(c => c.id === chatContext.chat.id).length === 0) {
            setChats([...chats, chatContext.chat]);
        }
    }, [chatContext.chat]);

    const toggleExpand = () => {
        if (!section.current) {
            return;
        }

        const currentWidth = section.current.getBoundingClientRect().width;
        const newWidth = isExpanded.current ? 48 : 256;
        if (menuAnimation.current) {
            menuAnimation.current.cancel();
        }

        isExpanded.current = !isExpanded.current;
        menuAnimation.current = section.current.animate(
            [{width: `${currentWidth}px`}, {width: `${newWidth}px`}],
            {duration: 200, fill: 'forwards'}
        );

        menuAnimation.current.addEventListener('finish', () => {
            menuAnimation.current?.commitStyles();
            menuAnimation.current = null;
        });
    }

    return (
        <section ref={section} className="h-full w-[256px] bg-[#151515] p-3 pt-4 font-mono">
            <div className="h-fit w-full grid grid-cols-1 gap-y-12">
                <div>
                    <button type="button" className="hover:white cursor-pointer" onClick={toggleExpand}>
                        <Menu/>
                    </button>
                </div>

                <div>
                    {authContext.user ?
                        <button className="flex gap-x-2 items-center hover:text-white cursor-pointer">
                            <div className="border rounded-full flex items-center align-center">
                                <PersonIcon/>
                            </div>
                            {authContext.user.username}
                        </button>
                        : <a href="/login" className="flex gap-x-2 items-center hover:text-white cursor-pointer">
                            <div className="border rounded-full flex items-center align-center">
                                <PersonIcon/>
                            </div>
                            Login
                        </a>
                    }
                </div>

                <div className="grid gap-y-12 text-[#DDD] overflow-hidden text-nowrap">
                    <div className="grid gap-y-2">
                        {menuItems.map((item, index) =>
                            <MenuItem key={index} icon={item.icon} label={item.label}
                                      route={item.route} selected={pathName === item.route}/>
                        )}
                    </div>
                    <div>
                        {menuItems.filter(i => i.route === pathName)[0]?.children ?? <></>}
                    </div>
                </div>
            </div>
        </section>
    );
}