module.exports = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.id) {
    // User is authenticated
    next(); // proceed to goat controller
  } else {
    res.status(401).json({ message: 'Unauthorized. Please log in first.' });
  }
};
