// Script to delete a user from the database
// Run this with: node scripts/delete-user.js

const mongoose = require('mongoose');

// Replace with your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-uri-here';

async function deleteUser(email) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await mongoose.connection.db.collection('users').deleteOne({ email });
    
    if (result.deletedCount > 0) {
      console.log(` Successfully deleted user: ${email}`);
    } else {
      console.log(` User not found: ${email}`);
    }

    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'bitlashravyareddy@gmail.com';
deleteUser(email);
