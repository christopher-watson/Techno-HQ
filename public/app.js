// Grab the articles as a json
$.getJSON("/events", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    var eventDiv = $("<div>");
    var eventID = data[i]._id;
    eventDiv.append("<h3 class='event-title' data-id='" + data[i]._id + "'>" + data[i].title + "</h3>");
    if (data[i].img[0] === '/') {
      eventDiv.append('<img class="event-pic" src="https://www.residentadvisor.net' + data[i].img + '">');
    } else {
      eventDiv.append('<img class="event-pic" src="https://pbs.twimg.com/profile_images/876409189379297280/-zjcSD8t_200x200.jpg">');
    }
    eventDiv.append('<div class="notes" data-id="' + data[i]._id + '"><div>');
    eventDiv.addClass('inner-event');
    eventDiv.attr('id', eventID);
    $("#events").append(eventDiv);
  }
});


//  WORKING 
$(document).on("click", "h3", function () {
  // Empty the notes from the note section
  $(".notes").empty();
  // Save the id from the p tag
  var thisID = $(this).attr('data-id');

  // Now make an ajax call for the Article
  $.ajax({
      method: "GET",
      url: "/events/" + thisID
    })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      var noteDiv = $("<div>");
      noteDiv.addClass("note-div")
      noteDiv.attr('id', thisID);
      $(noteDiv).append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $(noteDiv).append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $(noteDiv).append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $(noteDiv).append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
      $(`[data-id=${thisID}]`).append(noteDiv);
  
        // If there's a note in the article
        if (data.note) {
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
    });
});


// When you click the savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
      method: "POST",
      url: "/events/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $(".notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

$(document).on("click", "#scrape-button", function(){
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
  .then(function (data) {
    // Log the response
    console.log(data);
    // Reload Page
    location.reload();
  });
});