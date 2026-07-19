import Header from "@/app/_components/header/Header";

export default async function StoreLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ storeSlug: string }>;
}) {
    const storeSlug = (await params).storeSlug;
    return (
        <>
            <Header storeSlug={storeSlug} />
            {children}
        </>
    );
}
