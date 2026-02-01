import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../dynamo/docClient.js';

// Words to ignore during tokenization
const STOP_WORDS = new Set([
    'LTD',
    'LIMITED',
    'UK',
    'COMPANY',
    'SERVICES',
    'THE',
    'AND',
    'A',
    'T/A',
]);

// Normalize text for keywords
const normalize = (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '_');

// Split organization name into keywords, filter stop words
const tokenize = (name) => {
    return name
        .toUpperCase()
        .split(/\s+/)
        .map((word) => word.replace(/[^A-Z0-9]/g, ''))
        .filter((word) => word && !STOP_WORDS.has(word));
};

// Create one DynamoDB item per keyword
export const createEmployer = async (employerData) => {
    if (!process.env.AWS_DYNAMO_TABLE_NAME) {
        throw new Error('AWS_DYNAMO_TABLE_NAME env variable not set');
    }

    if (!employerData?.id || !employerData?.organizationName) {
        throw new Error('Invalid employer data');
    }

    const keywords = tokenize(employerData.organizationName);

    // For each keyword, insert a separate item
    const insertPromises = keywords.map((keyword) => {
        const command = new PutCommand({
            TableName: process.env.AWS_DYNAMO_TABLE_NAME,
            Item: {
                pk: `KEYWORD#${keyword}`, // keyword partition
                sk: `ORG#${employerData.id}`, // organization sort key
                organizationName: employerData.organizationName,
                city: employerData.city,
                county: employerData.county,
                routes: employerData.routes || [], // optional, array of routes
                ratingType: employerData.ratingType,
                ratingLevel: employerData.ratingLevel,
                entityType: 'ORGANIZATION',
                createdAt: new Date().toISOString(),
            },
            ConditionExpression:
                'attribute_not_exists(pk) AND attribute_not_exists(sk)',
        });

        return docClient.send(command);
    });

    await Promise.all(insertPromises);
    console.log(
        'Employer created successfully with keywords:',
        keywords.join(', '),
    );
};

// Example usage
createEmployer({
    id: '12345',
    organizationName: 'k line energy shipping (uk) limited',
    city: 'London',
    county: 'Greater London',
    ratingType: 'Worker (A rating)',
    ratingLevel: 5,
    routes: [
        'Skilled Worker',
        'Global Business Mobility: Senior or Specialist Worker',
    ],
});
