const fetch = require('node-fetch');

async function run() {
    console.log("--- RUNNING MIGRATION ---");
    try {
        const resMigrate = await fetch('http://localhost:3000/api/admin/migrate-products', { method: 'POST' });
        const dataMigrate = await resMigrate.json();
        console.log(JSON.stringify(dataMigrate, null, 2));
    } catch (e) {
        console.error("Migration failed (is dev server running?):", e.message);
    }

    console.log("\n--- RUNNING SEEDING ---");
    try {
        const resSeed = await fetch('http://localhost:3000/api/admin/seed-products', { method: 'POST' });
        const dataSeed = await resSeed.json();
        console.log(JSON.stringify(dataSeed, null, 2));
    } catch (e) {
        console.error("Seeding failed (is dev server running?):", e.message);
    }
}

run();
