import { describe, it, expect } from 'vitest';
import type { Company } from '../../entities/company/company.entity';
import type { Client } from '../../entities/client/client.entity';
import type { User } from '../../entities/company/user.entity';

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

  it('accepts raw strings in encrypted businessName, contact, phone', () => {
    const company = {
      id: 'comp-uuid-3',
      friendlyUrl: 'acme-legal',
      name: 'Acme Legal',
      businessName: 'Acme Servicios Legales S.A.',
      contact: 'no-reply@acme-legal.com',
      phone: '+541112345678',
      active: true,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    } satisfies Company;

    expect(company.businessName).toBe('Acme Servicios Legales S.A.');
    expect(company.contact).toBe('no-reply@acme-legal.com');
    expect(company.phone).toBe('+541112345678');
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

  it('accepts raw strings in encrypted fullName, email, phone, taxId', () => {
    const client = {
      id: 'client-uuid-3',
      companyId: 'comp-uuid',
      clientCode: 'CLI-00044',
      fullName: 'Maria Lopez',
      email: 'maria@example.com',
      phone: '+541187654321',
      taxId: '27-12345678-3',
      active: true,
      createdAt: new Date(),
      createdBy: 'user-uuid',
      updatedAt: new Date(),
    } satisfies Client;

    expect(client.fullName).toBe('Maria Lopez');
    expect(client.email).toBe('maria@example.com');
    expect(client.taxId).toBe('27-12345678-3');
  });
});

describe('User entity', () => {
  it('accepts raw strings in encrypted fullName, phone', () => {
    const user = {
      id: 'user-uuid-raw',
      email: 'user@example.com',
      fullName: 'Pedro Ruiz',
      phone: '+541112223344',
      active: true,
      emailVerified: true,
      createdAt: new Date(),
      createdBy: 'admin-uuid',
      updatedAt: new Date(),
    } satisfies User;

    expect(user.fullName).toBe('Pedro Ruiz');
    expect(user.phone).toBe('+541112223344');
  });
});
