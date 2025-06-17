import EditNote from "@mui/icons-material/EditNote"
import Menu from "@mui/icons-material/Menu"
import {useContext, useRef} from "react";
import ChatContext from "@/contexes/chatContext";
import chatService from "@/services/ChatService";

export default function ChatsSection() {
    const chatContext = useContext(ChatContext)
    const isExpanded = useRef<boolean>(true);
    const section = useRef<HTMLElement>(null);
    const menuAnimation = useRef<Animation|null>(null);

    const newChat = () => {
        chatContext.setChat(chatService.emptyChat());
    }

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
        <section ref={section} className="h-full w-[256px] bg-[#151515] p-3 pt-4">
            <div>
                <button type="button" className="hover:white cursor-pointer" onClick={toggleExpand}>
                    <Menu/>
                </button>
            </div>
            <div className="mt-12 overflow-hidden text-nowrap">
                <button onClick={newChat} type="button" className="flex gap-x-2 hover:text-white cursor-pointer">
                    <EditNote/> Nova Conversa
                </button>
            </div>
        </section>
    );
}