import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { client } from './client.js';

/**
 * High-level Document Client
 * - Used for CRUD operations
 * - Automatically marshalls JS objects
 */
export const docClient = DynamoDBDocumentClient.from(client);
