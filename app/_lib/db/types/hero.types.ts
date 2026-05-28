export interface HeroDTO {
    id: number;
    title: string;
    product: {
        slug: string;
    } | null;
    admin: {
        storeSlug: string;
    };
    category: {
        slug: string;
    } | null;
    subtitle: string | null;
    image: string;
    sortOrder: number;
    buttonText: string | null;
}