import React, { useContext, useImperativeHandle, useRef } from "react";
import NavBarButton from "@/components/layouts/pageLayout/sideMenu/components/NavBarButton";
import AppContext, {AppView} from "@/contexes/appContext";

export type NavBarView = 'horz'|'vert';

export type NavBarItemInfo = {
    title: string,
    icon: React.ReactNode,
    view: AppView,
    disabled?: boolean
}

export type NavBarProps = {
    view: NavBarView,
    items: NavBarItemInfo[],
    classList?: string,
    onNavigate: (view: AppView) => void
};

export type NavBarRef = {
    show: (duration: number) => void,
    hide: (duration: number) => void,
}

const NavBar = React.forwardRef<NavBarRef, NavBarProps>((
    { view, items, classList = "", onNavigate }, ref
) => {
    const { viewContext } = useContext(AppContext);

    const navBarRef = useRef<HTMLDivElement>(null);


    const show = (duration: number) => {
        navBarRef.current?.animate([{opacity: 0}, {opacity: 1}], {duration, fill: 'forwards'});
    };

    const hide = (duration: number) => {
        navBarRef.current?.animate([{opacity: 1}, {opacity: 0}], {duration, fill: 'forwards'});
    };


    useImperativeHandle(ref, () => {
        return {
            show,
            hide,
        };
    });

    const navigate = (view: AppView) => {
        const item = items.filter(item => item.view === view)[0];
        if (item) {
            viewContext.setView(view);
            onNavigate(view);
        }
    }

    return (
        <div style={{width: `${items.length * 48}px`}} ref={navBarRef} className={`flex ${view === 'horz' ? 'flex-row' : 'flex-col'} ${classList}`}>
            {items.map((item, idx) => (
                <NavBarButton key={idx} title={item.title} selected={item.view === viewContext.view} onClick={() => navigate(item.view)} disabled={item.disabled}>
                    {item.icon}
                </NavBarButton>
            ))}
        </div>
    )
});
NavBar.displayName = 'NavBar';

export default NavBar;