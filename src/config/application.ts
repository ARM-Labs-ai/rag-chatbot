import getenv from "getenv";

export const config = {
  PORT: getenv.int('RAG_HTTP_PORT'),
};
