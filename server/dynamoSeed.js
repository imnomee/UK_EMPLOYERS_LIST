import fs from 'fs';
import csv from 'csv-parser';
import pLimit from 'p-limit';
import { batchWrite } from './dynamoBatchWrite.js';

const TABLE_NAME = process.env.AWS_DYNAMO_TABLE_NAME;
const limit = pLimit(5); // 5 batches at a time
let buffer = [];
let tasks = [];

const normalize = (value) =>
    value
        .toString()
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_');

let count = 0;
const MAX_RECORDS = 50;

fs.createReadStream('./2025-12-22_-_Worker_and_Temporary_Worker.csv')
    .pipe(csv())
    .on('data', (row) => {
        if (count >= MAX_RECORDS) return;
        count++;

        buffer.push({
            pk: `ORG#${normalize(row['Organisation Name'])}`,
            sk: `ROUTE#${normalize(row['Route'])}#${normalize(row['Type & Rating'])}#${Date.now()}`,
            organizationName: row['Organisation Name'],
            city: row['Town/City'] || 'UNKNOWN',
            county: row['County'] || 'UNKNOWN',
            rating: row['Type & Rating'],
            route: row['Route'],
            entityType: 'ORGANIZATION',
            createdAt: new Date().toISOString(),
        });

        if (buffer.length === 25) {
            const batch = buffer;
            buffer = [];
            tasks.push(limit(() => batchWrite(batch, TABLE_NAME)));
        }
    })
    .on('end', async () => {
        if (buffer.length) {
            tasks.push(limit(() => batchWrite(buffer, TABLE_NAME)));
        }

        await Promise.all(tasks);
        console.log('✅ CSV import completed');
    });
