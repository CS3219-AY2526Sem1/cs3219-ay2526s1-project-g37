import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("pages/LoginPage.tsx"),
    route("signup", "pages/SignupPage.tsx"),
    route("user", "pages/UserPage.tsx"),
    route("questions", "pages/QuestionsPage.tsx"),
    route("questions/add", "pages/AddQuestionPage.tsx"),
    route("collab/:sessionId", "pages/CollabPage.tsx"),
] satisfies RouteConfig;
