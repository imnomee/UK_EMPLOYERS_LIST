import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

const inputFilePath = './2025-12-22_-_Worker_and_Temporary_Worker.csv';
const outputFilePath = './2026-02--01_-_Worker_Cleaned.csv';

const organizations = {};

// let count = 0;
console.time('CSV Processing Time');

fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on('data', (row) => {
        // if (count >= 50) {
        //     this.destroy();
        //     return;
        // }
        const orgName = row['Organisation Name']?.trim().toLowerCase();
        if (!orgName) return;

        if (!organizations[orgName]) {
            organizations[orgName] = {
                organisationName: orgName,
                town: row['Town/City']?.trim() || '',
                county: row['County']?.trim() || '',
                typeAndRating: row['Type & Rating']?.trim() || '',
                routes: [],
            };
        }

        const route = row['Route']?.trim();
        if (route) {
            organizations[orgName].routes.push(route);
        }
    })
    .on('end', async () => {
        console.timeEnd('CSV Processing Time');

        console.time('CSV Writing Time');

        const records = Object.values(organizations).map((org) => ({
            organisationName: org.organisationName,
            town: org.town,
            county: org.county,
            typeAndRating: org.typeAndRating,
            route: [...new Set(org.routes)].join(' | '),
        }));

        const csvWriter = createObjectCsvWriter({
            path: outputFilePath,
            header: [
                { id: 'organisationName', title: 'Organisation Name' },
                { id: 'town', title: 'Town/City' },
                { id: 'county', title: 'County' },
                { id: 'typeAndRating', title: 'Type & Rating' },
                { id: 'route', title: 'Route' },
            ],
        });

        await csvWriter.writeRecords(records);

        console.timeEnd('CSV Writing Time');
        console.log(`✅ Cleaned CSV written to ${outputFilePath}`);
    });
