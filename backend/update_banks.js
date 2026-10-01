const mongoose = require('mongoose');

async function updateBanks() {
  await mongoose.connect('mongodb://127.0.0.1:27017/fake_money_db');

  const r1 = await mongoose.connection.db.collection('users').updateOne(
    { username: 'fakemoney@idc' },
    { $set: { fictionalBank: 'Union Bank', fullName: 'Anubhav Tiwari' } }
  );
  console.log('Updated fakemoney@idc:', r1.modifiedCount);

  const r2 = await mongoose.connection.db.collection('users').updateOne(
    { username: 'fakemoney2@idc' },
    { $set: { fictionalBank: 'HDFC Bank', fullName: 'Manni Singh' } }
  );
  console.log('Updated fakemoney2@idc:', r2.modifiedCount);

  const rTx1 = await mongoose.connection.db.collection('transactions').updateMany(
    { senderUsername: 'fakemoney@idc' },
    { $set: { fictionalBank: 'Union Bank of India' } }
  );
  console.log('Updated fakemoney txns:', rTx1.modifiedCount);

  const rTx2 = await mongoose.connection.db.collection('transactions').updateMany(
    { senderUsername: 'fakemoney2@idc' },
    { $set: { fictionalBank: 'HDFC Bank' } }
  );
  console.log('Updated fakemoney2 txns:', rTx2.modifiedCount);

  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log(users.map(u => ({ username: u.username, fullName: u.fullName, fictionalBank: u.fictionalBank })));

  process.exit(0);
}

updateBanks().catch(err => {
  console.error(err);
  process.exit(1);
});
