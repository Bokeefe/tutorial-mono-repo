const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({
  path: path.join(__dirname, ".env"),
});
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mm = require('musicmetadata');
var fs = require('fs');
var walk = require('walk');

const port = 8080;

// models
// const User = require("./models/user");

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// Read a track dictionary for a music file.
var trackDict = function(path, fileName, func) {
  mm(fs.createReadStream(path), function (err, metadata) {
    if (err) {
      return;
    }
    func({
      'path': fileName,
      'artist': metadata.artist[0],
      'genre': metadata.genre,
      'title': metadata.title,
      'album': metadata.album
    });
  });
};

// Read all the music files in a directory (recursively) and record all of
// their metadata dictionaries in a giant array.
var readMetadata = function (basedir, func) {
  var md = [];
  var walker = walk.walk(basedir);
  walker.on("file", function (root, stats, next) {
    var p = path.join(root, stats.name);
    var fileName = p.replace('music/', '');
    trackDict(p, fileName,  function (d) {
        console.log(d);
      md.push(d);
    });

    next();
  })
};

// routes
const musicRoutes = require("./routes/music");
app.use('/api/music', musicRoutes);

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {

    console.log("listening on port:", port);
  }
});