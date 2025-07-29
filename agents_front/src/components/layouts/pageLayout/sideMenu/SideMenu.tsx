'use client'
import React, {
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState
} from "react";
import {Chat} from "@/types/chat";
import PersonIcon from "@mui/icons-material/Person"
import {usePathname} from "next/navigation";
import ArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import ArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft"
import NavBar, {
    NavBarItemInfo,
    NavBarRef,
    NavBarView
} from "@/components/layouts/pageLayout/sideMenu/components/NavBar";
import ChatIcon from "@mui/icons-material/Chat";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import HardwareIcon from "@mui/icons-material/Hardware";
import BrushIcon from "@mui/icons-material/Brush";
import AppContext, {AppView} from "@/contexes/appContext";

export type SideMenuRef = {
    isExpanded: boolean,
    toggleExpand: (view: AppView, expanded?: boolean) => void,
    canvas: {
        show: (svg: string) => void
    }
}

export const sideMenuCanvasWidth = 384;

const SideMenu = forwardRef<SideMenuRef>(({}, ref) => {
    const pathName = usePathname();

    const { authContext, chatContext, viewContext } = useContext(AppContext);

    const sectionRef = useRef<HTMLElement>(null);
    const menuAnimation = useRef<Animation|null>(null);
    const navBarWrapperRef = useRef<HTMLDivElement>(null);
    const navBarRef = useRef<NavBarRef>(null);
    const expandButtonRef = useRef<HTMLButtonElement>(null);
    const canvasDisplayRef = useRef<HTMLDivElement>(null);

    const [chats, setChats] = useState<Chat[]>([]);
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    const [navBarView, setNavBarView] = useState<NavBarView>(isExpanded ? 'horz' : 'vert');
    const [canvasDisplay, setCanvasDisplay] = useState<string|null>(null);

    const navBarItems: NavBarItemInfo[] = useMemo(() => {
        return [
            {
                title: 'Conversas',
                icon: <ChatIcon/>,
                view: AppView.CHATS
            },
            {
                title: 'Canvas',
                icon: <BrushIcon/>,
                view: AppView.CANVAS
            },
            {
                title: 'Agentes',
                icon: <SmartToyIcon/>,
                view: AppView.AGENTS
            },
            {
                title: 'MCP',
                icon: <HardwareIcon/>,
                view: AppView.MCP
            },
        ];
    }, [viewContext.view]);

    useEffect(() => {
        if (pathName === '/') {
            chatContext.chatService.getChats().then(c => {
                setChats(c)
            });
        }
    }, [navBarItems]);

    useEffect(() => {
        if (chatContext.chat.id !== null && chats.filter(c => c.id === chatContext.chat.id).length === 0) {
            setChats([...chats, chatContext.chat]);
        }
    }, [chatContext.chat]);

    useEffect(() => {
        if (isExpanded && canvasDisplay && viewContext.view === AppView.CANVAS && canvasDisplayRef.current) {
            canvasDisplayRef.current.style.display = 'block';
            canvasDisplayRef.current.innerHTML = canvasDisplay;
        } else if (canvasDisplayRef.current) {
            canvasDisplayRef.current.style.display = 'none';
        }
    }, [isExpanded, canvasDisplay, viewContext.view]);

    const toggleExpand = useCallback((view: AppView, expanded: boolean|undefined = undefined) => {
        if (!sectionRef.current || !sectionRef.current.firstElementChild || !navBarWrapperRef.current) {
            return;
        }

        expanded = (expanded === undefined) ? !isExpanded : expanded;
        const expansionChange = expanded !== isExpanded;
        const viewChange = view !== viewContext.view;

        if (!expansionChange && !viewChange) {
            return;
        }

        const wrapper = sectionRef.current.firstElementChild;
        const animationTiming = 150;
        const newWidth = expanded
            ? view === AppView.CANVAS ? sideMenuCanvasWidth : 256
            : 48;

        if (menuAnimation.current) {
            menuAnimation.current.cancel();
        }

        setIsExpanded(expanded)
        sessionStorage.setItem('side-menu-isExpanded', String(expanded));

        if (expansionChange) {
            navBarRef.current?.hide(animationTiming);
        }

        const wrapperShouldRetract =
            (view === AppView.CANVAS && !expanded)
            || (viewContext.view === AppView.CANVAS && view !== AppView.CANVAS);
        const wrapperChange =
            wrapperShouldRetract
            || (viewContext.view !== AppView.CANVAS && view === AppView.CANVAS);

        if (wrapperChange) {
            const section = sectionRef.current;
            const currentSectionWidth = section.getBoundingClientRect().width;
            const newWrapperWidth = wrapperShouldRetract ? 48 : newWidth;
            if (currentSectionWidth !== newWrapperWidth) {
                section.animate([{width: `${currentSectionWidth}px`}, {width: `${newWrapperWidth}px`}], {duration: animationTiming * 2.3, fill: 'forwards'});
            }
        }

        const currentWidth = wrapper.getBoundingClientRect().width;
        menuAnimation.current = wrapper.animate(
            [{width: `${currentWidth}px`}, {width: `${newWidth}px`}],
            {duration: animationTiming * 2.3, fill: 'forwards'}
        );

        menuAnimation.current.addEventListener('finish', () => {
            menuAnimation.current = null;
            if (expansionChange) {
                setNavBarView(expanded ? 'horz' : 'vert');
                navBarRef.current?.show(animationTiming);
                if (expanded) {
                    navBarWrapperRef.current!.style.display = 'flex';
                    navBarWrapperRef.current!.style.gridTemplateRows = '48px';
                } else {
                    navBarWrapperRef.current!.style.display = 'grid';
                    navBarWrapperRef.current!.style.gridTemplateRows = '48px 1fr';
                }
            }
        });
    }, [isExpanded, viewContext.view]);

    const canvasShow = (svg: string) => {
        viewContext.setView(AppView.CANVAS);
        toggleExpand(AppView.CANVAS, true);
        setCanvasDisplay(svg);
    }

    useImperativeHandle(ref, () => ({
       isExpanded,
       toggleExpand,
        canvas: {
            show: canvasShow
        }
    }));

    const initialStyles = useMemo(() => {
        return {
            navBarWrapper: {
                display: isExpanded ? 'flex' : 'grid',
                gridTemplateRows: isExpanded ? '48px' : '48px 1fr'
            }
        };
    }, []);

    return (
        <section ref={sectionRef} className="h-full w-[48px] overflow-x-visible z-[1] font-mono">
            <div style={{width: isExpanded ? '256px' : '48px'}}  className="bg-[#151515] text-[#DDD] h-full">
                <div className="h-fit w-full grid grid-cols-1 gap-y-12">
                    <div style={initialStyles.navBarWrapper} ref={navBarWrapperRef} className="grid-cols-1">
                        <div className="w-full overflow-x-hidden">
                            <NavBar ref={navBarRef} view={navBarView} items={navBarItems} onNavigate={async (view) => {
                                toggleExpand(view, true);
                            }}/>
                        </div>
                        <button ref={expandButtonRef} type="button" className="flex items-center justify-center col-start-1 row-start-1
                        justify-self-end
                        hover:text-white cursor-pointer w-[48px] h-[48px]" onClick={() => toggleExpand(viewContext.view)}>
                            {isExpanded
                                ? <ArrowLeftIcon className="h-[24px] w-[24px]"/>
                                : <ArrowRightIcon className="h-[24px] w-[24px]"/>
                            }
                        </button>
                    </div>

                    {isExpanded ?? (
                        <>
                            <div className="pl-2 pr-2">
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
                        </>
                    )}
                    <div ref={canvasDisplayRef} style={{width: `${sideMenuCanvasWidth}px`, height: `${sideMenuCanvasWidth}px`, display: 'none'}} className="p-4"></div>
                </div>
            </div>
        </section>
    );
});
SideMenu.displayName = "SideMenu";

export default SideMenu;