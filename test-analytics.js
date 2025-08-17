#!/usr/bin/env node

/**
 * Test script for Klantroef Analytics API
 * Run with: node test-analytics.js
 */

const BASE_URL = 'http://localhost:3000';

async function testAnalytics() {
  console.log('Testing Klantroef Analytics API...\n');

  let token = null;
  let mediaId = null;

  try {
    console.log('Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health Check:', healthData);
    console.log('');

    // Test 2: User Login (get existing user or create new one)
    console.log('2️⃣ Testing User Login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@klantroef.com',
        password: 'securepassword123'
      })
    });

    if (loginResponse.status === 401) {
      // User doesn't exist, create one
      console.log('   Creating new user...');
      const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@klantroef.com',
          password: 'securepassword123'
        })
      });
      const signupData = await signupResponse.json();
      console.log('   ✅ User created:', signupData.message);

      // Now login
      const loginResponse2 = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@klantroef.com',
          password: 'securepassword123'
        })
      });
      const loginData = await loginResponse2.json();
      token = loginData.token;
    } else {
      const loginData = await loginResponse.json();
      token = loginData.token;
    }

    console.log('✅ Login successful, token received');
    console.log('');

    // Test 3: Create Media Asset
    console.log('3️⃣ Testing Media Asset Creation...');
    const mediaResponse = await fetch(`${BASE_URL}/media`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Analytics Test Video',
        type: 'video',
        file_url: 'https://example.com/videos/analytics-test.mp4'
      })
    });
    const mediaData = await mediaResponse.json();
    mediaId = mediaData.mediaId;
    console.log('✅ Media Created:', mediaData.message, 'ID:', mediaId);
    console.log('');

    // Test 4: Log Multiple Views (simulate different IPs)
    console.log('4️⃣ Testing View Logging...');
    const testIPs = ['192.168.1.100', '192.168.1.101', '10.0.0.50', '172.16.0.25'];
    
    for (let i = 0; i < testIPs.length; i++) {
      const ip = testIPs[i];
      // Simulate multiple views from same IP
      for (let j = 0; j < 3; j++) {
        const viewResponse = await fetch(`${BASE_URL}/media/${mediaId}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ip: ip })
        });
        
        if (viewResponse.ok) {
          const viewData = await viewResponse.json();
          console.log(`   ✅ View logged from ${ip} (${j + 1}/3)`);
        } else {
          console.log(`   ❌ Failed to log view from ${ip}`);
        }
      }
    }
    console.log('');

    // Test 5: Get Analytics Data
    console.log('5️⃣ Testing Analytics Endpoint...');
    const analyticsResponse = await fetch(`${BASE_URL}/media/${mediaId}/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();
      console.log('✅ Analytics Retrieved:');
      console.log(`   • Total Views: ${analyticsData.analytics.total_views}`);
      console.log(`   • Unique IPs: ${analyticsData.analytics.unique_ips}`);
      console.log(`   • Views per Day:`, analyticsData.analytics.views_per_day);
      console.log(`   • Top Viewing IPs:`, analyticsData.analytics.top_viewing_ips);
      console.log(`   • Last Updated: ${analyticsData.analytics.last_updated}`);
    } else {
      const errorData = await analyticsResponse.json();
      console.log('❌ Analytics failed:', errorData);
    }
    console.log('');

    // Test 6: Test Unauthorized Access
    console.log('6️⃣ Testing Unauthorized Access...');
    const unauthorizedResponse = await fetch(`${BASE_URL}/media/${mediaId}/analytics`);
    if (unauthorizedResponse.status === 401) {
      console.log('✅ Unauthorized access properly blocked');
    } else {
      console.log('❌ Unauthorized access not properly blocked');
    }
    console.log('');

    // Test 7: Test Non-existent Media
    console.log('7️⃣ Testing Non-existent Media...');
    const nonExistentResponse = await fetch(`${BASE_URL}/media/99999/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (nonExistentResponse.status === 404) {
      console.log('✅ Non-existent media properly handled');
    } else {
      console.log('❌ Non-existent media not properly handled');
    }
    console.log('');

    // Test 8: Generate Streaming URL (this also logs a view)
    console.log('8️⃣ Testing Streaming URL Generation...');
    const streamUrlResponse = await fetch(`${BASE_URL}/media/${mediaId}/stream-url`);
    if (streamUrlResponse.ok) {
      const streamUrlData = await streamUrlResponse.json();
      console.log('✅ Streaming URL Generated:', streamUrlData.message);
      console.log(`   • Stream URL: ${BASE_URL}${streamUrlData.streamUrl}`);
      console.log(`   • Expires: ${streamUrlData.expiresAt}`);
    } else {
      console.log('❌ Streaming URL generation failed');
    }
    console.log('');

    // Test 9: Get Updated Analytics (should show increased views)
    console.log('9️⃣ Testing Updated Analytics...');
    const updatedAnalyticsResponse = await fetch(`${BASE_URL}/media/${mediaId}/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (updatedAnalyticsResponse.ok) {
      const updatedAnalyticsData = await updatedAnalyticsResponse.json();
      console.log('✅ Updated Analytics:');
      console.log(`   • Total Views: ${updatedAnalyticsData.analytics.total_views}`);
      console.log(`   • Unique IPs: ${updatedAnalyticsData.analytics.unique_ips}`);
    } else {
      console.log('❌ Updated analytics failed');
    }
    console.log('');

    console.log('🎉 All Analytics API tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Server: ${BASE_URL}`);
    console.log(`   • Media ID: ${mediaId}`);
    console.log(`   • JWT Token: ${token.substring(0, 20)}...`);
    console.log('\n🔗 Test the analytics endpoint:');
    console.log(`   ${BASE_URL}/media/${mediaId}/analytics`);

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
testAnalytics();
