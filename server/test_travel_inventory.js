const assert = require('assert');

async function testTravelInventory() {
  console.log('🧪 Starting Multi-Modal Travel Inventory & Security Validation...\n');

  const { initDb } = require('./src/db/connection');
  const { migrate } = require('./src/db/migrate');
  const { seedTravelProviders } = require('./src/seeds/seedTravelProviders');

  const FlightAdapter = require('./src/services/travel/FlightAdapter');
  const HotelAdapter = require('./src/services/travel/HotelAdapter');
  const TrainAdapter = require('./src/services/travel/TrainAdapter');
  const BusAdapter = require('./src/services/travel/BusAdapter');
  const PackageAdapter = require('./src/services/travel/PackageAdapter');
  const ExternalRedirectService = require('./src/services/travel/ExternalRedirectService');
  const AuditService = require('./src/services/auditService');

  // 1. Initialize DB and Seed
  await initDb();
  migrate();
  await seedTravelProviders();
  console.log('✅ SQLite Database migrated and Travel Providers seeded.');

  // 2. Test Flight Adapter
  console.log('1. Testing Flight Adapter Search & Schema...');
  const flightAdapter = new FlightAdapter();
  const flights = await flightAdapter.search({ origin: 'New York', destination: 'Paris' });
  assert(Array.isArray(flights), 'Flights result must be an array');
  assert(flights.length > 0, 'Should find or generate flights');
  assert(flights[0].providerCode, 'Must have providerCode');
  assert(flights[0].freshnessTimestamp, 'Must have freshnessTimestamp');
  assert.strictEqual(flights[0].category, 'flights');
  console.log(`   ✅ Flights search verified (${flights.length} offers found). Provider: ${flights[0].providerName}`);

  // 3. Test Hotel Adapter (Hybrid Direct + External)
  console.log('2. Testing Hybrid Hotel Adapter (Direct & External)...');
  const hotelAdapter = new HotelAdapter();
  const hotels = await hotelAdapter.search({});
  assert(Array.isArray(hotels), 'Hotels must be an array');
  const directHotels = hotels.filter(h => h.bookingType === 'direct');
  const extHotels = hotels.filter(h => h.bookingType === 'external_redirect');
  assert(directHotels.length > 0, 'Must have TIMS direct booking hotels');
  console.log(`   ✅ Hotels search verified: ${directHotels.length} direct TIMS hotels, ${extHotels.length} external partner hotels.`);

  // 4. Test Train Adapter & Regulatory Safeguards
  console.log('3. Testing Train Adapter & Regulatory Safeguards...');
  const trainAdapter = new TrainAdapter();
  const trains = await trainAdapter.search({ origin: 'New Delhi', destination: 'Varanasi' });
  assert(trains.length > 0, 'Should find train routes');
  assert(trains[0].regulatoryNotice, 'Train offer must include regulatory notice');
  assert.strictEqual(trains[0].bookingType, 'external_redirect', 'Train booking must redirect to official authority');
  console.log(`   ✅ Train route & IRCTC safety verified: ${trains[0].title}`);

  // 5. Test Bus Adapter & Intercity Coaches
  console.log('4. Testing Bus Adapter & Aggregator Routing...');
  const busAdapter = new BusAdapter();
  const buses = await busAdapter.search({ origin: 'Bengaluru', destination: 'Goa' });
  assert(buses.length > 0, 'Should find bus routes');
  assert.strictEqual(buses[0].bookingType, 'external_redirect');
  console.log(`   ✅ Bus search verified: ${buses[0].title}`);

  // 6. Test Package Adapter (Direct Curated + MakeMyTrip)
  console.log('5. Testing Package Adapter...');
  const packageAdapter = new PackageAdapter();
  const packages = await packageAdapter.search({});
  assert(packages.length > 0, 'Should find packages');
  const directPackages = packages.filter(p => p.bookingType === 'direct');
  assert(directPackages.length > 0, 'Must have direct curated packages');
  console.log(`   ✅ Packages search verified (${packages.length} total packages found).`);

  // 7. Test Price & Availability Revalidation
  console.log('6. Testing Price Revalidation Engine...');
  const revalResult = await flightAdapter.revalidate(flights[0].id, { price: flights[0].price });
  assert.strictEqual(revalResult.valid, true, 'Offer should revalidate successfully');
  assert(revalResult.freshnessTimestamp, 'Must return freshness timestamp');
  console.log('   ✅ Price revalidation verified:', revalResult.message);

  // 8. Test Open-Redirect Defense & Domain Allowlist
  console.log('7. Testing Open-Redirect Security & URL Validation...');
  
  // A. Attack: Malicious external domain
  const evilUrl = 'https://phishing-travel-scam.com/login';
  const evilCheck = ExternalRedirectService.validateUrl(evilUrl);
  assert.strictEqual(evilCheck.safe, false, 'Unapproved domain must be rejected');
  assert(evilCheck.error.includes('not authorized'), 'Should report unauthorized domain');
  console.log('   ✅ Malicious open-redirect correctly blocked.');

  // B. Attack: javascript: protocol XSS injection
  const xssUrl = 'javascript:alert(document.cookie)';
  const xssCheck = ExternalRedirectService.validateUrl(xssUrl);
  assert.strictEqual(xssCheck.safe, false, 'javascript: scheme must be rejected');
  console.log('   ✅ JavaScript scheme injection correctly blocked.');

  // C. Valid: Official MakeMyTrip domain
  const mmtUrl = 'https://www.makemytrip.com/flights';
  const mmtCheck = ExternalRedirectService.validateUrl(mmtUrl);
  assert.strictEqual(mmtCheck.safe, true, 'Approved MakeMyTrip URL must be accepted');

  const redirectObj = ExternalRedirectService.buildSafeRedirect(mmtUrl, {
    category: 'flights',
    affiliateId: 'TIMS_MMT_PARTNER'
  });
  assert(redirectObj.destinationUrl.includes('utm_source=TIMS_Travel_Platform'), 'Must inject UTM attribution');
  assert(redirectObj.destinationUrl.includes('affId=TIMS_MMT_PARTNER'), 'Must inject partner affiliate ID');
  console.log('   ✅ Official MakeMyTrip redirect with safe tracking verified.');

  // 9. Test Audit Logging
  console.log('8. Testing Security Audit Logging...');
  AuditService.log({
    userId: 1,
    action: 'TEST_TRAVEL_EVENT',
    ipAddress: '127.0.0.1',
    details: { test: true }
  });
  const logs = AuditService.getRecentLogs(5);
  assert(logs.length > 0, 'Audit log must record entries');
  assert.strictEqual(logs[0].action, 'TEST_TRAVEL_EVENT');
  console.log('   ✅ Audit logging system operational.');

  console.log('\n🎉 ALL MULTI-MODAL TRAVEL INVENTORY, ADAPTER & SECURITY TESTS PASSED!\n');
}

if (require.main === module) {
  testTravelInventory().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
}

module.exports = { testTravelInventory };

