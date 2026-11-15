import { AqarWorkspaceDO, WorkerEnv } from './workspaceDo';

export { AqarWorkspaceDO };

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    // Route API calls and WebSocket sync connections into the singleton workspace Durable Object
    if (url.pathname.startsWith('/api/') || url.pathname === '/ws') {
      const id = env.WORKSPACE_DO.idFromName('aqarplus-main-workspace');
      const stub = env.WORKSPACE_DO.get(id);
      return stub.fetch(request);
    }

    // Serve static PWA/SPA assets (Vite build output in ./dist)
    return env.ASSETS.fetch(request);
  },
};
