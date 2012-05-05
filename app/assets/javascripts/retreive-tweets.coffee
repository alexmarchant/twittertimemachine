$ ->
  $('#loading-button').click ->
    username = $('#username').val()
    setTitle()
    clearPage()
    setLoading()
    getTweets(username)
    setupNav()

tweetdb = []
page = 1
yearsAndMonths = {}
sortedTweets = {}
errorTry = 0

setTitle = ->
  $('a.brand').text("Twitter Time Machine")

clearPage = ->
  $('.row').children().remove()
  
setLoading = ->
  $('.row').append("<div class='span12'><h1>Loading...</h1><p>Hang on, this might take a minute.</p></div>")

getTweets = (username) ->
  req = $.ajax
    url: "http://api.twitter.com/1/statuses/user_timeline.json?screen_name=#{username}&page=#{page}&count=200&include_rts=1"
    dataType: "jsonp"
    timeout : 10000
    success: (data) ->
      if data.length > 0
        $.each data, (index, tweet) ->
          tweetdb.push(tweet)
        page += 1
        getTweets(username)
      else
        finishedGet()
  
  req.error ->
    if errorTry < 3
      errorTry += 1
      getTweets(username)
    else
      alertError()
      finishedGet()
        
alertError = ->
  alert "Looks like something went wrong, we'll compute what we have. Reload the page to try again."

finishedGet = ->
  setFinishedHTML()
  parseDates()
  createTimeline()
  clickFirstNav()
  
setFinishedHTML = ->
  clearPage()
  $('.row').append("<div class='span9'> </div><div class='span3'><div class='well sidebar-nav'></div></div>")
      
parseDates = ->
  $.each tweetdb, (index, tweet) -> 
    date = moment(tweet.created_at)
    tweet.month = date.format('MMMM')
    tweet.monthNo = date.month()
    tweet.year = date.year()
    if sortedTweets[tweet.year] and sortedTweets[tweet.year][tweet.month]
      sortedTweets[tweet.year][tweet.month].push(tweet)
    else if sortedTweets[tweet.year]
      sortedTweets[tweet.year][tweet.month] = []
      sortedTweets[tweet.year][tweet.month].push(tweet)
    else
      sortedTweets[tweet.year] = {}
      sortedTweets[tweet.year][tweet.month] = []
      sortedTweets[tweet.year][tweet.month].push(tweet)
      
createTimeline = ->
  years = ""
  $.each sortedTweets, (year, months) ->
    yearGroup = "<li class='nav-header'>#{year}</li>"
    $.each months, (month, tweets) ->
      yearGroup += "<li><a href='##{year}-#{month}'>#{month}</a></li>"
      tweetWell = "<div id='#{year}-#{month}' class='tweet-well'>"
      $.each tweets, (index, tweet) ->
        tweetWell += "<blockquote><p>#{tweet.text}</p></blockquote>"
      tweetWell += "</div>"
      $('.span9').append(tweetWell)
    years = yearGroup + years
  nav = "<ul class='nav nav-list'>" + years + "</ul>"
  $('.well.sidebar-nav').append(nav)
  
clickFirstNav = ->
  $('ul.nav > li > a:first').click()
  
setupNav = ->
  $('ul.nav > li > a').live 'click', ->
    $('ul.nav > li').removeClass('active')
    $(@).parent().addClass('active')
    $('.tweet-well').hide()
    href = $(@).attr('href')
    $(href).show()
    return false

window.tweetdb = tweetdb
