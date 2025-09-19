import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";

import {
  createTheme,
  MantineProvider,
  Container,
  Button,
  Input,
  Pill,
} from "@mantine/core";

import type { Route } from "./+types/root";
import "./app.css";
import Header from "./components/header/header";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

const theme = createTheme({
  /** mantine theme overrides */
  colors: {
    "brand-yellow": [
      "#fff9df",
      "#fff2ca",
      "#ffe399",
      "#ffd463",
      "#ffc736",
      "#ffc01e",
      "#ffba02",
      "#e4a300",
      "#cb9100",
      "#af7c00",
    ],
    "custom-gray": [
      "#f5f5f4",
      "#e7e7e7",
      "#cdcdcd",
      "#b2b2b2",
      "#9a9a9a",
      "#8b8b8b",
      "#848484",
      "#717171",
      "#646464",
      "#343231",
    ],
    green: [
      "#e5ffe5",
      "#cefecf",
      "#9ffa9f",
      "#6bf76b",
      "#48f548",
      "#24f324",
      "#0df212",
      "#00d701",
      "#00c000",
      "#00a600",
    ],

    yellow: [
      "#fff9df",
      "#fff2ca",
      "#ffe399",
      "#ffd463",
      "#ffc736",
      "#ffc01e",
      "#ffba02",
      "#e4a300",
      "#cb9100",
      "#af7c00",
    ],

    red: [
      "#ffe7e8",
      "#ffcece",
      "#ff9b9b",
      "#ff6464",
      "#fe3736",
      "#fe1b19",
      "#ff0000",
      "#e40000",
      "#cb0000",
      "#b20000",
    ],
  },

  components: {
    Button: Button.extend({
      defaultProps: {
        variant: "filled",
        color: "brand-yellow",
        c: "custom-gray.9",
      },
    }),

    Input: Input.extend({}),

    InputWrapper: Input.Wrapper.extend({
      classNames: {
        label: "text-white",
        error: "text-red-500",
      },
    }),

    Pill: {
      styles: {
        root: {
          backgroundColor: "var(--mantine-color-brand-yellow-7)",
          color: "var(--mantine-color-dark-filled)",
        },
      },
    }
  },

  primaryColor: "brand-yellow",
  primaryShade: { light: 6, dark: 6 },
});

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();
  const linksWithHeader = ["/user"];

  const isHeader = () => {
    return linksWithHeader.includes(location.pathname);
  };

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      {isHeader() && <Header />}
      <Container fluid>{<Outlet />}</Container>
    </MantineProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
