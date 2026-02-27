import getenv from "getenv";

export const config = {
  URL: getenv.string("CHROMA_URL"),
  PORT: getenv.int("CHROMA_PORT"),
};
