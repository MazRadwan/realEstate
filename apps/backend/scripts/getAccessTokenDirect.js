const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

/**
 * This script gets an access token for Firebase Auth API
 * It requires a service account JSON file
 */

// Check for service account file path
const serviceAccountPath = process.argv[2];
if (!serviceAccountPath) {
  console.error('Please provide the path to your service account JSON file:');
  console.error('node scripts/getAccessTokenDirect.js /path/to/service-account.json');
  process.exit(1);
}

async function getAccessToken() {
  try {
    // Read the service account file
    const serviceAccountFile = path.resolve(serviceAccountPath);
    if (!fs.existsSync(serviceAccountFile)) {
      console.error(`File not found: ${serviceAccountFile}`);
      process.exit(1);
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountFile, 'utf8'));
    
    // Create a JWT client using the service account
    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/cloud-platform',
       'https://www.googleapis.com/auth/firebase.database',
       'https://www.googleapis.com/auth/firebase']
    );
    
    // Get the access token
    const tokens = await jwtClient.authorize();
    console.log('\nAccess Token:');
    console.log(tokens.access_token);
    console.log('\nExpires in:', tokens.expires_in, 'seconds');
    console.log('\nUse this token in the Authorization header:');
    console.log(`Authorization: Bearer ${tokens.access_token}`);
    
  } catch (error) {
    console.error('Error getting access token:', error);
  }
}

getAccessToken(); 