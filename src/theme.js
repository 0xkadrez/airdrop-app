import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Inter, sans-serif',
  },
  colors: {
    ultraviolet: {
      50: "#f5e9ff",
      100: "#dac1f5",
      200: "#bf99ea",
      300: "#a66edf",
      400: "#8c42d3",
      500: "#7329ba", // Color principal
      600: "#5a1f9a",
      700: "#41157a",
      800: "#280b5b",
      900: "#14023b",
    },
    darkPurple: {
      50: "#e9e6ff",
      100: "#c5b9ff",
      200: "#a08cff",
      300: "#7b5eff",
      400: "#5631fe",
      500: "#4318e5",
      600: "#3312b3",
      700: "#250d81",
      800: "#160750",
      900: "#0a0220",
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.900",
        color: "white",
      },
    },
  },
  components: {
    Button: {
      variants: {
        solid: {
          bg: "ultraviolet.500",
          color: "white",
          _hover: {
            bg: "ultraviolet.400",
            _disabled: {
              bg: "ultraviolet.500",
            },
          },
          _active: {
            bg: "ultraviolet.600",
          },
        },
        outline: {
          borderColor: "ultraviolet.500",
          color: "ultraviolet.500",
          _hover: {
            bg: "ultraviolet.50",
            color: "ultraviolet.600",
          },
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderColor: "gray.600",
            _hover: {
              borderColor: "ultraviolet.400",
            },
            _focus: {
              borderColor: "ultraviolet.500",
              boxShadow: "0 0 0 1px #7329ba",
            },
          },
        },
      },
    },
    Textarea: {
      variants: {
        outline: {
          borderColor: "gray.600",
          _hover: {
            borderColor: "ultraviolet.400",
          },
          _focus: {
            borderColor: "ultraviolet.500",
            boxShadow: "0 0 0 1px #7329ba",
          },
        },
      },
    },
  },
});

export default theme; 