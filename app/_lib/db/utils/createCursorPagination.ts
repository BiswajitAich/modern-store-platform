interface CursorPaginationParams<TCurcor> {
    cursor?: TCurcor | null;
    take?: number;
    orderBy?: "asc" | "desc";
}

interface CursorPaginationResult<TCursor> {
    take: number;
    skip?: number;
    cursor?: {
        id: TCursor;
    };
    orderBy: Array<{
        createdAt?: "asc" | "desc";
        id?: "asc" | "desc";
    }>;
}

export function createCursorPagination<TCursor extends number | string>({
    cursor,
    take = 12,
    orderBy = "desc",
}: CursorPaginationParams<TCursor>): CursorPaginationResult<TCursor> {
    return {
        take: take + 1,

        ...(cursor && {
            cursor: {
                id: cursor,
            },
            skip: 1,
        }),

        orderBy: [
            { createdAt: "desc" },
            { id: orderBy },
        ]
    };
}