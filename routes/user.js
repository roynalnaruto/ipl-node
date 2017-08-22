var User = require('../models/user');

module.exports = function(app) {

  app.get('/userImage', function(req, res) {
    var username = req.user.username;

    User.getProfilePicture(username, function(err, photo) {
      if (err) {
        res.end('Error fetching photo');
      }
      console.log(photo);
      console.log(photo.image.buffer);
      res.setHeader('Content-Type', photo.imageType);
      res.end(photo.image.buffer, 'binary');
    });
  });
};
