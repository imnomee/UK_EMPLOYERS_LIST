// Node.js modules for file streaming, CSV parsing, and CSV writing
import fs from 'fs'; // File system module to read/write files
import csv from 'csv-parser'; // Parses CSV streams row by row
import { createObjectCsvWriter } from 'csv-writer'; // Writes CSV files safely

// Input CSV file path (raw worker data)
const inputFilePath = './2025-12-22_-_Worker_and_Temporary_Worker.csv';

// Output CSV file path (cleaned & merged data)
const outputFilePath = './2026-02--01_-_Worker_Cleaned.csv';

// In-memory storage for aggregated organizations
// Key   -> normalized organization name (lowercase, trimmed)
// Value -> merged data object containing routes array, city, county, rating, etc.
const organizations = {};

// Optional limiter for testing small samples
// let count = 0; // Uncomment to limit rows for testing

// Start timer to measure CSV read + aggregation duration
console.time('CSV Processing Time');

// Read CSV as a stream (memory-efficient, handles large files)
fs.createReadStream(inputFilePath)
    // Parse CSV row-by-row
    .pipe(csv())
    .on('data', (row) => {
        // ---- DEV MODE LIMIT (optional for testing) ----
        // if (count >= 50) {
        //   this.destroy(); // stops reading the file
        //   return;
        // }
        // count++;

        // Normalize organization name:
        // - Trim whitespace
        // - Convert to lowercase for consistent deduplication
        const orgName = row['Organisation Name']?.trim().toLowerCase();

        // Skip rows with empty or invalid organization names
        if (!orgName) return;

        /**
         * If organization is not seen yet:
         * - initialize its aggregated structure
         * - include town/city, county, type & rating, and an empty routes array
         */
        if (!organizations[orgName]) {
            organizations[orgName] = {
                organisationName: orgName, // normalized key
                town: row['Town/City']?.trim() || '', // default empty string if missing
                county: row['County']?.trim() || '',
                typeAndRating: row['Type & Rating']?.trim() || '',
                routes: [], // collect multiple routes here
            };
        }

        // Extract route from current row and append it to the organization's routes array
        const route = row['Route']?.trim();
        if (route) {
            organizations[orgName].routes.push(route);
        }
    })
    .on('end', async () => {
        // Finished reading & aggregating CSV data
        console.timeEnd('CSV Processing Time');

        // Start timer for writing cleaned CSV
        console.time('CSV Writing Time');

        /**
         * Transform aggregated organization object into flat array of records
         * suitable for CSV writing.
         * - Deduplicate routes using Set
         * - Join multiple routes with " | " as a separator
         */
        const records = Object.values(organizations).map((org) => ({
            organisationName: org.organisationName, // normalized name
            town: org.town,
            county: org.county,
            typeAndRating: org.typeAndRating,
            route: [...new Set(org.routes)].join(' | '), // deduplicated routes
        }));

        /**
         * CSV writer setup:
         * - path: output file path
         * - header: maps object keys to CSV column titles
         * Handles quoting, escaping, and formatting automatically
         */
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

        // Write all aggregated records to the cleaned CSV
        await csvWriter.writeRecords(records);

        console.timeEnd('CSV Writing Time');
        console.log(`✅ Cleaned CSV written to ${outputFilePath}`);
    });
