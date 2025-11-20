# Player Management App - Node.js & MongoDB

**🌐 Live Site:** [players.thomasscheiber.com](https://players.thomasscheiber.com)

A full-stack web application for managing player profiles with CRUD operations, built with Node.js, Express, MongoDB, and EJS templating.

## 🚀 Features

- **Create Players**: Add new player profiles with username, full name, and bio
- **View All Players**: Browse through all registered players
- **View Details**: See individual player information
- **Update Players**: Edit existing player profiles
- **Delete Players**: Remove players from the database
- **Responsive Design**: Clean, user-friendly interface

## 🛠️ Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database solution
- **Mongoose** - MongoDB object modeling
- **EJS** - Embedded JavaScript templating
- **Morgan** - HTTP request logger middleware
- **Lodash** - Utility library

## 📦 Installation & Setup

```bash
# Install dependencies
npm install

# Start the server (requires MongoDB connection string)
npm start
```

The application will run on `http://localhost:3000`

> **No database handy?**  
> Set `DISABLE_DB=true` (or simply omit `MONGODB_URI`) to boot the app with a
> small JSON-backed datastore that lives in `data/localPlayers.json`.

## 🏗️ Project Structure

```text
Player Management App/
├── controllers/       # Route controllers
│   └── playerController.js
├── models/           # Database models
│   └── player.js
├── routes/           # Express routes
│   └── playerRoutes.js
├── views/            # EJS templates
│   ├── index.ejs
│   ├── create.ejs
│   ├── details.ejs
│   └── about.ejs
├── public/           # Static files (CSS, images)
├── docs/             # Blog documentation
└── index.js          # Main application file
```

## 🗄️ Database

The application uses **MongoDB Atlas** for cloud database storage with Mongoose as the ODM (Object Data Mapper).

When a MongoDB connection string is not provided (or `DISABLE_DB=true`), the
server automatically falls back to a file-backed data store so you can still
demo the UI and CRUD flows without any external services.

### Player Schema

```javascript
{
  username: String,
  fullname: String,
  bio: String
}
```

## 🌐 Routes

- `GET /` - Redirects to players list
- `GET /players` - View all players
- `GET /players/create` - Create new player form
- `POST /players` - Submit new player
- `GET /players/:id` - View player details
- `DELETE /players/:id` - Delete a player
- `GET /about` - About page

## 💡 Key Features

### MVC Architecture

- **Models**: Mongoose schemas for data structure
- **Views**: EJS templates for dynamic HTML
- **Controllers**: Business logic and request handling

### Middleware

- Morgan for request logging
- Express static for serving public files
- Body parser for form data

### Database Operations

- Create, Read, Update, Delete (CRUD) operations
- MongoDB connection handling
- Error handling for database operations

## 📚 Learning Outcomes

This project demonstrates:

- RESTful API design
- Express.js middleware
- MongoDB database integration
- Server-side templating with EJS
- MVC architecture pattern
- Asynchronous JavaScript
- Environment configuration

## 🚀 Deployment

**🌐 Live Site:** [players.thomasscheiber.com](https://players.thomasscheiber.com)

To deploy this application:

1. Set up MongoDB Atlas cluster
2. Update connection string with your credentials
3. Configure environment variables
4. Deploy to your hosting platform (Coolify, Heroku, DigitalOcean, etc.)

## ⚠️ Note

Remember to:

- Update MongoDB connection string with your own credentials
- Never commit sensitive data (passwords, API keys) to version control
- Use environment variables for production deployment

---

**Built with Node.js** 🟢 | **Powered by MongoDB** 🍃 | **Styled with EJS** 📄
