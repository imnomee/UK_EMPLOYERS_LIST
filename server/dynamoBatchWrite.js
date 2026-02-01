import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from './dynamo/docClient.js';

const BATCH_SIZE = 25;

export const batchWrite = async (items, tableName) => {
    let requestItems = {
        [tableName]: items.map((Item) => ({
            PutRequest: { Item },
        })),
    };

    while (Object.keys(requestItems).length > 0) {
        const response = await docClient.send(
            new BatchWriteCommand({ RequestItems: requestItems }),
        );

        requestItems = response.UnprocessedItems || {};
    }
};
