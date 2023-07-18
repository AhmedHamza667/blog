const express = require("express");
const app = express();
const port = 4000;
const bcrypt = require("bcryptjs");
const session = require('express-session');
const {User, Post, Comment} = require("./models");
require("dotenv").config();


app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.originalUrl}`);
    res.on("finish", () => {
      // the 'finish' event will be emitted when the response is handed over to the OS
      console.log(`Response Status: ${res.statusCode}`);
    });
    next();
  });
  app.use(express.json());
  
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000 // 1 hour
    },
  }));

  //Authentication

  const authenticateUser = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'You must be logged in to view this page.' });
    }
    next();
  };


app.post("/signup", async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
  
    try {
      const user = await User.create({
        name: req.body.name,
        password: hashedPassword,
        email: req.body.email,
      })
      res.status(201).json({
        message: "User created!",
        user: {
          name: user.name,
          email: user.email,
        }
      })
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        return res.status(422).json({ errors: error.errors.map((e) => e.message) });
      }
      console.error(error);
      res.status(500).json({
        message: "Error occurred while creating a new user account"
      })
    }
  })


app.post('/login', async (req, res) => {
    try {
      // First, find the user by their email address
      const user = await User.findOne({ where: { email: req.body.email } });
  
      if (user === null) {
        // If the user isn't found in the database, return an 'incorrect credentials' message
        return res.status(401).json({
          message: 'Incorrect credentials'
        });
      }
  
      // If the user is found, we then use bcrypt to check if the password in the request matches the hashed password in the database
      bcrypt.compare(req.body.password, user.password, (error, result) => {
        if (result) {
          // Passwords match
          // TODO: Create a session for this user
          req.session.userId = user.id;
          res.status(200).json({
            message: 'Logged in successfully',
            user: {
              name: user.name,
              email: user.email,
            },
          });
        } else {
          // Passwords don't match
          res.status(401).json({ message: 'Incorrect credentials' });
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred during the login process' });
    }
  });

app.delete('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.sendStatus(500);
        }

        res.clearCookie('connect.sid');
        return res.sendStatus(200);
    });
});

app.get("/users", authenticateUser, async(req, res) => {
  const test = await User.findAll();
  res.send(test)
});


// posts 

app.get("/", async(req, res) => {
  res.send("welcome to my blog")
});



// Get all posts
app.get("/posts", async (req, res) => {
    try {
      const allPosts = await Post.findAll();
  
      res.status(200).json(allPosts);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });


//Create a new post
app.post("/posts", authenticateUser, async (req, res) => {
  const postData = req.body;
  try {
    const newPost = await Post.create(postData);
    res.status(201).json(newPost);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(422).json({ errors: err.errors.map(e => e.message) });
    }
    console.error(err);
    res.status(500).json({ message: 'An unexpected error occurred.' });
  }
});


  // Get a specific post
  app.get("/posts/:id", async (req, res) => {
    const postId = parseInt(req.params.id, 10);
  
    try {
      const postCall = await Post.findOne({ where: { id: postId } });
  
      if (postCall) {
        res.status(200).json(postCall);
      } else {
        res.status(404).send({ message: "Post not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });
  

  // Update a specific post
  app.patch("/posts/:id", authenticateUser, async (req, res) => {
    const postId = parseInt(req.params.id, 10);
  
    try {
      const [numberOfAffectedRows, affectedRows] = await Post.update(
        req.body,
        { where: { id: postId }, returning: true }
      );
  
      if (numberOfAffectedRows > 0) {
        res.status(200).json(affectedRows[0]);
      } else {
        res.status(404).send({ message: "Post not found" });
      }
    } catch (err) {
      if (err.name === "SequelizeValidationError") {
        return res.status(422).json({ errors: err.errors.map((e) => e.message) });
      }
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });

// Delete a specific post
app.delete("/posts/:id", authenticateUser, async (req, res) => {
    const postId = parseInt(req.params.id, 10);
  
    try {
      const deleteOp = await Post.destroy({ where: { id: postId } });
  
      if (deleteOp > 0) {
        res.status(200).send({ message: "Post deleted successfully" });
      } else {
        res.status(404).send({ message: "Post not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });

  app.post("/comments", authenticateUser, async (req, res) => {
    const commentData = req.body;
    try {
      const newComment = await Comment.create(commentData);
      res.status(201).json(newComment);
    } catch (err) {
      if (err.name === 'SequelizeValidationError') {
        return res.status(422).json({ errors: err.errors.map(e => e.message) });
      }
      console.error(err);
      res.status(500).json({ message: 'An unexpected error occurred.' });
    }
  });
  // get all comments
  app.get("/comments", async (req, res) => {
    try {
      const allComments = await Comment.findAll();
  
      res.status(200).json(allComments);
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });

// get comment by id
  app.get("/comments/:id", async (req, res) => {
    const commentId = parseInt(req.params.id, 10);
  
    try {
      const commentCall = await Comment.findOne({ where: { id: commentId } });
  
      if (commentCall) {
        res.status(200).json(commentCall);
      } else {
        res.status(404).send({ message: "Comment not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });

// get all comments on a specific post
  app.get("/posts/comments/:id", async (req, res) => {
    const commentId = parseInt(req.params.id, 10);
  
    try {
      const commentCall = await Comment.findAll({ where: { PostId: commentId } });
  
      if (commentCall) {
        res.status(200).json(commentCall);
      } else {
        res.status(404).send({ message: "Comment not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });
 // edit a specific comment
  app.patch("/comments/:id", authenticateUser, async (req, res) => {
    const commentId = parseInt(req.params.id, 10);
  
    try {
      const [numberOfAffectedRows, affectedRows] = await Comment.update(
        req.body,
        { where: { id: commentId }, returning: true }
      );
  
      if (numberOfAffectedRows > 0) {
        res.status(200).json(affectedRows[0]);
      } else {
        res.status(404).send({ message: "Comment not found" });
      }
    } catch (err) {
      if (err.name === "SequelizeValidationError") {
        return res.status(422).json({ errors: err.errors.map((e) => e.message) });
      }
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });

// Delete a specific commet
app.delete("/comments/:id", authenticateUser, async (req, res) => {
    const commentId = parseInt(req.params.id, 10);
  
    try {
      const deleteOp = await Comment.destroy({ where: { id: commentId } });
  
      if (deleteOp > 0) {
        res.status(200).send({ message: "Comment deleted successfully" });
      } else {
        res.status(404).send({ message: "Comment not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: err.message });
    }
  });


// BONUS

// Retrieve all Comments for a specific User
app.get("/user/comments/:id", async (req, res) => {
  const allCommentsForUser = parseInt(req.params.id, 10);

  try {
    const allComments = await Comment.findAll({ where: { UserId: allCommentsForUser}});

    res.status(200).json(allComments);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});


// Retrieve all Comments for a specific Post
app.get("/post/comments/:id", async (req, res) => {
  const allCommentsForPost = parseInt(req.params.id, 10);

  try {
    const allComments = await Comment.findAll({ where: { PostId: allCommentsForPost}});

    res.status(200).json(allComments);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
});

  
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });