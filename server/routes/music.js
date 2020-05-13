const router = require('express').Router()
const fs = require('fs');
const walk  = require('walk')
const path = require('path')
const musicmetadata = require('musicmetadata')
const musicDir = '/Users/krenshaw/Music/instrumental';

let allMusicData;

// Read a track dictionary for a music file.
var trackDict = function(path, fileName, func) {
  musicmetadata(fs.createReadStream(path), function (err, metadata) {
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
      md.push(d);
    });

    next();
  // @ts-ignore
  }).on("end", function () {
    // Add IDs to each.
    for (var i = 0; i < md.length; ++i) {
      md[i].id = i.toString();
    }
    func(md);
    allMusicData = md
  });
};

// Read the metadata and start the server.
readMetadata(musicDir, function (tracks) {
  let genres = [];
  let playlist = {};
  for(let track of tracks){
    if(!genres.includes(track.genre[0])){
      genres.push(track.genre[0]);
      playlist[track.genre[0]] = [track];
    } else {
      playlist[track.genre[0]].push(track);
    }
  }
});

router.get('/genres',
    async (req, res) => {
        const genres = fs.readdirSync(musicDir).map(file => {
                return file
            });

        try {
            res.json({
                status: true,
                genres:genres
            })
        } 
        catch (err) {
                res.status(500).json({
                    status: false,
                    message: err.message
                })
            }
    })

    router.get('/allTrackData',
        async (req, res) => {
            try {

                res.json({
                    status: true,
                    trackData: allMusicData
                })
            } 
            catch (err) {
                    res.status(500).json({
                        status: false,
                        message: err.message
                    })
                }
        })

    
module.exports = router;