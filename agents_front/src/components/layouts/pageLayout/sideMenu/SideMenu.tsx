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
import PersonIcon from "@mui/icons-material/Person"
import ArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import ArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft"
import NavBar, {
    NavBarItemInfo,
    NavBarRef,
    NavBarView
} from "@/components/layouts/pageLayout/sideMenu/components/NavBar";
import ChatIcon from "@mui/icons-material/Chat";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BrushIcon from "@mui/icons-material/Brush";
import AppContext, {AppView} from "@/contexes/appContext";
import ChatView from "@/components/layouts/pageLayout/sideMenu/components/ChatView";
import DashboardsView from "@/components/layouts/pageLayout/sideMenu/components/DashboardsView";

export type SideMenuRef = {
    isExpanded: boolean,
    toggleExpand: (view: AppView, expanded?: boolean) => void,
    getWidth: () => number,
    setWidth: (width: number) => void,
    canvas: {
        show: (svg: string) => void
    }
}

export type SideMenuProps = {
    expandedWidth: number,
    isExpanded: boolean,
    setIsExpanded: (val: boolean) => void
}

const EmptyView = () => <></>;

const SideMenu = forwardRef<SideMenuRef, SideMenuProps>(({ isExpanded, setIsExpanded, expandedWidth }, ref) => {
    const { authContext, viewContext } = useContext(AppContext);

    const sectionRef = useRef<HTMLElement>(null);
    const menuAnimation = useRef<Animation|null>(null);
    const navBarWrapperRef = useRef<HTMLDivElement>(null);
    const navBarRef = useRef<NavBarRef>(null);
    const expandButtonRef = useRef<HTMLButtonElement>(null);
    const canvasDisplayRef = useRef<HTMLDivElement>(null);
    const contentWrapperRef = useRef<HTMLDivElement>(null);

    const [navBarView, setNavBarView] = useState<NavBarView>(isExpanded ? 'horz' : 'vert');
    const [canvasDisplay, setCanvasDisplay] = useState<string|null>(null);

    const navBarItems: NavBarItemInfo[] = useMemo(() => {
        return [
            {
              title: 'Dashboards',
              icon: <DashboardIcon/>,
              view: AppView.DASHBOARDS
            },
            {
                title: 'Conversas',
                icon: <ChatIcon/>,
                view: AppView.CHAT
            },
            {
                title: 'Canvas',
                icon: <BrushIcon/>,
                view: AppView.CANVAS,
                disabled: canvasDisplay === null,
            },
        ];
    }, [viewContext.view, canvasDisplay]);

    useEffect(() => {
        if (isExpanded && canvasDisplay && viewContext.view === AppView.CANVAS && canvasDisplayRef.current) {
            canvasDisplayRef.current.style.display = 'block';
            canvasDisplayRef.current.innerHTML = canvasDisplay;
        } else if (canvasDisplayRef.current) {
            canvasDisplayRef.current.style.display = 'none';
        }
    }, [isExpanded, canvasDisplay, viewContext.view]);

    const toggleExpand = useCallback((view: AppView, expanded: boolean|undefined = undefined) => {
        if (!sectionRef.current ||
            !navBarWrapperRef.current || !contentWrapperRef.current) {
            return;
        }

        expanded = (expanded === undefined) ? !isExpanded : expanded;
        const expansionChange = expanded !== isExpanded;
        const viewChange = view !== viewContext.view;

        if (!expansionChange && !viewChange) {
            return;
        }

        const contentWrapper = contentWrapperRef.current;
        const wrapper = sectionRef.current;
        const animationTiming = 150;
        const newWidth = expanded ? expandedWidth : 48;
        const currentContentDisplay = getComputedStyle(contentWrapper).opacity;
        const newContentDisplay = expanded ? '1' : '0';

        if (menuAnimation.current != null) {
            menuAnimation.current.commitStyles();
            menuAnimation.current.cancel();
        }

        setIsExpanded(expanded);

        if (expansionChange) {
            navBarRef.current?.hide(animationTiming);
        }

        const currentWidth = wrapper.getBoundingClientRect().width;
        wrapper.style.width = `${currentWidth}px`;
        const contentAnimationBreakpoints = [{opacity: currentContentDisplay}, {opacity: newContentDisplay}];
        const contentAnimationParams: KeyframeAnimationOptions = {duration: animationTiming, fill: 'forwards'};
        
        if (expansionChange && !expanded) {
            contentWrapper.animate(contentAnimationBreakpoints, contentAnimationParams)
            .addEventListener('finish', () => {
                contentWrapper.style.display = 'none';
            });
        }

        menuAnimation.current = wrapper.animate(
            [{width: `${currentWidth}px`}, {width: `${newWidth}px`}],
            {duration: animationTiming * 2.3, fill: 'forwards'}
        )

        menuAnimation.current.addEventListener('finish', () => {
            if (menuAnimation.current) {
                menuAnimation.current.commitStyles();
                menuAnimation.current = null;
            }

            if (expansionChange) {
                setNavBarView(expanded ? 'horz' : 'vert');
                navBarRef.current?.show(animationTiming);
                if (expanded) {
                    navBarWrapperRef.current!.style.display = 'flex';
                    navBarWrapperRef.current!.style.gridTemplateRows = '48px';
                    contentWrapper.style.display = '';
                    contentWrapper.animate(contentAnimationBreakpoints, contentAnimationParams)
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
        getWidth: () => {
          return sectionRef.current?.getBoundingClientRect().width ?? 0;
        },
        setWidth: (width: number) => {
            if (sectionRef.current) {
                if (menuAnimation.current) {
                    menuAnimation.current.commitStyles();
                    menuAnimation.current.cancel();
                    menuAnimation.current = null;
                }
                
                
                // Set width with higher specificity
                sectionRef.current.style.setProperty('width', `${width}px`, 'important');
            }
        },
        canvas: {
            show: canvasShow
        }
    }));

    const initialStyles = useMemo(() => {
        return {
            section: {
              width: isExpanded ? expandedWidth : '48px'
            },
            navBarWrapper: {
                display: isExpanded ? 'flex' : 'grid',
                gridTemplateRows: isExpanded ? '48px' : '48px 1fr'
            },
            contentWrapper: {
                display: isExpanded ? 'block' : 'hidden',
                opacity: isExpanded ? '1' : '0'
            }
        };
    }, []);

    const View = useMemo(() => {
        switch (viewContext.view) {
            case AppView.CHAT: return ChatView;
            case AppView.DASHBOARDS: return DashboardsView;
            default: return EmptyView;
        }
    }, [viewContext.view])

    return (
        <section ref={sectionRef} style={initialStyles.section} className={`bg-[#151515] text-[#DDD] h-full`}>
            <div className="h-full w-full grid grid-cols-1 gap-y-4 grid-rows-[auto_1fr]">
                <div style={initialStyles.navBarWrapper} ref={navBarWrapperRef} className="grid-cols-1">
                    <button ref={expandButtonRef} type="button" className="flex items-center justify-center col-start-1 row-start-1
                    justify-self-start
                    hover:text-white cursor-pointer w-[48px] h-[48px]" onClick={() => toggleExpand(viewContext.view)}>
                        {isExpanded
                            ? <ArrowRightIcon className="h-[24px] w-[24px]"/>
                            : <ArrowLeftIcon className="h-[24px] w-[24px]"/>
                        }
                    </button>
                    <div className="w-full overflow-x-hidden">
                        <NavBar ref={navBarRef} view={navBarView} items={navBarItems} onNavigate={async (view) => {
                            toggleExpand(view, true);
                        }}/>
                    </div>
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
                <div ref={contentWrapperRef} style={initialStyles.contentWrapper} className="w-full h-full font-mono">
                    <View/>
                </div>
            </div>
        </section>
    );
});
SideMenu.displayName = "SideMenu";

export default SideMenu;