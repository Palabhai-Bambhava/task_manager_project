import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const theme = extendTheme({
  styles: {
    global: (props) => ({
      body: {
        bg: mode("gray.100", "gray.900")(props),
      },
    }),
  },
});

export default theme;