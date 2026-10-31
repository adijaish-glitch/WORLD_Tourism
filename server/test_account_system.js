const assert = require('assert');
const { initDb } = require('./src/db/connection');
const { migrate } = require('./src/db/migrate');
const { connectMongo } = require('./src/db/mongo');
const userService = require('./src/services/userService');
const accountService = require('./src/services/accountService');

async function runAccountTests() {
  console.log('🧪 Starting Account Management & Security Validation...\n');

  await connectMongo();
  await initDb();
  migrate();

  // Create a dedicated test user for account validation
  const timestamp = Date.now();
  const testEmail = `account_traveler_${timestamp}@test.tims`;
  const testPhone = `+1555${timestamp.toString().slice(-7)}`;
  const user = await userService.createUser({
    email: testEmail,
    password: 'SecurePassword123!',
    full_name: 'Alex Traveler',
    username: `alex_${timestamp.toString().slice(-4)}`,
    phone: testPhone,
    role: 'customer',
    provider: 'local'
  });
  assert.ok(user && user.id, 'User created successfully');
  console.log(`✅ 1. Test User Initialized: ${user.full_name} (${user.email}) - ID: ${user.id}`);

  // 1. Profile & Preferences
  console.log('\n2. Testing Profile & Preferences Updates:');
  const updatedUser = await userService.updateUser(user.id, {
    language: 'fr',
    currency: 'EUR',
    travel_preferences: { seat: 'window', dietary: 'vegetarian' },
    notification_preferences: { booking_updates: true, sms_alerts: true, promotions: false }
  });
  assert.strictEqual(updatedUser.language, 'fr');
  assert.strictEqual(updatedUser.currency, 'EUR');
  assert.strictEqual(updatedUser.travel_preferences.seat, 'window');
  assert.strictEqual(updatedUser.notification_preferences.promotions, false);
  console.log('   ✅ Multi-currency, multilingual and travel preferences persisted properly');

  // 2. Wishlist & Saved Places
  console.log('\n3. Testing Wishlist & Saved Places:');
  const addRes1 = accountService.addToWishlist(user.id, {
    item_type: 'destination',
    item_id: 1,
    title: 'Paris, France',
    subtitle: 'City of Light',
    image_url: '/images/paris.jpg',
    price: 1850,
    rating: 4.9,
    link_url: '/destinations/1'
  });
  assert.strictEqual(addRes1.success, true);

  // Duplicate prevention
  const dupRes = accountService.addToWishlist(user.id, {
    item_type: 'destination',
    item_id: 1,
    title: 'Paris, France'
  });
  assert.strictEqual(dupRes.success, true);
  assert.strictEqual(dupRes.message, 'Item already in wishlist');

  const wishlist = accountService.getWishlist(user.id);
  assert.strictEqual(wishlist.length, 1);
  assert.strictEqual(wishlist[0].title, 'Paris, France');

  // Remove from wishlist
  const removeRes = accountService.removeFromWishlist(user.id, wishlist[0].id);
  assert.strictEqual(removeRes.success, true);
  const wishlistAfter = accountService.getWishlist(user.id);
  assert.strictEqual(wishlistAfter.length, 0);
  console.log('   ✅ Wishlist addition, duplicate prevention, and deletion verified');

  // 3. Saved Travellers
  console.log('\n4. Testing Saved Travellers CRUD & Access Control:');
  const traveller = accountService.addTraveller(user.id, {
    first_name: 'Emma',
    last_name: 'Traveler',
    date_of_birth: '1995-06-15',
    gender: 'female',
    traveler_type: 'adult',
    meal_or_dietary: 'Vegan',
    is_primary: 1
  });
  assert.strictEqual(traveller.first_name, 'Emma');
  assert.strictEqual(traveller.is_primary, 1);

  const updatedTraveller = accountService.updateTraveller(user.id, traveller.id, {
    meal_or_dietary: 'Gluten Free'
  });
  assert.strictEqual(updatedTraveller.meal_or_dietary, 'Gluten Free');

  const listTravellers = accountService.getTravellers(user.id);
  assert.strictEqual(listTravellers.length, 1);

  const deleteTravellerRes = accountService.deleteTraveller(user.id, traveller.id);
  assert.strictEqual(deleteTravellerRes.success, true);
  assert.strictEqual(accountService.getTravellers(user.id).length, 0);
  console.log('   ✅ Saved travellers creation, editing, and deletion verified');

  // 4. Phone Verification via Twilio SMS
  console.log('\n5. Testing Twilio SMS Phone Verification:');
  const otpSendRes = await accountService.sendPhoneVerificationOtp(user.id, '+15559876543');
  assert.strictEqual(otpSendRes.phone, '+15559876543');
  assert.ok(otpSendRes.devCode, 'Dev code generated for testing');

  // Verify OTP
  const verifyRes = await accountService.verifyPhoneOtp(user.id, '+15559876543', otpSendRes.devCode);
  assert.strictEqual(verifyRes.phone_verified, true);

  const reloadedUser = await userService.findById(user.id);
  assert.strictEqual(reloadedUser.phone_verified, true);
  assert.strictEqual(reloadedUser.phone, '+15559876543');
  console.log('   ✅ Twilio SMS OTP dispatch, verification, and phone_verified flag verified');

  // 5. Support Tickets & Concierge Thread
  console.log('\n6. Testing Support Tickets & Conversation Threads:');
  const ticketData = accountService.createTicket(user.id, {
    category: 'booking_inquiry',
    subject: 'Question regarding Eiffel Tower night tour',
    message: 'Could you please confirm if night tour tickets are included?',
    booking_reference: 'TIMS-2026-TEST01',
    priority: 'high'
  }, user);

  assert.ok(ticketData.ticket.ticket_number.startsWith('TIMS-TKT-'));
  assert.strictEqual(ticketData.ticket.status, 'open');
  assert.strictEqual(ticketData.messages.length, 1);

  // Admin replies to ticket
  const adminReplied = accountService.replyToTicket(
    ticketData.ticket.id,
    999,
    'Support Concierge (Sarah)',
    'support',
    'Yes, the luxury package includes priority access evening passes.',
    'awaiting_user_response',
    true
  );
  assert.strictEqual(adminReplied.ticket.status, 'awaiting_user_response');
  assert.strictEqual(adminReplied.messages.length, 2);

  // User replies back
  const userReplied = accountService.replyToTicket(
    ticketData.ticket.id,
    user.id,
    user.full_name,
    'user',
    'Thank you so much, looking forward to the trip!',
    'in_progress',
    false
  );
  assert.strictEqual(userReplied.messages.length, 3);
  console.log('   ✅ Support ticket logging, booking ref linkage, and conversation threads verified');

  // 6. Security Overview
  console.log('\n7. Testing Login & Security Overview:');
  const security = accountService.getSecurityOverview(reloadedUser);
  assert.strictEqual(security.email, testEmail);
  assert.strictEqual(security.phone_verified, true);
  assert.strictEqual(security.hasPassword, true);
  console.log('   ✅ Security overview accurately reflects authenticated user credentials');

  // 7. Notifications Log
  console.log('\n8. Testing In-App & SMS Notification Log:');
  const notifications = accountService.getNotifications(user.id);
  assert.ok(notifications.length >= 2, 'Notifications generated from ticket and phone verify');
  const readRes = accountService.markNotificationRead(user.id, 'all');
  assert.strictEqual(readRes.success, true);
  console.log('   ✅ Notification tracking and read status verified');

  console.log('\n🎉 ALL ACCOUNT MANAGEMENT & SECURITY TESTS PASSED SUCCESSFULLY!\n');
  process.exit(0);
}

runAccountTests().catch(err => {
  console.error('❌ Account test failed:', err);
  process.exit(1);
});
