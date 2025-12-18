import type { IncomingMessage, ServerResponse } from 'node:http';

export type VercelRequest = IncomingMessage & {
  query: any;
  body: any;
  cookies: any;
};

export type VercelResponse = ServerResponse & {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => void;
  send: (body: unknown) => void;
  redirect: (statusOrUrl: number | string, url?: string) => void;
};
