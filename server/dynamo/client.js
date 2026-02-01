import 'dotenv/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

/**
 * Low-level DynamoDB client
 * - Used by both table scripts and DocumentClient
 * - Safe to import anywhere
 */
export const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
});
