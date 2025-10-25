import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("Pages/login.tsx"),
    route("signup", "Pages/signup.tsx"),
    route("user", "Pages/userpage.tsx"),
    route("questions", "Pages/adminpage.tsx"),
    route("questions/add", "Pages/addquestionpage.tsx"),
    route("collab/:sessionId", "Pages/collabpage.tsx"),
] satisfies RouteConfig;
