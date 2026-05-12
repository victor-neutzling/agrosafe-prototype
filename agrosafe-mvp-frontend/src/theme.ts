import { extendTheme } from "@mui/joy/styles";

export const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: "#e9f6ec",
          100: "#c8e6c9",
          200: "#a5d6a7",
          300: "#81c784",
          400: "#66bb6a",
          500: "#27743a",
          600: "#2f8a45",
          700: "#1f5c2d",
          800: "#174423",
          900: "#102e18",
        },

        success: {
          50: "#eefbf0",
          100: "#d7f5dc",
          500: "#4caf50",
          600: "#43a047",
          700: "#2e7d32",
        },

        warning: {
          50: "#fff8db",
          100: "#fff195",
          200: "#ffe066",
          300: "#ffd43b",
          400: "#fcc419",
          500: "#f2c94c",
          600: "#d4ad3f",
          700: "#b8952f",
        },

        danger: {
          50: "#fdecec",
          100: "#f5b5b5",
          300: "#e57373",
          500: "#d64545",
          600: "#b93838",
          700: "#912d2d",
        },

        neutral: {
          50: "#f8faf8",
          100: "#eef1ee",
          200: "#e0e5e0",
          300: "#cdd5cd",
          400: "#9aa69a",
          500: "#6b756b",
          600: "#4a524a",
          700: "#2f352f",
          800: "#1f241f",
          900: "#141814",
        },

        background: {
          body: "#f8faf8",
          surface: "#ffffff",
        },

        text: {
          primary: "#1f241f",
          secondary: "#4a524a",
        },
      },
    },
  },

  fontFamily: {
    body: "Inter, sans-serif",
    display: "Inter, sans-serif",
  },

  components: {
    JoyButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          fontWeight: 600,
        },
      },
    },
    JoyCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
  },
});
