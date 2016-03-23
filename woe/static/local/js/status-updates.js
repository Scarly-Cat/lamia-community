// Generated by CoffeeScript 1.10.0
(function() {
  $(function() {
    var Status;
    Status = (function() {
      function Status() {
        var status;
        this.id = $("#status").attr("data-id");
        this.max_length = 250;
        status = this;
        this.replyHTML = Handlebars.compile(this.replyHTMLTemplate());
        this.confirmModelHTML = Handlebars.compile(this.confirmModelHTMLTemplate());
        this.refreshView();
        $("#status-comment-count").html("<br><br>\n<div class=\"progress\" style=\"width: 79%;\">\n  <div class=\"progress-bar progress-bar-info\" id=\"status-character-count-bar\" role=\"progressbar\" style=\"width: 0%\">\n    <span id=\"status-character-count-text\"></span>\n  </div>\n</div>");
        this.progress_bar = $("#status-character-count-bar");
        this.progress_text = $("#status-character-count-text");
        this.socket = io.connect('http://' + document.domain + ':3000' + '');
        this.socket.on("connect", (function(_this) {
          return function() {
            return _this.socket.emit('join', "status--" + _this.id);
          };
        })(this));
        this.socket.on("console", function(data) {
          return console.log(data);
        });
        this.socket.on("event", function(data) {
          if (data.reply != null) {
            status.updateReplyCount(data.count);
            if (($("#status-replies").scrollTop() + $("#status-replies").innerHeight()) === $("#status-replies")[0].scrollHeight) {
              $("#status-replies").append(status.replyHTML(data.reply));
              return $("#status-replies").scrollTop($('#status-replies')[0].scrollHeight);
            } else {
              return $("#status-replies").append(status.replyHTML(data.reply));
            }
          }
        });
        $("#submit-reply").click(function(e) {
          e.preventDefault();
          return status.addReply();
        });
        $("#status-replies").delegate(".hide-reply", "click", function(e) {
          e.preventDefault();
          $("#confirm-hide-modal").modal('hide');
          $("#confirm-hide-modal").data("idx", $("#reply-" + $(this).attr("href")).data("idx"));
          $("#confirm-hide-modal").html(status.confirmModelHTML({}));
          return $("#confirm-hide-modal").modal('show');
        });
        $("#confirm-hide-modal").delegate("#confirm-hide", "click", (function(_this) {
          return function(e) {
            var reply_idx;
            e.preventDefault();
            $("#confirm-hide-modal").modal('hide');
            reply_idx = $("#confirm-hide-modal").data("idx");
            return $.post("/status/" + status.id + "/hide-reply/" + reply_idx, {}, function(data) {
              if (data.success != null) {
                return $("#reply-" + reply_idx).remove();
              }
            });
          };
        })(this));
        $("#status-reply").on("keyup", function(e) {
          return status.updateCount($("#status-reply").val().length);
        });
      }

      Status.prototype.addReply = function() {
        return $.post("/status/" + this.id + "/reply", JSON.stringify({
          reply: $("#status-reply").val()
        }), (function(_this) {
          return function(data) {
            if (data.error != null) {
              return _this.flashError(data.error);
            } else {
              $(".status-reply-form").children(".alert").remove();
              $("#status-reply").val("");
              _this.socket.emit("event", {
                room: "status--" + _this.id,
                reply: data.newest_reply,
                count: data.count
              });
              _this.updateReplyCount(data.count);
              _this.updateCount(0);
              $("#status-replies").append(_this.replyHTML(data.newest_reply));
              return $("#status-replies").scrollTop($('#status-replies')[0].scrollHeight);
            }
          };
        })(this));
      };

      Status.prototype.flashError = function(error) {
        $(".status-reply-form").children(".alert").remove();
        return $(".status-reply-form").prepend("<div class=\"alert alert-danger alert-dismissible fade in\" role=\"alert\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">×</span></button>\n  " + error + "\n</div>");
      };

      Status.prototype.updateReplyCount = function(c) {
        if (c > 99) {
          this.flashError("This status update is full.");
          $("#submit-reply").addClass("disabled");
        }
        return $("#status-status").text(c + " / 100 Replies");
      };

      Status.prototype.updateCount = function(c) {
        var n;
        n = parseInt(c);
        c = parseInt(n / this.max_length * 100);
        this.progress_bar.css("width", c + "%");
        return this.progress_text.text(n + " / 250");
      };

      Status.prototype.replyHTMLTemplate = function() {
        return "{{#unless hidden}}\n<div class=\"status-reply\" id=\"reply-{{idx}}\" data-idx=\"{{idx}}\">\n  <div class=\"media-left\">\n    <a href=\"/member/{{author_login_name}}\"><img src=\"{{user_avatar}}\" class=\"avatar-mini\" width=\"{{user_avatar_x}}px\" height=\"{{user_avatar_y}}px\"></a>\n  </div>\n  <div class=\"media-body\">\n    <p><a href=\"/member/{{author_login_name}}\" class=\"hover_user\">{{user_name}}</a><span class=\"status-mod-controls\">{{#if hide_enabled}}<a href=\"{{idx}}\" class=\"inherit_colors hide-reply\">(hide)</a>{{/if}}</span>\n    <p>{{{text}}}</p>\n    <span class=\"status-reply-time\">{{time}}</span></p>\n  </div>\n  <hr>\n</div>\n{{/unless}}";
      };

      Status.prototype.confirmModelHTMLTemplate = function() {
        return "<div class=\"modal-dialog\">\n  <div class=\"modal-content\">\n    <div class=\"modal-header\">\n      <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n      <h4 class=\"modal-title\">Hide Reply?</h4>\n    </div>\n    <div class=\"modal-body\">\n      Are you sure you want to hide this reply?\n    </div>\n    <div class=\"modal-footer\">\n      <button type=\"button\" class=\"btn btn-primary\" id=\"confirm-hide\">Hide</button>\n      <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Cancel</button>\n    </div>\n  </div><!-- /.modal-content -->\n</div><!-- /.modal-dialog -->";
      };

      Status.prototype.refreshView = function(scrolldown) {
        if (scrolldown == null) {
          scrolldown = false;
        }
        return $.get("/status/" + this.id + "/replies", {}, (function(_this) {
          return function(response) {
            var comment, i, len, ref;
            $("#status-replies").html("");
            _this.updateReplyCount(response.count);
            ref = response.replies;
            for (i = 0, len = ref.length; i < len; i++) {
              comment = ref[i];
              $("#status-replies").append(_this.replyHTML(comment));
            }
            if (scrolldown) {
              $("#status-replies").scrollTop($('#status-replies')[0].scrollHeight);
            }
            if ($("#status").data("locked") === "True") {
              _this.flashError("This status update is locked.");
              return $("#submit-reply").addClass("disabled");
            }
          };
        })(this));
      };

      return Status;

    })();
    return window.status_ = new Status();
  });

}).call(this);
