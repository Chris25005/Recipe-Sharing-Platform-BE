import mongoose from 'mongoose';

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://chrisdiva07:Mongo%40123@cluster007.6v15lqr.mongodb.net/';
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    autoIndex: true
  });
  console.log('Connected to MongoDB');
}



