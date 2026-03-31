export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone?: string;
  role: string;
  is_active?: boolean;
  tenant_id?: string;
  tenant_name?: string;
  tenant_slug?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  organization_id?: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
    tenant_id: string;
    tenant_name: string;
    tenant_slug: string;
  };
  available_tenants?: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
}
