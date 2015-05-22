getRandomScTrack = () ->
  SC.get "/tracks", (tracks) ->
    randomTrack = tracks[Math.floor(tracks.length * Math.random())]
    $("#audio").prop("src", randomTrack['stream_url'] + "?client_id=" + app.SC_CLIENT_ID)

handleExecution = (response) -> 
  console.log app.nextPageToken
  app.nextPageToken = response["nextPageToken"]

  search_videos = []
  for search_result in response["items"]
    search_videos.push(search_result["id"]["videoId"])
    video_ids = search_videos.join(",")

  app['youtube'].videos.list(
    id: video_ids
    part: 'contentDetails'
  ).execute(handleDetailExecution)


handleDetailExecution = (response) ->
  for r in response["items"]
    duration = r['contentDetails']['duration']
  
    reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
    hours = 0 
    minutes = 0
    seconds = 0

    if reptms.test(duration)
      matches = reptms.exec(duration);
      if matches[1] then hours = Number(matches[1]);
      if matches[2] then minutes = Number(matches[2]);
      if matches[3] then seconds = Number(matches[3]);
      
    match = false
    app.video_duration = new Date(0,0,hours,minutes,seconds,0,0,0,0)
    if app.video_duration.getMinutes() == app.audio_duration.getMinutes() and app.video_duration.getSeconds() == app.audio_duration.getSeconds()
      alert('yahoo')
      match = true
      # if we find a match, return the id of that video
  
      app['video_id'] = r['id'] 
      onPlayerStateChange = (event) ->
        if event.data == YT.PlayerState.PLAYING && !done
            console.log('cool')
      
      onPlayerReady = (event) ->
        event.target.playVideo()
        event.target.mute()
        $('#audio')[0].play()
          
      player = new YT.Player 'player', 
        height: '700'
        width: '1000'
        videoId: app['video_id']
        events: 
          'onReady': onPlayerReady
          'onStateChange': onPlayerStateChange
      break
    else
      continue
  
  if not match
    handleSearch()


handleSearch = () ->
  youtube = app.youtube
  if app.nextPageToken
    console.log 'great'
    videos = youtube.search.list(
      part: "id"
      maxResults: 50
      pageToken:app.nextPageToken
    ).execute(handleExecution)
  else
    console.log 'great just once'
    videos = youtube.search.list(
      part:"id"
      maxResults:50
    ).execute(handleExecution)

setEvents = () ->
  $('#randomSC').click (e) -> 
    getRandomScTrack()
    
  $("#audio").on "canplaythrough", (e) ->
    app.audio_duration = new Date(0,0,0,0,e.currentTarget.duration,0,0,0,0)
    
    

    gapi.client.load 'youtube', 'v3', () ->
      app['youtube'] = gapi.client.youtube
      handleSearch()
    
  $("#uploadAudio").change (e) ->
      file = e.currentTarget.files[0]
      objectUrl = URL.createObjectURL(file)
      $("#audio").prop("src", objectUrl)


window.onload = () ->
  app = window.app = {}
  
  # API keys
  app.YT_DEVELOPER_KEY = 'AIzaSyBbIBg0lplyaKf_q84lQAZ28BZjE41D7ok'
  app.SC_CLIENT_ID = "c285d5176201ed3602694e63b50e5221"

  # init YT api
  gapi.client.setApiKey(app.YT_DEVELOPER_KEY)
  
  # init SC api
  SC.initialize
    client_id: app.SC_CLIENT_ID


  # add event handling
  setEvents()







