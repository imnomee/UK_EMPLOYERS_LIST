import fs from 'fs';
import csv from 'csv-parser';
import pLimit from 'p-limit';
import { batchWrite } from './dynamoBatchWrite.js';
import { v4 as uuidv4 } from 'uuid';

// DynamoDB table name
const TABLE_NAME = process.env.AWS_DYNAMO_TABLE_NAME;
if (!TABLE_NAME) throw new Error('AWS_DYNAMO_TABLE_NAME not set');

// Concurrency limit for batch writes
const limit = pLimit(5);

// Maximum items per DynamoDB batch
const BATCH_SIZE = 25;

// Stop words for keyword indexing
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

// Normalize a string to uppercase + alphanumeric only
const normalize = (value) =>
    value
        .toString()
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_');

// Tokenize organization name into meaningful keywords
const tokenize = (name) =>
    name
        .toUpperCase()
        .split(/\s+/)
        .map((word) => word.replace(/[^A-Z0-9]/g, ''))
        .filter((word) => word && !STOP_WORDS.has(word));

// Buffer to hold items before sending
let buffer = [];
let tasks = [];
let rowCount = 0;

console.time('CSV Seed Time');

// Flush buffer in safe chunks of ≤25
const flushBuffer = async () => {
    while (buffer.length > 0) {
        const chunk = buffer.splice(0, BATCH_SIZE);
        tasks.push(
            limit(async () => {
                try {
                    await batchWrite(chunk, TABLE_NAME);
                } catch (err) {
                    console.error('❌ Failed batch!');
                    console.error('Batch items:', chunk);
                    console.error(err);
                    throw err;
                }
            }),
        );
    }
};

// Create stream and parse CSV
const stream = fs
    .createReadStream('./2026-02--01_-_Worker_Cleaned.csv')
    .pipe(csv());

// Process each row
stream.on('data', async (row) => {
    rowCount++;
    if (rowCount % 1000 === 0) console.log(`Processed ${rowCount} rows...`);

    const orgId = uuidv4();
    const orgName = row['Organisation Name'];
    if (!orgName) return;

    const keywords = [...new Set(tokenize(orgName))]; // unique keywords

    // Add keyword index items
    keywords.forEach((keyword) => {
        buffer.push({
            pk: `KEYWORD#${keyword}`,
            sk: `ORG#${orgId}`,
            organizationName: orgName,
            city: row['Town/City'] || 'UNKNOWN',
            county: row['County'] || 'UNKNOWN',
            rating: row['Type & Rating'],
            routes: row['Route']
                .split('|')
                .map((r) => r.trim())
                .filter(Boolean),
            entityType: 'ORGANIZATION',
            createdAt: new Date().toISOString(),
        });
    });

    // Add canonical META record
    buffer.push({
        pk: `ORG#${orgId}`,
        sk: 'META',
        organizationName: orgName,
        city: row['Town/City'] || 'UNKNOWN',
        county: row['County'] || 'UNKNOWN',
        rating: row['Type & Rating'],
        routes: row['Route']
            .split('|')
            .map((r) => r.trim())
            .filter(Boolean),
        entityType: 'ORGANIZATION',
        createdAt: new Date().toISOString(),
    });

    // Flush buffer if needed
    if (buffer.length >= BATCH_SIZE) {
        stream.pause(); // pause stream while writing
        await flushBuffer();
        stream.resume();
    }
});

// On end of CSV
stream.on('end', async () => {
    if (buffer.length > 0) await flushBuffer();
    await Promise.all(tasks);
    console.timeEnd('CSV Seed Time');
    console.log(`✅ CSV import completed! Total rows: ${rowCount}`);
});

// On stream close (e.g., early destroy)
stream.on('close', async () => {
    if (buffer.length > 0) await flushBuffer();
    await Promise.all(tasks);
    console.timeEnd('CSV Seed Time');
    console.log('✅ CSV import completed (stream closed)');
});
