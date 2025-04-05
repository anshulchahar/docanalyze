export const config = {
    matcher: [], // Empty array disables the middleware entirely
};

export default function middleware() {
    // This will never run since matcher is empty
    return;
}