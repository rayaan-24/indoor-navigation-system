const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/indoornav';

async function updatePasswords() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB:', mongoUri);

    const salt = await bcrypt.genSalt(10);
    const newPassword = 'IndoorNav@123';
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = await mongoose.connection.collection('users').updateMany(
      {},
      { $set: { password: hashedPassword } }
    );
    console.log(`Updated ${result.modifiedCount} user password(s) to "${newPassword}".`);

    const users = await mongoose.connection.collection('users').find({}).toArray();
    for (const u of users) {
      const match = await bcrypt.compare(newPassword, u.password);
      console.log(`User: ${u.email} | Role: ${u.role} | Valid password match: ${match}`);
    }

    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error updating passwords:', err);
    process.exit(1);
  }
}

updatePasswords();
