// Generated by CoffeeScript 1.9.2
(function() {
  $(function() {
    var Status, makeInterval, s;
    Status = (function() {
      function Status() {
        this.id = $("#status").attr("data-id");
      }

      Status.prototype.addReply = function() {
        return $.post("/status/" + this.id + "/", {
          text: $("#status-reply")[0].value,
          reply: true
        }, (function(_this) {
          return function(response) {
            $("#status-reply")[0].value = "";
            return _this.refreshView();
          };
        })(this));
      };

      Status.prototype.replyTMPL = function(vars) {
        return "<div class=\"status-reply\" data-id=\"" + vars.pk + "\">  \n  <img src=\"https://dl.dropboxusercontent.com/u/9060700/Commisions/Avatars/Key%20Gear%20-%20avatar.png\" width=\"30px\">\n  <p><a href=\"#\">" + vars.author + "</a><span class=\"status-mod-controls\"></span>\n  <br>" + vars.text + "\n  <br><span class=\"status-reply-time\">" + vars.date + "</span></p>\n  <hr>\n</div>";
      };

      Status.prototype.refreshView = function() {
        return $.post("/status/" + this.id + "/", {}, (function(_this) {
          return function(response) {
            var comment, i, len, ref;
            $("#status-replies").html("");
            ref = response.replies;
            for (i = 0, len = ref.length; i < len; i++) {
              comment = ref[i];
              $("#status-replies").append(_this.replyTMPL(comment));
            }
            return $("#status-replies").scrollTop($('#status-replies')[0].scrollHeight);
          };
        })(this));
      };

      return Status;

    })();
    s = new Status;
    s.refreshView();
    makeInterval = function(time, func) {
      return setInterval(func, time);
    };
    makeInterval(3000, function() {
      return s.refreshView();
    });
    return $("#submit-reply").click(function(e) {
      e.preventDefault();
      return s.addReply();
    });
  });

}).call(this);
