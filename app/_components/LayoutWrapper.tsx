"use client";

import { usePathname } from "next/navigation";
import Header from "./header/Header";
import { Suspense } from "react";

function HeaderController() {
    const pathname = usePathname();

    if (pathname.startsWith("/s/")) return null;

    return <Header />;
}

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Suspense
                fallback={
                    <div
                        style={{
                            minHeight: "10dvh",
                            maxHeight: "10dvh",
                            minWidth: "100%",
                            backgroundColor: "black",
                        }}
                    />
                }
            >
                <HeaderController />
            </Suspense>
            <Suspense fallback={<div style={{ minHeight: "80vh" }} />}>
                {children}
            </Suspense>
        </>
    );
}
