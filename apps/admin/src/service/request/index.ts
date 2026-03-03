import { getServiceEnvConfig } from '~/.env-config';
import { createRequest } from './request';

const { url, proxyPattern } = getServiceEnvConfig(import.meta.env);

const isHttpProxy = import.meta.env.VITE_HTTP_PROXY === 'Y';

// 增加超时时间到 10 分钟（600000 毫秒），支持大文件上传
export const request = createRequest({ 
  baseURL: isHttpProxy ? proxyPattern : url,
  timeout: 600000  // 10 分钟超时
});

export const mockRequest = createRequest({ baseURL: '/mock' });
