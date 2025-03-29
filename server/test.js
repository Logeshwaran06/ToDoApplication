const mongoose = require('mongoose');

DB_URL = "mongodb://localhost:27017/Library_management"

mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected successfully!"))
    .catch((err) => console.error("MongoDB connection error: ", err))

const Books = new mongoose.Schema({
    title: String,
    author: String,
    year_published: Number,
    available_copies: Number
})

const Book = mongoose.model("Book", Books);

const Borrowers = new mongoose.Schema({
    name: String,
    email: String,
})

const Borrower = mongoose.model("Borrower", Borrowers)


const Book1 = new Book({ 
    title: "Harry Potter Vol 1",
    author: "Chou Tzuyu",
    year_published: 2016,
    available_copies: 5
})

const Book2 = new Book({
    title: "Ironman Comic",
    author: "Logeshwaran",
    year_published: 2020,
    available_copies: 10
})

const Book3 = new Book({
    title: "Superman Comic",
    author: "Mohan Ram",
    year_published: 2020,
    available_copies: 10
})

async function saveData() {
    try {
        await Book1.save()
        await Book2.save()
        await Book3.save()
        console.log("Books data saved to DB");
    }
    catch(err) {
        console.error("Books data error when they save: ", err)
    }

    finally{
        mongoose.connection.close();
    }
}

saveData();