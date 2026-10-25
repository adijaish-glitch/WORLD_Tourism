const { initDb, getDb, saveDb } = require('../db/connection');
const { migrate } = require('../db/migrate');

async function seedGlobalTravel() {
  await initDb();
  migrate();
  const db = getDb();

  console.log('Seeding curated global destinations, hotels, and packages...');

  // 1. Update existing destinations categories
  const categoryUpdates = [
    ['Historical', 1],  // Paris
    ['Plains', 2],      // Tokyo
    ['Plains', 3],      // New York
    ['Beaches', 4],     // Santorini
    ['Beaches', 5],     // Bali
    ['Mountains', 6],   // Machu Picchu
    ['Plains', 7],      // Dubai
    ['Beaches', 8],     // Sydney
    ['Mountains', 9],   // Cape Town
    ['Beaches', 10],    // Maldives
    ['Historical', 11], // Rome
    ['Religious', 12],  // Kyoto
  ];
  categoryUpdates.forEach(([cat, id]) => {
    try {
      db.run('UPDATE destinations SET category = ? WHERE id = ?', [cat, id]);
    } catch {}
  });

  // 2. Global Curated Destinations
  // Format: [name, country, region, description, latitude, longitude, image_url, rating, best_season, category]
  const newDestinations = [
    // 🇮🇳 INDIA
    [
      'Taj Mahal & Agra',
      'India',
      'Asia',
      'Home to the iconic Taj Mahal, an ivory-white marble mausoleum on the Yamuna river, alongside the majestic Agra Fort and Mughal architectural treasures.',
      27.1751, 78.0421,
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800',
      4.9, 'October - March (Cool Season)', 'Historical'
    ],
    [
      'Jaipur & Amber Fort',
      'India',
      'Asia',
      'The vibrant Pink City of Rajasthan. Discover the Hawa Mahal palace of winds, hilltop Amber Fort, royal observatories, and artisan bazaars.',
      26.9124, 75.7873,
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800',
      4.8, 'Winter / Spring', 'Historical'
    ],
    [
      'Goa Coastal Haven',
      'India',
      'Asia',
      'Golden sand beaches, palm groves, Portuguese colonial churches, and sunset beach shacks along the sparkling Arabian Sea.',
      15.2993, 74.1240,
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800',
      4.7, 'November - February', 'Beaches'
    ],
    [
      'Kerala Backwaters',
      'India',
      'Asia',
      "God's Own Country — tranquil houseboat cruises through emerald backwaters, spice plantations in Munnar, and authentic Ayurvedic wellness.",
      9.4981, 76.3388,
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800',
      4.9, 'September - March', 'Forests'
    ],
    [
      'Varanasi Ghats',
      'India',
      'Asia',
      'One of the oldest continuously inhabited cities in human history. Witness spiritual Ganga Aarti ceremonies and ancient riverside temples.',
      25.3176, 82.9739,
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800',
      4.8, 'October - March', 'Religious'
    ],
    [
      'Ladakh & Pangong Tso',
      'India',
      'Asia',
      'The Land of High Passes nestled between the Himalayas and Karakoram. Dramatic stark mountains, Tibetan Buddhist monasteries, and crystal blue alpine lakes.',
      34.1526, 77.5771,
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
      4.9, 'May - September', 'Mountains'
    ],

    // 🇬🇧 UNITED KINGDOM
    [
      'London',
      'United Kingdom',
      'Europe',
      'A global cultural capital steeped in history — Big Ben, Tower of London, Buckingham Palace, West End theatres, and world-class museums.',
      51.5074, -0.1278,
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
      4.8, 'May - September', 'Historical'
    ],
    [
      'Edinburgh & Highlands',
      'United Kingdom',
      'Europe',
      'Scotland\'s majestic capital dominated by Edinburgh Castle atop an extinct volcano, with cobblestone medieval closes and gateway to the Highlands.',
      55.9533, -3.1883,
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800',
      4.8, 'June - August', 'Mountains'
    ],

    // 🇪🇸 SPAIN
    [
      'Barcelona',
      'Spain',
      'Europe',
      'Cosmopolitan Catalan jewel known for Antoni Gaudí\'s surreal architecture (Sagrada Família, Park Güell), lively Las Ramblas, and Mediterranean beaches.',
      41.3879, 2.1699,
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
      4.8, 'Spring & Autumn', 'Historical'
    ],
    [
      'Madrid & Royal Palaces',
      'Spain',
      'Europe',
      'Spain\'s vibrant royal capital, home to the Prado Museum, grand Plaza Mayor, Palacio Real, and legendary tapas culture.',
      40.4168, -3.7038,
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
      4.7, 'Spring & Fall', 'Historical'
    ],

    // 🇩🇪 GERMANY
    [
      'Munich & Bavarian Alps',
      'Germany',
      'Europe',
      'Bavaria\'s fairytale capital — historic Marienplatz, Neuschwanstein Castle nestled in alpine peaks, and world-famous beer gardens.',
      48.1351, 11.5820,
      'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800',
      4.8, 'May - October', 'Mountains'
    ],

    // 🇨🇭 SWITZERLAND
    [
      'Interlaken & Jungfrau',
      'Switzerland',
      'Europe',
      'The adventure capital of the Swiss Alps between Lake Thun and Lake Brienz, surrounded by the towering Eiger, Mönch, and Jungfrau peaks.',
      46.6863, 7.8632,
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800',
      4.9, 'Year-round (Skiing & Hiking)', 'Mountains'
    ],

    // 🇪🇬 EGYPT
    [
      'Cairo & Giza Pyramids',
      'Egypt',
      'Africa',
      'Standing proudly on the Giza plateau for 4,500 years, the Great Pyramids and Sphinx, alongside the Grand Egyptian Museum on the banks of the Nile.',
      30.0444, 31.2357,
      'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800',
      4.9, 'October - April', 'Historical'
    ],

    // 🇹🇭 THAILAND
    [
      'Bangkok & Grand Palace',
      'Thailand',
      'Asia',
      'A thrilling sensory capital of golden Buddhist temples (Wat Arun, Wat Phra Kaew), bustling floating markets, and celebrated street food.',
      13.7563, 100.5018,
      'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800',
      4.7, 'November - February', 'Religious'
    ],
    [
      'Phuket & Phi Phi Islands',
      'Thailand',
      'Asia',
      'Turquoise Andaman waters, towering limestone karsts, lively beach clubs, and serene coral reefs made famous by world explorers.',
      7.8804, 98.3923,
      'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800',
      4.8, 'November - April', 'Beaches'
    ],

    // 🇸🇬 SINGAPORE
    [
      'Singapore Marina Bay',
      'Singapore',
      'Asia',
      'A futuristic garden metropolis boasting the iconic Marina Bay Sands infinity pool, illuminated Supertree Grove, and multicultural culinary quarters.',
      1.3521, 103.8198,
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800',
      4.8, 'Year-round', 'Plains'
    ],

    // 🇨🇳 CHINA
    [
      'Beijing & Great Wall',
      'China',
      'Asia',
      'Walk along the legendary Great Wall winding across rolling mountains, and tour the Forbidden City and Summer Palace in China\'s imperial capital.',
      39.9042, 116.4074,
      'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800',
      4.9, 'Spring & Autumn', 'Historical'
    ],

    // 🇨🇦 CANADA
    [
      'Banff & Lake Louise',
      'Canada',
      'North America',
      'Glacier-fed turquoise lakes surrounded by soaring rugged peaks in the Canadian Rockies. A dreamland for alpine hiking, wildlife, and skiing.',
      51.1784, -115.5708,
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800',
      4.9, 'June - September & Winter', 'Mountains'
    ],

    // 🇧🇷 BRAZIL
    [
      'Rio de Janeiro',
      'Brazil',
      'South America',
      'The Marvellous City framed by Sugarloaf Mountain, Christ the Redeemer statue, Copacabana and Ipanema beaches with pulsating samba rhythms.',
      -22.9068, -43.1729,
      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
      4.8, 'December - March', 'Beaches'
    ],

    // 🇹🇷 TURKEY
    [
      'Istanbul & Cappadocia',
      'Turkey',
      'Europe',
      'Where Europe meets Asia across the Bosphorus, and magical Cappadocia with whimsical fairy chimneys and hundreds of sunrise hot air balloons.',
      41.0082, 28.9784,
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800',
      4.9, 'April - May & September', 'Historical'
    ],

    // 🇳🇴 NORWAY
    [
      'Bergen & The Fjords',
      'Norway',
      'Europe',
      'Gateway to Norway\'s UNESCO-listed fjords, with colorful wooden Bryggen wharf, snow-dusted mountains, and cascading waterfalls.',
      60.3913, 5.3221,
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
      4.8, 'May - September', 'Mountains'
    ],

    // 🇳🇿 NEW ZEALAND
    [
      'Queenstown & Milford Sound',
      'New Zealand',
      'Oceania',
      'The southern hemisphere adventure capital on Lake Wakatipu, and the dramatic fiords of Milford Sound with sheer cliffs rising from dark waters.',
      -45.0312, 168.6626,
      'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800',
      4.9, 'December - March', 'Mountains'
    ],

    // 🇮🇸 ICELAND
    [
      'Reykjavik & Golden Circle',
      'Iceland',
      'Europe',
      'The Land of Fire and Ice — explosive geysers, thundering waterfalls, geothermal Blue Lagoon, and ethereal Northern Lights under Arctic skies.',
      64.1466, -21.9426,
      'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800',
      4.9, 'Summer (Midnight Sun) / Winter (Auroras)', 'Plains'
    ],

    // 🇰🇪 KENYA
    [
      'Masai Mara Safari',
      'Kenya',
      'Africa',
      'The premier safari destination on Earth. Witness the Great Migration, lions, elephants, leopards, and dramatic African savannah sunsets.',
      -1.5034, 35.1437,
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
      4.9, 'July - October', 'Forests'
    ],

    // 🇲🇽 MEXICO
    [
      'Cancún & Chichén Itzá',
      'Mexico',
      'North America',
      'Caribbean white sands and crystal turquoise water meet the ancient Maya pyramid of Kukulkan, cenote freshwater sinkholes, and vibrant culture.',
      21.1619, -86.8515,
      'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800',
      4.8, 'December - April', 'Beaches'
    ],

    // 🇲🇦 MOROCCO
    [
      'Marrakech & Sahara',
      'Morocco',
      'Africa',
      'The red imperial city with snake charmers in Jemaa el-Fnaa, intricate Moorish palaces, and camel treks into golden Sahara desert dunes.',
      31.6295, -7.9811,
      'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800',
      4.7, 'October - April', 'Historical'
    ],

    // 🇻🇳 VIETNAM
    [
      'Ha Long Bay & Hanoi',
      'Vietnam',
      'Asia',
      'Cruise through thousands of towering limestone karsts rising out of emerald Gulf waters, alongside Hanoi\'s bustling French colonial Old Quarter.',
      20.9101, 107.1839,
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
      4.8, 'October - April', 'Beaches'
    ],

    // 🇳🇱 NETHERLANDS
    [
      'Amsterdam Canals',
      'Netherlands',
      'Europe',
      'Historic 17th-century canal ring, world-class Van Gogh & Rijksmuseum art, vibrant tulip fields, and quintessential cycling paths.',
      52.3676, 4.9041,
      'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800',
      4.7, 'April - September', 'Plains'
    ]
  ];

  for (const d of newDestinations) {
    // Check if destination exists
    const stmt = db.prepare('SELECT id FROM destinations WHERE name = ?');
    stmt.bind([d[0]]);
    const exists = stmt.step();
    stmt.free();

    if (!exists) {
      db.run(
        'INSERT INTO destinations (name, country, region, description, latitude, longitude, image_url, rating, best_season, category) VALUES (?,?,?,?,?,?,?,?,?,?)',
        d
      );
      const newDest = db.prepare('SELECT id FROM destinations ORDER BY id DESC LIMIT 1');
      newDest.step();
      const destId = newDest.getAsObject().id;
      newDest.free();

      // Add 2 Hotels for each destination
      db.run(
        'INSERT INTO hotels (name, dest_id, category, price_per_night, rating, total_rooms, amenities, image_url, description) VALUES (?,?,?,?,?,?,?,?,?)',
        [
          `${d[0]} Grand Luxury Resort`,
          destId,
          'luxury',
          350,
          4.9,
          90,
          'Pool,Spa,Restaurant,Concierge,WiFi,Bar,Breakfast',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          `Premier five-star sanctuary in ${d[0]} offering bespoke service and panoramic views.`
        ]
      );
      const h1 = db.prepare('SELECT id FROM hotels ORDER BY id DESC LIMIT 1');
      h1.step();
      const hotelId1 = h1.getAsObject().id;
      h1.free();

      db.run(
        'INSERT INTO hotels (name, dest_id, category, price_per_night, rating, total_rooms, amenities, image_url, description) VALUES (?,?,?,?,?,?,?,?,?)',
        [
          `${d[0]} Heritage Boutique Stay`,
          destId,
          'standard',
          140,
          4.5,
          45,
          'WiFi,Restaurant,Tours,Breakfast',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          `Authentic local charm and modern comfort close to all primary landmarks.`
        ]
      );

      // Add 2 Signature Tour Packages
      db.run(
        'INSERT INTO packages (name, dest_id, hotel_id, description, base_price, duration_days, max_group_size, seasonal_multiplier, image_url) VALUES (?,?,?,?,?,?,?,?,?)',
        [
          `${d[0]} Signature Experience`,
          destId,
          hotelId1,
          `The ultimate guided exploration of ${d[0]} (${d[1]}). Private transfers, iconic sightseeing, gourmet local dining, and hand-picked excursions.`,
          290,
          5,
          8,
          1.2,
          d[6]
        ]
      );
      const p1 = db.prepare('SELECT id FROM packages ORDER BY id DESC LIMIT 1');
      p1.step();
      const pkgId1 = p1.getAsObject().id;
      p1.free();

      // Addons for package 1
      db.run('INSERT INTO addons (package_id, name, description, price) VALUES (?,?,?,?)',
        [pkgId1, 'Private Airport Limousine Transfer', 'Seamless executive pickup & drop-off', 75]);
      db.run('INSERT INTO addons (package_id, name, description, price) VALUES (?,?,?,?)',
        [pkgId1, 'VIP Fast-Track Sightseeing Pass', 'Skip all museum and landmark queues with private guide', 95]);

      db.run(
        'INSERT INTO packages (name, dest_id, hotel_id, description, base_price, duration_days, max_group_size, seasonal_multiplier, image_url) VALUES (?,?,?,?,?,?,?,?,?)',
        [
          `${d[0]} Highlights & Heritage Tour`,
          destId,
          hotelId1,
          `An enriching 7-day holiday discovering hidden gems, scenic viewpoints, cultural masterclasses, and relaxing stays across ${d[1]}.`,
          420,
          7,
          12,
          1.1,
          d[6]
        ]
      );
      const p2 = db.prepare('SELECT id FROM packages ORDER BY id DESC LIMIT 1');
      p2.step();
      const pkgId2 = p2.getAsObject().id;
      p2.free();

      db.run('INSERT INTO addons (package_id, name, description, price) VALUES (?,?,?,?)',
        [pkgId2, 'Gourmet Cultural Dining Experience', 'Multi-course dinner at an award-winning venue', 85]);
    }
  }

  saveDb();

  const finalD = db.prepare('SELECT COUNT(*) as c FROM destinations');
  finalD.step();
  const destCount = finalD.getAsObject().c;
  finalD.free();

  const finalP = db.prepare('SELECT COUNT(*) as c FROM packages');
  finalP.step();
  const pkgCount = finalP.getAsObject().c;
  finalP.free();

  console.log(`✓ Global travel database seeded! Total destinations: ${destCount}, Total tour packages: ${pkgCount}`);
}

module.exports = { seedGlobalTravel };

if (require.main === module) {
  seedGlobalTravel().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
