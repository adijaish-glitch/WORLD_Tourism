const { initDb, getDb, saveDb } = require('../db/connection');
const { migrate } = require('../db/migrate');

// Fallback seed data in case of complete network outage
const FALLBACK_COUNTRIES = [
  { name: { common: 'France', official: 'French Republic' }, cca2: 'FR', cca3: 'FRA', capital: ['Paris'], region: 'Europe', subregion: 'Western Europe', population: 67391582, currencies: { EUR: { name: 'Euro', symbol: '€' } }, languages: { fra: 'French' }, latlng: [46.2276, 2.2137], flag: '🇫🇷' },
  { name: { common: 'Japan', official: 'Japan' }, cca2: 'JP', cca3: 'JPN', capital: ['Tokyo'], region: 'Asia', subregion: 'Eastern Asia', population: 125836021, currencies: { JPY: { name: 'Japanese yen', symbol: '¥' } }, languages: { jpn: 'Japanese' }, latlng: [36.2048, 138.2529], flag: '🇯🇵' },
  { name: { common: 'United States', official: 'United States of America' }, cca2: 'US', cca3: 'USA', capital: ['Washington, D.C.'], region: 'Americas', subregion: 'Northern America', population: 331449281, currencies: { USD: { name: 'United States dollar', symbol: '$' } }, languages: { eng: 'English' }, latlng: [38.0, -97.0], flag: '🇺🇸' },
  { name: { common: 'Italy', official: 'Italian Republic' }, cca2: 'IT', cca3: 'ITA', capital: ['Rome'], region: 'Europe', subregion: 'Southern Europe', population: 59554023, currencies: { EUR: { name: 'Euro', symbol: '€' } }, languages: { ita: 'Italian' }, latlng: [41.8719, 12.5674], flag: '🇮🇹' },
  { name: { common: 'Australia', official: 'Commonwealth of Australia' }, cca2: 'AU', cca3: 'AUS', capital: ['Canberra'], region: 'Oceania', subregion: 'Australia and New Zealand', population: 25687041, currencies: { AUD: { name: 'Australian dollar', symbol: '$' } }, languages: { eng: 'English' }, latlng: [-25.2744, 133.7751], flag: '🇦🇺' },
  { name: { common: 'India', official: 'Republic of India' }, cca2: 'IN', cca3: 'IND', capital: ['New Delhi'], region: 'Asia', subregion: 'Southern Asia', population: 1380004385, currencies: { INR: { name: 'Indian rupee', symbol: '₹' } }, languages: { hin: 'Hindi', eng: 'English' }, latlng: [20.5937, 78.9629], flag: '🇮🇳' },
  { name: { common: 'United Arab Emirates', official: 'United Arab Emirates' }, cca2: 'AE', cca3: 'ARE', capital: ['Abu Dhabi'], region: 'Asia', subregion: 'Western Asia', population: 9890400, currencies: { AED: { name: 'United Arab Emirates dirham', symbol: 'د.إ' } }, languages: { ara: 'Arabic' }, latlng: [23.4241, 53.8478], flag: '🇦🇪' },
  { name: { common: 'South Africa', official: 'Republic of South Africa' }, cca2: 'ZA', cca3: 'ZAF', capital: ['Pretoria'], region: 'Africa', subregion: 'Southern Africa', population: 59308690, currencies: { ZAR: { name: 'South African rand', symbol: 'R' } }, languages: { eng: 'English', afr: 'Afrikaans', zul: 'Zulu' }, latlng: [-30.5595, 22.9375], flag: '🇿🇦' },
  { name: { common: 'Brazil', official: 'Federative Republic of Brazil' }, cca2: 'BR', cca3: 'BRA', capital: ['Brasília'], region: 'Americas', subregion: 'South America', population: 212559417, currencies: { BRL: { name: 'Brazilian real', symbol: 'R$' } }, languages: { por: 'Portuguese' }, latlng: [-14.235, -51.9253], flag: '🇧🇷' },
  { name: { common: 'United Kingdom', official: 'United Kingdom of Great Britain and Northern Ireland' }, cca2: 'GB', cca3: 'GBR', capital: ['London'], region: 'Europe', subregion: 'Northern Europe', population: 67215930, currencies: { GBP: { name: 'British pound', symbol: '£' } }, languages: { eng: 'English' }, latlng: [55.3781, -3.436], flag: '🇬🇧' }
];

function getBestSeason(region, lat) {
  if (lat > 30) return 'May - September (Late Spring & Summer)';
  if (lat < -30) return 'November - March (Southern Summer)';
  if (region === 'Africa' || region === 'Oceania') return 'Dry Season (June - October)';
  return 'Year-round / Peak during Spring & Autumn';
}

async function seedCountries() {
  await initDb();
  migrate();
  const db = getDb();

  // Check count
  const stmt = db.prepare('SELECT COUNT(*) as count FROM countries');
  stmt.step();
  const currentCount = stmt.getAsObject().count;
  stmt.free();

  if (currentCount >= 200) {
    console.log(`✓ Countries table already seeded with ${currentCount} countries.`);
    return;
  }

  console.log('Fetching world countries dataset...');
  let rawList = [];

  try {
    const urls = [
      'https://raw.githubusercontent.com/mledoze/countries/master/countries.json',
      'https://cdn.jsdelivr.net/gh/mledoze/countries@master/countries.json'
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url, { headers: { 'User-Agent': 'TIMS-World-Tourism/1.0' } });
        if (response.ok) {
          rawList = await response.json();
          break;
        }
      } catch (err) {
        console.warn(`Failed fetching from ${url}:`, err.message);
      }
    }
  } catch (err) {
    console.warn('Network error while fetching remote countries, using fallback:', err.message);
  }

  if (!rawList || rawList.length === 0) {
    console.log('Using built-in fallback country data...');
    rawList = FALLBACK_COUNTRIES;
  }

  console.log(`Processing ${rawList.length} countries for database insertion...`);

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO countries (
      code, code3, name, official_name, capital, region, subregion,
      population, area, currencies, languages, flag_emoji, flag_url, flag_svg,
      latitude, longitude, borders, summary, cover_image, best_season
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let count = 0;
  for (const c of rawList) {
    const code = c.cca2 || c.code;
    if (!code) continue;

    const code3 = c.cca3 || c.code3 || '';
    const name = c.name?.common || c.name || code;
    const officialName = c.name?.official || name;
    const capital = Array.isArray(c.capital) ? c.capital.join(', ') : (c.capital || 'N/A');
    const region = c.region || 'World';
    const subregion = c.subregion || region;
    const population = c.population || 0;
    const area = c.area || 0;

    // Format currencies
    let currencies = '';
    if (c.currencies) {
      if (typeof c.currencies === 'object') {
        currencies = Object.entries(c.currencies)
          .map(([k, v]) => `${v.name || k} (${v.symbol || k})`)
          .join(', ');
      } else {
        currencies = String(c.currencies);
      }
    }

    // Format languages
    let languages = '';
    if (c.languages) {
      if (typeof c.languages === 'object') {
        languages = Object.values(c.languages).join(', ');
      } else {
        languages = String(c.languages);
      }
    }

    const flagEmoji = c.flag || '🏳️';
    const codeLower = code.toLowerCase();
    const flagUrl = `https://flagcdn.com/w320/${codeLower}.png`;
    const flagSvg = `https://flagcdn.com/${codeLower}.svg`;

    const lat = Array.isArray(c.latlng) ? c.latlng[0] : 0;
    const lng = Array.isArray(c.latlng) ? c.latlng[1] : 0;
    const borders = Array.isArray(c.borders) ? c.borders.join(', ') : '';

    const bestSeason = getBestSeason(region, lat);
    const summary = `${name} (${officialName}) is located in ${subregion || region}. Its capital is ${capital}, with an estimated population of ${population.toLocaleString()}. Official languages include ${languages || 'various local languages'}.`;
    const coverImage = `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80`;

    insertStmt.run([
      code,
      code3,
      name,
      officialName,
      capital,
      region,
      subregion,
      population,
      area,
      currencies,
      languages,
      flagEmoji,
      flagUrl,
      flagSvg,
      lat,
      lng,
      borders,
      summary,
      coverImage,
      bestSeason
    ]);

    count++;
  }

  insertStmt.free();
  saveDb();
  console.log(`✓ Successfully seeded ${count} countries into the database!`);
}

module.exports = { seedCountries };

if (require.main === module) {
  seedCountries()
    .then(() => {
      process.exitCode = 0;
    })
    .catch(err => {
      console.error(err);
      process.exitCode = 1;
    });
}
