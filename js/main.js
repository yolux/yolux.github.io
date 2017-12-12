$(function() {
  $("#contactForm input,#contactForm textarea").jqBootstrapValidation({
    preventSubmit: true,
    submitError: function($form, event, errors) {
      // additional error messages or events
    },
    submitSuccess: function($form, event) {
      event.preventDefault(); // prevent default submit behaviour
      // get values from FORM
      var name = $("input#name").val();
      
      var firstName = name; // For Success/Failure Message
      // Check for white space in name for Success/Fail message
      if (firstName.indexOf(' ') >= 0) {
        firstName = name.split(' ').slice(0, -1).join(' ');
      }
      $this = $("#sendMessageButton");
      $this.prop("disabled", true); // Disable submit button until AJAX call is complete to prevent duplicate messages
      $.ajax({
        url: "././mail/contact_me.php",
        type: "POST",
        data: {
          name: name,
          phone: phone,
          email: email,
          message: message
        },
        cache: false,
        success: function() {
          // Success message
          $('#success').html("<div class='alert alert-success'>");
          $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
            .append("</button>");
          $('#success > .alert-success')
            .append("<strong>Your message has been sent. </strong>");
          $('#success > .alert-success')
            .append('</div>');
          //clear all fields
          $('#contactForm').trigger("reset");
        },
        error: function() {
          // Fail message
          $('#success').html("<div class='alert alert-danger'>");
          $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
            .append("</button>");
          $('#success > .alert-danger').append($("<strong>").text("Sorry " + firstName + ", it seems that my mail server is not responding. Please try again later!"));
          $('#success > .alert-danger').append('</div>');
          //clear all fields
          $('#contactForm').trigger("reset");
        },
        complete: function() {
          setTimeout(function() {
            $this.prop("disabled", false); // Re-enable submit button when AJAX call is complete
          }, 1000);
        }
      });
    },
    filter: function() {
      return $(this).is(":visible");
    },
  });

  $("a[data-toggle=\"tab\"]").click(function(e) {
    e.preventDefault();
    $(this).tab("show");
  });
});

/*When clicking on Full hide fail/success boxes */
$('#name').focus(function() {
  $('#success').html('');
});


(function($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 70)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Scroll to top button appear
  $(document).scroll(function() {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 80
  });

  // Collapse Navbar
  var navbarCollapse = function() {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-shrink");
    } else {
      $("#mainNav").removeClass("navbar-shrink");
    }
  };
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);

  // Floating label headings for the contact form
  $(function() {
    $("body").on("input propertychange", ".floating-label-form-group", function(e) {
      $(this).toggleClass("floating-label-form-group-with-value", !!$(e.target).val());
    }).on("focus", ".floating-label-form-group", function() {
      $(this).addClass("floating-label-form-group-with-focus");
    }).on("blur", ".floating-label-form-group", function() {
      $(this).removeClass("floating-label-form-group-with-focus");
    });
  });

})(jQuery); // End of use strict

getUrlParam = function(name) {
  var i, len, pair, vars, x;
  vars = decodeURIComponent(window.location.search).substring(1).split("&");
  for (i = 0, len = vars.length; i < len; i++) {
    x = vars[i];
    pair = x.split('=');
    if ((typeof pair !== "undefined") && (pair[0] === name)) {
      return pair[1];
    }
  }
  return void 0;
};

// handle the challenge database (random / submit status / ....)
Challenge = function() {
  var STATUS = {SKIP:'skip', SUCC:'succ', OPEN:'open'}
  var rawConfig = [];
  var rawDB = [];
  var userDB = [];
  var rawCursor = 0;
  var userSuccCount = 0;

  var padLeft = function (str, len) {
    str = '' + str;
    return str.length >= len ? str : new Array(len - str.length + 1).join("0") + str;
  }

  var copyMap = function (a, b) {
    for (var x in b) {
      a[x] = b[x];
    }
  }

  var shuffle = function (array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {

      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  var validAnswer = function (userans, ans, validEngine=0) {
    // validEngine
    // 0: exactly string match
    // 1: partial string match
    // 2: python interpreter
    if (validEngine == 1) {
      return (userans.replace(/ /g, "").replace(/\"/g, "'").indexOf(ans.replace(/ /g, "").replace(/\"/g, "'")) >= 0)
    } else {
      return (userans.replace(/\"/g, "'") == ans.replace(/\"/g, "'"))
    }
  };

  var submit = function (idx) {
    c = getByIdx(idx);
    userans = c.userans;
    ansList = c.ans;
    for(var i=0; i<ansList.length; i++ ) {
      if ( validAnswer(c.userans, ansList[i], c.validEngine) ) {

        // update status to succ
        c.status = STATUS.SUCC;
        userSuccCount = userSuccCount + 1;
        console.log(c.idx, c.status);

        // update accum succ count
        if (userSuccCount % 30 == 0) {
          c.trophymark = userSuccCount;
        }

        // show one more only if the last one submit
        if (userDB[userDB.length-1].idx == idx) {
          addOneMore();
        }
        return true;
      } 
    } 
    c.failcount = c.failcount + 1;
    console.log(c.idx, c.status, c.failcount);
    return false;
  };

  var getByIdx = function (idx) {
    return userDB[Number(idx)-1];
  };

  var addOneMore = function () {
    if ( (userDB.length == 0) || (rawCursor >= rawDB.length) ) {
      shuffle(rawDB);
      rawCursor = 0
    } 
    newidx = padLeft(userDB.length+1, 3);
    var tmp = {idx:newidx, userans:"", status:STATUS.OPEN, trophymark:0, failcount:0};
    copyMap(tmp, rawDB[rawCursor]);
    userDB.push(tmp);
    rawCursor = rawCursor + 1;
  };

  var skip = function (idx) {
    c = getByIdx(idx);
    c.status = STATUS.SKIP;
    addOneMore();
  };

  var getRenderObjects = function () {
    return userDB;
  };

  var getConfigObject = function () {
    return rawConfig;
  };

  var loadJson = function(raw) {
    try {
      // handle more error case
      rawConfig = raw.config;
      rawDB = raw.items;  
      addOneMore();
    } catch (e) {
      rawConfig = {};
      rawDB = [];
    }
  };

  var succCount = function() {
    return userSuccCount;
  };

  return {
    submit: submit,
    getByIdx: getByIdx,
    skip: skip,
    getRenderObjects: getRenderObjects,
    getConfigObject: getConfigObject,
    succCount: succCount,
    loadJson: loadJson,
  };
}();

// handle the top header info 
challengeInfo = new Vue({
  el: '#challengeinfo',
  data: {
    info: {title:'L O A D I N G   F I L E  . . .', desc:''},
  },
});

// handle the challenge submit / skip / etc ....
mychallenges = new Vue({
  el: '#mychallenges',
  data: {
    challenges: Challenge.getRenderObjects(),
    showans: (getUrlParam('showans') == 1),
  },
  methods: {
    onSubmit: function (idx) {
      if(this.showans) {
        console.log('debug:', JSON.stringify(Challenge.getByIdx(idx)));
      }
      if(!Challenge.submit(idx)){
        this.$root.$emit('bv::enable::popover', idx+'textarea');
        this.$root.$emit('bv::show::popover', idx+'textarea');
        var self = this;
        setTimeout(function () {
          self.$root.$emit('bv::hide::popover');  
          self.$root.$emit('bv::disable::popover');  
        }, 4000);
      }
    },
    onSkip: function (idx) {
      Challenge.skip(idx);
    },
    succCount: Challenge.succCount,
  }
});

(function() {
  // rawJSON should be create when import a json file in js/*.json
  Challenge.loadJson(rawJSON);
  // fore update the challengeInfo data to refresh UI 
  challengeInfo.info = Challenge.getConfigObject();
}());

