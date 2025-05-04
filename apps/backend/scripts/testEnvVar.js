require('dotenv').config();

console.log('Testing FIREBASE_SERVICE_ACCOUNT environment variable:');

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.log('❌ FIREBASE_SERVICE_ACCOUNT environment variable is not set');
} else {
  console.log('✅ FIREBASE_SERVICE_ACCOUNT is set');
  
  try {
    // Try to parse it as JSON
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('✅ Successfully parsed as JSON');
    console.log('Detected properties:');
    console.log('- project_id:', serviceAccount.project_id);
    console.log('- client_email:', serviceAccount.client_email);
    
    // Check if it has all required fields
    const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ All required fields are present');
    } else {
      console.log('❌ Missing required fields:', missingFields.join(', '));
    }
    
  } catch (error) {
    console.log('❌ Failed to parse as JSON:', error.message);
    console.log('Hint: The value might be truncated or malformed');
  }
} 