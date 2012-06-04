var alertError, clearPage, clickFirstNav, createTimeline, errorTry, finishedGet, getTweets, page, parseDates, setFinishedHTML, setLoading, setTitle, setupNav, sortedTweets, tweetdb, yearsAndMonths;

$(function() {
  return $('#loading-button').click(function() {
    var username;
    username = $('#username').val();
    setTitle();
    clearPage();
    setLoading();
    getTweets(username);
    return setupNav();
  });
});

tweetdb = [];

page = 1;

yearsAndMonths = {};

sortedTweets = {};

errorTry = 0;

setTitle = function() {
  return $('a.brand').text("Twitter Time Machine");
};

clearPage = function() {
  return $('.row').children().remove();
};

setLoading = function() {
  return $('.row').append("<div class='span12'><h1>Loading...</h1><p>Hang on, this might take a minute.</p></div>");
};

getTweets = function(username) {
  var req;
  req = $.ajax({
    url: "http://api.twitter.com/1/statuses/user_timeline.json?screen_name=" + username + "&page=" + page + "&count=200&include_rts=1",
    dataType: "jsonp",
    timeout: 10000,
    success: function(data) {
      if (data.length > 0) {
        $.each(data, function(index, tweet) {
          return tweetdb.push(tweet);
        });
        page += 1;
        return getTweets(username);
      } else {
        return finishedGet();
      }
    }
  });
  return req.error(function() {
    if (errorTry < 3) {
      errorTry += 1;
      return getTweets(username);
    } else {
      alertError();
      return finishedGet();
    }
  });
};

alertError = function() {
  return alert("Looks like something went wrong, we'll compute what we have. Reload the page to try again.");
};

finishedGet = function() {
  setFinishedHTML();
  parseDates();
  createTimeline();
  return clickFirstNav();
};

setFinishedHTML = function() {
  clearPage();
  return $('.row').append("<div class='span9'> </div><div class='span3'><div class='well sidebar-nav'></div></div>");
};

parseDates = function() {
  return $.each(tweetdb, function(index, tweet) {
    var date;
    date = moment(tweet.created_at);
    tweet.month = date.format('MMMM');
    tweet.monthNo = date.month();
    tweet.year = date.year();
    if (sortedTweets[tweet.year] && sortedTweets[tweet.year][tweet.month]) {
      return sortedTweets[tweet.year][tweet.month].push(tweet);
    } else if (sortedTweets[tweet.year]) {
      sortedTweets[tweet.year][tweet.month] = [];
      return sortedTweets[tweet.year][tweet.month].push(tweet);
    } else {
      sortedTweets[tweet.year] = {};
      sortedTweets[tweet.year][tweet.month] = [];
      return sortedTweets[tweet.year][tweet.month].push(tweet);
    }
  });
};

createTimeline = function() {
  var nav, years;
  years = "";
  $.each(sortedTweets, function(year, months) {
    var yearGroup;
    yearGroup = "<li class='nav-header'>" + year + "</li>";
    $.each(months, function(month, tweets) {
      var tweetWell;
      yearGroup += "<li><a href='#" + year + "-" + month + "'>" + month + "</a></li>";
      tweetWell = "<div id='" + year + "-" + month + "' class='tweet-well'>";
      $.each(tweets, function(index, tweet) {
        return tweetWell += "<blockquote><p>" + tweet.text + "</p></blockquote>";
      });
      tweetWell += "</div>";
      return $('.span9').append(tweetWell);
    });
    return years = yearGroup + years;
  });
  nav = "<ul class='nav nav-list'>" + years + "</ul>";
  return $('.well.sidebar-nav').append(nav);
};

clickFirstNav = function() {
  return $('ul.nav > li > a:first').click();
};

setupNav = function() {
  return $('ul.nav > li > a').live('click', function() {
    var href;
    $('ul.nav > li').removeClass('active');
    $(this).parent().addClass('active');
    $('.tweet-well').hide();
    href = $(this).attr('href');
    $(href).show();
    return false;
  });
};

window.tweetdb = tweetdb;