import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("Pages/LoginPage.tsx"),
    route("/signup", "Pages/SignupPage.tsx"),
    route("/user", "Pages/UserPage.tsx"),
    route("/reset-password", "Pages/ResetPasswordPage.tsx"),
    route("/questions", "Pages/QuestionsPage.tsx"),
    route("/questions/add", "Pages/AddQuestionPage.tsx"),
    route("/questions/edit/:id", "Pages/EditQuestionPage.tsx"),
    route("/collab/:sessionId", "Pages/CollabPage.tsx"),
] satisfies RouteConfig;
