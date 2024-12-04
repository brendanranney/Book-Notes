

const express = require('express');
const path = require('path');
const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');

// Database configuration
const dbConfig = {
    username: 'postgres',
    password: 'Wyd4jp9a?',
    database: 'world',
    host: 'localhost',  
    port: '5432',
    dialect: 'postgres',
};


const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect
});


const Book = sequelize.define('Book', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    coverarturl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    rating: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    review: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'books',  
    timestamps: false
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const app = express();
const port = 3000;

app.set('view engine', 'ejs');


app.set('views', path.join(__dirname, 'public'));


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
    try {
        const books = await Book.findAll();
        for (let book of books) {
            if (!book.coverarturl) {
                book.coverarturl = await getCoverArt(book.title);
                await book.save();
            }
        }
        res.render('index', { books });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).send('Internal Server Error');
    }
});




async function getCoverArt(title) {
    try {
        const response = await axios.get(`http://openapi.example.com/getCover?title=${title}`);
        if (response.status === 200) {
            return response.data.cover_url;  // Adjust according to actual API response
        }
    } catch (error) {
        console.error(error);
    }
    return '/default_cover.jpg'; // Default cover image path
}



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});