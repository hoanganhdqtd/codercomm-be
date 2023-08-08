# CoderComm

## Functional Specification

CoderComm is a social network that allows people to join by signup. Each user should provide username, email, password, address to create an account. The email should not link to any account in the system (unique).

After joining CoderComm, users can update their profile info like Avatar, Company, JobTitle, Social links, and a short description about themselves.

Users can create posts containing text and a image. The posts will be shown on the user profile page, allowing other users to comment. Users can also react with like and dislike icon on a post or a comment.

Users can send friend requests to other users who have an open relationship with them. Users can accept or decline a friend request. After accepting a friend request, both become friends, and they can see posts of each other.

## User stories

### Authentication

- [x] As a user, I can register with name, email, password
- [x] As a user, I can login with their email, password
- [x] As a user, I can stay signed-in after refreshing page

### Users

- [x] As a user, I can can see a list of other users to send, accept, or decline friend requests
- [x] As a user, I can get my current profile info (to stay signed-in after refreshing page)
- [x] As a user, I can view other users' info via their user ID.
- [x] As a user, I can can update my profile info (Avatar, Company, JobTitle, Social links, Description)

### Posts

- [x] As a user, I can see a list of posts on my homepage or other users' one.
- [x] As a user, I can create a new post with text and image on my homepage
- [x] As a user, I can edit my own posts.
- [x] As a user, I can delete my own posts.

### Comments

- [x] As a user, I can see a list of comments on a post.
- [x] As a user, I can write comments on a post.
- [x] As a user, I can edit my own comments.
- [x] As a user, I can delete my own comments.

### Reactions

- [x] As a user, I can like/dislike posts/comments

### Friends

- [x] As a user, I can send friend request to others who are not my friends yet.
- [x] As a user, I can see a list of friend requests received.
- [x] As a user, I can see a list of friend requests I have sent.
- [x] As a user, I can see a list of my friends.
- [x] As a user, I can accept / decline friend requests.
- [x] As a user, I can cancel friend requests that have been sent.
- [x] As a user, I can unfriend other users in my friend list.

### Endpoint APIs

### Auth APIs

```JavaScript
/**
 * @route POST /auth/login
 * @description Login with email and password
 * @body { email, password }
 * @access Public
 */
```

### User APIs

```JavaScript
/**
 * @route POST /users
 * @description Register
 * @body { name, email, password }
 * @access Public
 */
```

```JavaScript
/**
 * @route GET /users?page=1&limit=10
 * @description Get users with pagination
 * @access Login required
 */
```

```JavaScript
/**
 * @route GET /users/me
 * @description Get current user's info
 * @access Login required
 */
```

```JavaScript
/**
 * @route GET /users/:id
 * @description Get a user's profile
 * @access Login required
 */
```

```JavaScript
/**
 * @route PUT /users/:id
 * @description update user's profile
 * @body { name, avatarUrl, coverUrl, aboutMe, city, country, company, jobTitle, facebookLink, instagramLink, linkedinLink, twitterLink }
 * @access Login required
 */
```

### Post APIs

```JavaScript
/**
 * @route GET /posts/user/:userId?page=1&limit=10
 * @description Get all posts a user can see with pagination
 * @access Login required
 */
```

```JavaScript
/**
 * @route POST /posts
 * @description Create a new post
 * @body { content, image }
 * @access Login required
 */
```

```JavaScript
/**
 * @route PUT /posts/:id
 * @description Edit a post with a specific id
 * @body { content, image }
 * @access Login required
 */
```

```JavaScript
/**
 * @route DELETE /posts/:id
 * @description Delete a post with a specific id
 * @access Login required
 */
```

```JavaScript
/**
 * @route GET /posts/:id
 * @description Get a post with a specific id
 * @access Login required
 */
```

```JavaScript
/**
 * @route GET /posts/:id/comments
 * @description Get comments on a post with a specific id
 * @access Login required
 */
```

### Comment APIs

```JavaScript
/**
 * @route POST /comments
 * @description Create a new comment
 * @body { content, postId }
 * @access Login required
 */
```

```JavaScript
/**
 * @route PUT /comments/:id
 * @description Edit a comment with a specific id
 * @body { content }
 * @access Login required
 */
```

```JavaScript
/**
 * @route GET /comments/:id
 * @description Get detail of a comment with a specific id
 * @access Login required
 */
```

```JavaScript
/**
 * @route DELETE /comments/:id
 * @description Delete a comment with a specific id
 * @access Login required
 */
```

### Reaction APIs

```JavaScript
/**
 * @route POST /reactions
 * @description Save a reaction to a post / comment
 * @body { targetType: "Post" or "Comment", targetId, emoji: "like" or "dislike" }
 * @access Login required
 */
```

### Friend APIs

```JavaScript
/**
 * @route POST /friends/requests
 * @description Send a friend request
 * @body { to: userId }
 * @access Login required
 */
```

```JavaScript
/**
 * @route GET /friends/incoming
 * @description Get the list of received pending friend requests
 * @access Login required
 */
```

```JavaScript
/**
 * @route GET /friends/outgoing
 * @description Get the list of sent pending friend requests
 * @access Login required
 */
```

```JavaScript
/**
 * @route GET /friends
 * @description Get the list of friends
 * @access Login required
 */
```

```JavaScript
/**
 * @route PUT /friends/requests/:userId
 * @description Accept / reject the friend request from a user
 * @body { status: "accepted" or "declined" }
 * @access Login required
 */
```

```JavaScript
/**
 * @route DELETE /friends/requests/:userId
 * @description Delete the friend request to a user
 * @access Login required
 */
```

```JavaScript
/**
 * @route DELETE /friends/:userId
 * @description Remove a friend
 * @access Login required
 */
```

### Summary

- Start with functional specification
- List down user stories
- Design endpoint APIs
- Entity Relationship Diagram
- Code
