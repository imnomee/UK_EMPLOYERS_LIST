import 'dotenv/config';
import {
    CreateTableCommand,
    waitUntilTableExists,
} from '@aws-sdk/client-dynamodb';
import { client } from '../dynamo/client.js';

const TABLE_NAME = process.env.AWS_DYNAMO_TABLE_NAME;

/**
 * One-time table creation script
 * Run manually:
 *   node scripts/create-table.js
 */
const command = new CreateTableCommand({
    TableName: TABLE_NAME,
    AttributeDefinitions: [
        { AttributeName: 'pk', AttributeType: 'S' },
        { AttributeName: 'sk', AttributeType: 'S' },
    ],
    KeySchema: [
        { AttributeName: 'pk', KeyType: 'HASH' },
        { AttributeName: 'sk', KeyType: 'RANGE' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
});

try {
    await client.send(command);
    await waitUntilTableExists({ client }, { TableName: TABLE_NAME });
    console.log(`✅ Table "${TABLE_NAME}" created successfully`);
} catch (err) {
    if (err.name === 'ResourceInUseException') {
        console.log(`⚠️ Table "${TABLE_NAME}" already exists`);
    } else {
        throw err;
    }
}
