import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ token }) => !!token,
    },
    pages: {
        signIn: "/auth/signin",
    },
});

export const config = {
    matcher: [
        "/history",
        "/analysis/:path*",
        "/api/analyze",
        "/api/history",
        "/api/analysis/:path*",
    ],
};