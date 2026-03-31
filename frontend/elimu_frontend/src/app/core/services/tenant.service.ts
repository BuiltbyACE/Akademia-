import { Injectable, signal } from '@angular/core';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  logo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  public currentTenant = signal<Tenant | null>(this.getTenantFromStorage());

  setTenant(tenant: Tenant): void {
    localStorage.setItem('current_tenant', JSON.stringify(tenant));
    this.currentTenant.set(tenant);
  }

  getTenant(): Tenant | null {
    return this.currentTenant();
  }

  getTenantId(): string | null {
    return this.currentTenant()?.id || null;
  }

  clearTenant(): void {
    localStorage.removeItem('current_tenant');
    this.currentTenant.set(null);
  }

  private getTenantFromStorage(): Tenant | null {
    const tenantStr = localStorage.getItem('current_tenant');
    return tenantStr ? JSON.parse(tenantStr) : null;
  }
}
