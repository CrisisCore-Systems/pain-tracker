import type { IncomingMessage, ServerResponse } from 'node:http';

export type VercelRequest = IncomingMessage & {
  query: Record<string, string | string[] | undefined>;
  body: unknown;
  cookies: Record<string, string>;
};

export type VercelResponse = ServerResponse & {
  status: (statusCode: number) => VercelResponse;
  json: (body: unknown) => void;
  send: (body: unknown) => void;
  redirect: (statusOrUrl: number | string, url?: string) => void;
};
