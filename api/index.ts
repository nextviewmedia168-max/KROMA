import serverCjs from "../dist/server.cjs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default serverCjs.default || serverCjs;

