import type { Client } from './client.entity';

/**
 * Fields required to create a Client.
 *
 * Note: This DTO represents the canonical entity shape after encryption.
 * Consuming microservices should define their own API-level input DTOs
 * that accept plain strings for fields that will be encrypted at the
 * service layer.
 */
export type CreateClientDto = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>;

/**
 * Fields allowed when updating a Client.
 * All fields inherit the encryption conventions from CreateClientDto.
 */
export type UpdateClientDto = Partial<CreateClientDto>;

/**
 * Full Client shape returned by the API.
 * Microservices may extend or remap this for decrypted responses.
 */
export type ClientResponse = Client;
