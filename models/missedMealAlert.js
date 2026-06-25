import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    date: Date
});

schema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model('missedmealalert', schema);
