export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

export interface CorsConfig {
  origin: string | string[];
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

export interface SecurityConfig {
  rateLimit: RateLimitConfig;
  cors: CorsConfig;
  helmet: Record<string, unknown>;
}
