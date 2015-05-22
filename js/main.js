(function() {
  var getRandomScTrack, handleDetailExecution, handleExecution, handleSearch, setEvents;

  getRandomScTrack = function() {
    return SC.get("/tracks", function(tracks) {
      var randomTrack;
      randomTrack = tracks[Math.floor(tracks.length * Math.random())];
      return $("#audio").prop("src", randomTrack['stream_url'] + "?client_id=" + app.SC_CLIENT_ID);
    });
  };

  handleExecution = function(response) {
    var search_result, search_videos, video_ids, _i, _len, _ref;
    console.log(app.nextPageToken);
    app.nextPageToken = response["nextPageToken"];
    search_videos = [];
    _ref = response["items"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      search_result = _ref[_i];
      search_videos.push(search_result["id"]["videoId"]);
      video_ids = search_videos.join(",");
    }
    return app['youtube'].videos.list({
      id: video_ids,
      part: 'contentDetails'
    }).execute(handleDetailExecution);
  };

  handleDetailExecution = function(response) {
    var duration, hours, match, matches, minutes, onPlayerReady, onPlayerStateChange, player, r, reptms, seconds, _i, _len, _ref;
    _ref = response["items"];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      r = _ref[_i];
      duration = r['contentDetails']['duration'];
      reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
      hours = 0;
      minutes = 0;
      seconds = 0;
      if (reptms.test(duration)) {
        matches = reptms.exec(duration);
        if (matches[1]) {
          hours = Number(matches[1]);
        }
        if (matches[2]) {
          minutes = Number(matches[2]);
        }
        if (matches[3]) {
          seconds = Number(matches[3]);
        }
      }
      match = false;
      app.video_duration = new Date(0, 0, hours, minutes, seconds, 0, 0, 0, 0);
      if (app.video_duration.getMinutes() === app.audio_duration.getMinutes() && app.video_duration.getSeconds() === app.audio_duration.getSeconds()) {
        alert('yahoo');
        match = true;
        app['video_id'] = r['id'];
        onPlayerStateChange = function(event) {
          if (event.data === YT.PlayerState.PLAYING && !done) {
            return console.log('cool');
          }
        };
        onPlayerReady = function(event) {
          event.target.playVideo();
          event.target.mute();
          return $('#audio')[0].play();
        };
        player = new YT.Player('player', {
          height: '700',
          width: '1000',
          videoId: app['video_id'],
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
        });
        break;
      } else {
        continue;
      }
    }
    if (!match) {
      return handleSearch();
    }
  };

  handleSearch = function() {
    var videos, youtube;
    youtube = app.youtube;
    if (app.nextPageToken) {
      console.log('great');
      return videos = youtube.search.list({
        part: "id",
        maxResults: 50,
        pageToken: app.nextPageToken
      }).execute(handleExecution);
    } else {
      console.log('great just once');
      return videos = youtube.search.list({
        part: "id",
        maxResults: 50
      }).execute(handleExecution);
    }
  };

  setEvents = function() {
    $('#randomSC').click(function(e) {
      return getRandomScTrack();
    });
    $("#audio").on("canplaythrough", function(e) {
      app.audio_duration = new Date(0, 0, 0, 0, e.currentTarget.duration, 0, 0, 0, 0);
      return gapi.client.load('youtube', 'v3', function() {
        app['youtube'] = gapi.client.youtube;
        return handleSearch();
      });
    });
    return $("#uploadAudio").change(function(e) {
      var file, objectUrl;
      file = e.currentTarget.files[0];
      objectUrl = URL.createObjectURL(file);
      return $("#audio").prop("src", objectUrl);
    });
  };

  window.onload = function() {
    var app;
    app = window.app = {};
    app.YT_DEVELOPER_KEY = 'AIzaSyBbIBg0lplyaKf_q84lQAZ28BZjE41D7ok';
    app.SC_CLIENT_ID = "c285d5176201ed3602694e63b50e5221";
    gapi.client.setApiKey(app.YT_DEVELOPER_KEY);
    SC.initialize({
      client_id: app.SC_CLIENT_ID
    });
    return setEvents();
  };

}).call(this);

 //# sourceMappingURL=main.js.map