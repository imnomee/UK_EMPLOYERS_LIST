import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../dynamo/docClient.js';

const normalize = (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '_');

export const createEmployer = async (employerData) => {
    if (!process.env.AWS_DYNAMO_TABLE_NAME) {
        throw new Error('AWS_DYNAMO_TABLE_NAME env variable not set');
    }

    if (!employerData?.id || !employerData?.route) {
        throw new Error('Invalid employer data');
    }

    const command = new PutCommand({
        TableName: process.env.AWS_DYNAMO_TABLE_NAME,
        Item: {
            pk: `ORG#${employerData.id}`,
            sk: `ROUTE#${normalize(employerData.route)}`,
            organizationName: employerData.organizationName,
            city: employerData.city,
            county: employerData.county,
            ratingType: employerData.ratingType,
            ratingLevel: employerData.ratingLevel,
            entityType: 'ORGANIZATION',
            createdAt: new Date().toISOString(),
        },
        ConditionExpression:
            'attribute_not_exists(pk) AND attribute_not_exists(sk)',
    });

    await docClient.send(command);
    console.log('Employer created successfully');
};

createEmployer({
    id: '12345',
    route: 'default',
    organizationName: 'Test Organization',
    city: 'London',
    county: 'Greater London',
    ratingType: 'Type A',
    ratingLevel: 5,
});
