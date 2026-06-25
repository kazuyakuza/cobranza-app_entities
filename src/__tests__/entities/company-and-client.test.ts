import { describe, it, expect } from 'vitest';
import type { Company } from '../../entities/company/company.entity';
import type { Client } from '../../entities/client/client.entity';

describe('Company entity', () => {
  it('accepts a valid company object with required fields', () => {
    const company = {
      id: 'comp-uuid',
      friendlyUrl: 'acme-servicios',
      name: 'Acme Servicios',
      contact: { encryptedData: 'encrypted-contact', keyName: 'test-key' },
      active: true,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    } satisfies Company;

    expect(company.friendlyUrl).toBe('acme-servicios');
    expect(company.active).toBe(true);
  });

  it('allows omitting optional contact field', () => {
    const company: Company = {
      id: 'comp-uuid-2',
      friendlyUrl: 'no-contact-co',
      name: 'No Contact Co',
      active: true,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    };

    expect(company.contact).toBeUndefined();
  });
});

describe('Client entity', () => {
  it('accepts a valid client object with required fields', () => {
    const client = {
      id: 'client-uuid',
      companyId: 'comp-uuid',
      clientCode: 'CLI-00042',
      fullName: { encryptedData: 'encrypted-fullName', keyName: 'test-key' },
      active: true,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    } satisfies Client;

    expect(client.clientCode).toBe('CLI-00042');
    expect(client.fullName.encryptedData).toBe('encrypted-fullName');
  });

  it('allows omitting optional fullName field', () => {
    const client: Client = {
      id: 'client-uuid-2',
      companyId: 'comp-uuid',
      clientCode: 'CLI-00043',
      active: true,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    };

    expect(client.fullName).toBeUndefined();
  });
});
