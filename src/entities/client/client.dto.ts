import type { Client } from './client.entity';

/**
 * Fields required to create a Client.
 */
export type CreateClientDto = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>;

/**
 * Fields allowed when updating a Client.
 */
export type UpdateClientDto = Partial<CreateClientDto>;

/**
 * Full Client shape returned by the API.
 */
export interface ClientResponse extends Client {}