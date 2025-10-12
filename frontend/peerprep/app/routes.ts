import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("login", "pages/login.tsx"),
    route("signup", "pages/signup.tsx"),
    route("user", "pages/userpage.tsx"),
    route("admin/add", "pages/addquestionpage.tsx"),
    route("collab/:sessionId", "pages/collabpage.tsx"),
] satisfies RouteConfig;
