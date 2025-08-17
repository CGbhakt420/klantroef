#!/usr/bin/env node

/**
 * Test script for Klantroef API
 * Run with: node test-api.js
 */

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🚀 Testing Klantroef API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
    console.log('');

    // Test 2: User Signup
    console.log('2️⃣ Testing User Signup...');
    const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@klantroef.com',
        password: 'securepassword123'
      })
    });
    const signupData = await signupResponse.json();
    console.log('✅ Signup:', signupData);
    console.log('');

    // Test 3: User Login
    console.log('3️⃣ Testing User Login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@klantroef.com',
        password: 'securepassword123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login:', loginData);
    
    if (!loginData.token) {
      throw new Error('No JWT token received');
    }
    
    const token = loginData.token;
    console.log('');

    // Test 4: Add Media Asset
    console.log('4️⃣ Testing Media Asset Creation...');
    const mediaResponse = await fetch(`${BASE_URL}/media`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Sample Video Tutorial',
        type: 'video',
        file_url: 'https://example.com/videos/tutorial.mp4'
      })
    });
    const mediaData = await mediaResponse.json();
    console.log('✅ Media Created:', mediaData);
    
    const mediaId = mediaData.mediaId;
    console.log('');

    // Test 5: Generate Streaming URL
    console.log('5️⃣ Testing Streaming URL Generation...');
    const streamUrlResponse = await fetch(`${BASE_URL}/media/${mediaId}/stream-url`);
    const streamUrlData = await streamUrlResponse.json();
    console.log('✅ Streaming URL Generated:', streamUrlData);
    console.log('');

    // Test 6: List All Media (Authenticated)
    console.log('6️⃣ Testing Media Listing...');
    const listResponse = await fetch(`${BASE_URL}/media`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const listData = await listResponse.json();
    console.log('✅ Media List:', listData);
    console.log('');

    // Test 7: Get Specific Media
    console.log('7️⃣ Testing Specific Media Retrieval...');
    const specificMediaResponse = await fetch(`${BASE_URL}/media/${mediaId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const specificMediaData = await specificMediaResponse.json();
    console.log('✅ Specific Media:', specificMediaData);
    console.log('');

    console.log('🎉 All API tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Server: ${BASE_URL}`);
    console.log(`   • Admin User: admin@klantroef.com`);
    console.log(`   • Media ID: ${mediaId}`);
    console.log(`   • JWT Token: ${token.substring(0, 20)}...`);
    console.log('\n🔗 You can now test the streaming URL manually:');
    console.log(`   ${BASE_URL}${streamUrlData.streamUrl}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ for fetch support');
  console.error('   Please upgrade Node.js or install node-fetch');
  process.exit(1);
}

// Run the tests
testAPI();
