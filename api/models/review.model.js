import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    authorName: {
        type: String,
        required: true
    },
    authorAvatar: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    content: {
        type: String,
        required: true
    },
    profession: {
        type: String,
        default: "Member"
    }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
