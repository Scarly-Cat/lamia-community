// Generated by CoffeeScript 1.9.3
(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $(function() {
    var hoverTemplate, p_html, reportModalHTML, socket;
    window.RegisterAttachmentContainer = function(selector) {
      var gifModalHTML, imgModalHTML;
      imgModalHTML = function() {
        return "<div class=\"modal-dialog\">\n  <div class=\"modal-content\">\n    <div class=\"modal-header\">\n      <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n      <h4 class=\"modal-title\">Full Image?</h4>\n    </div>\n    <div class=\"modal-body\">\n      Would you like to view the full image? It is about <span id=\"img-click-modal-size\"></span>KB in size.\n    </div>\n    <div class=\"modal-footer\">\n      <button type=\"button\" class=\"btn btn-primary\" id=\"show-full-image\">Yes</button>\n      <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Cancel</button>\n    </div>\n  </div>\n</div>";
      };
      gifModalHTML = function() {
        return "<div class=\"modal-dialog\">\n  <div class=\"modal-content\">\n    <div class=\"modal-header\">\n      <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n      <h4 class=\"modal-title\">Play GIF?</h4>\n    </div>\n    <div class=\"modal-body\">\n      Would you like to play this gif image? It is about <span id=\"img-click-modal-size\"></span>KB in size.\n    </div>\n    <div class=\"modal-footer\">\n      <button type=\"button\" class=\"btn btn-primary\" id=\"show-full-image\">Play</button>\n      <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Cancel</button>\n    </div>\n  </div>\n</div>";
      };
      $(selector).delegate(".attachment-image", "click", function(e) {
        var element, extension, size, url;
        e.preventDefault();
        element = $(this);
        if (element.data("first_click") === "yes") {
          element.attr("original_src", element.attr("src"));
          element.data("first_click", "no");
        }
        element.attr("src", element.attr("original_src"));
        if (element.data("show_box") === "no") {
          return false;
        }
        url = element.data("url");
        extension = url.split(".")[url.split(".").length - 1];
        size = element.data("size");
        $("#img-click-modal").modal('hide');
        if (extension === "gif" && parseInt(size) > 1024) {
          $("#img-click-modal").html(gifModalHTML());
          $("#img-click-modal").data("biggif", true);
          $("#img-click-modal").data("original_element", element);
          $("#img-click-modal-size").html(element.data("size"));
          return $("#img-click-modal").modal('show');
        } else {
          $("#img-click-modal").html(imgModalHTML());
          $("#img-click-modal").data("full_url", element.data("url"));
          $("#img-click-modal-size").html(element.data("size"));
          $("#img-click-modal").data("original_element", element);
          $("#img-click-modal").modal('show');
          return $("#img-click-modal").data("biggif", false);
        }
      });
      return $("#img-click-modal").delegate("#show-full-image", "click", function(e) {
        var element;
        e.preventDefault();
        if (!$("#img-click-modal").data("biggif")) {
          window.open($("#img-click-modal").data("full_url"), "_blank");
          return $("#img-click-modal").modal('hide');
        } else {
          element = $("#img-click-modal").data("original_element");
          element.attr("src", element.attr("src").replace(".gif", ".animated.gif"));
          return $("#img-click-modal").modal('hide');
        }
      });
    };
    socket = io.connect('http://' + document.domain + ':3000' + '');
    socket.on("notify", function(data) {
      var _html, counter_element, notification_listing, notifications_listed, ref, window_title_count;
      if (ref = window.woe_is_me, indexOf.call(data.users, ref) >= 0) {
        counter_element = $(".notification-counter");
        counter_element.text(data.count);
        if (document.title.split(" - ").length === 1) {
          document.title = ("(" + data.count + ") - ") + document.title;
        } else {
          window_title_count = document.title.split(" - ")[0];
          document.title = document.title.replace(window_title_count, "(" + data.count + ")");
        }
        notification_listing = $("#notification-listing");
        notifications_listed = $("a.notification-link");
        if (notifications_listed.length > 14) {
          notifications_listed[notifications_listed.length - 1].remove();
        }
        _html = "<li><a href=\"" + data.url + "\" data-notification=\"" + data._id + "\" class=\"notification-link dropdown-notif-" + data._id + "-" + data.category + "\">" + data.text + "</a></li>";
        if (notifications_listed.length === 0) {
          return $("#notification-dropdown").append(_html);
        } else {
          if (notification_listing.find("dropdown-notif-" + data.id + "-" + data.category).length === 0) {
            return $(notifications_listed[0]).before(_html);
          }
        }
      }
    });
    $(".post-link").click(function(e) {
      e.preventDefault();
      return $.post($(this).attr("href"), function(data) {
        return window.location = data.url;
      });
    });
    $("#notification-dropdown").delegate(".notification-link", "click", function(e) {
      e.preventDefault();
      return $.post("/dashboard/ack_notification", JSON.stringify({
        notification: $(this).data("notification")
      }), (function(_this) {
        return function(data) {
          return window.location = $(_this).attr("href");
        };
      })(this));
    });
    window.setupContent = function() {
      return window.addExtraHTML("body");
    };
    window.addExtraHTML = function(selector) {
      var blockquote_attribution_html, blockquote_attribution_template;
      $(selector).find(".content-spoiler").before("<a class=\"btn btn-info btn-xs toggle-spoiler\">Toggle Spoiler</a>");
      $(selector).find(".toggle-spoiler").click(function(e) {
        var spoiler;
        spoiler = $(this).next(".content-spoiler");
        if (spoiler.is(":visible")) {
          return spoiler.hide();
        } else {
          return spoiler.show();
        }
      });
      blockquote_attribution_html = "<p>On {{#if link}}<a href=\"{{link}}\" target=\"_blank\">{{/if}}{{time}}{{#if link}}</a>{{/if}}, {{#if authorlink}}<a href=\"{{authorlink}}\" class=\"hover_user\" target=\"_blank\">{{/if}}{{author}}{{#if authorlink}}</a>{{/if}} said:</p>";
      blockquote_attribution_template = Handlebars.compile(blockquote_attribution_html);
      return $(selector).find("blockquote").each(function() {
        var element, time;
        element = $(this);
        time = moment.unix(element.data("time")).tz(window.my_tz).format("MMMM Do YYYY @ h:mm:ss a");
        element.find("blockquote").remove();
        element.html(element.html().replace(new RegExp("<p>&nbsp;</p>", "g"), ""));
        element.dotdotdot({
          height: 100
        });
        if (time !== "Invalid date") {
          return element.prepend(blockquote_attribution_template({
            link: element.data("link"),
            time: time,
            author: element.data("author"),
            authorlink: element.data("authorlink")
          }));
        }
      });
    };
    $("#new-status").click(function(e) {
      e.preventDefault();
      return $.post("/create-status", JSON.stringify({
        message: $("#status-new").val()
      }), function(data) {
        if (data.error != null) {
          $("#create-status-error").remove();
          return $("#status-new").parent().prepend("<div class=\"alert alert-danger alert-dismissible fade in\" role=\"alert\" id=\"create-status-error\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">×</span></button>\n  " + data.error + "\n</div>");
        } else {
          return window.location = data.url;
        }
      });
    });
    p_html = "<div class=\"media-left\">\n  <a href=\"/member/{{login_name}}\"><img src=\"{{avatar_image}}\" height=\"{{avatar_y}}\" width=\"{{avatar_x}}\"></a>\n</div>\n<div class=\"media-body\">\n  <table class=\"table\">\n    <tbody>\n    <tr>\n      <th>Group</th>\n      <td><span style=\"color:#F88379;\"><strong>Members</strong></span><br></td>\n    </tr>\n    <tr>\n      <th>Joined</th>\n      <td>{{joined}}</td>\n    </tr>\n    <tr>\n      <th>Login Name</th>\n      <td>{{login_name}}</td>\n    </tr>\n    <tr>\n      <th>Last Seen</th>\n      <td>{{last_seen}}</td>\n    </tr>\n    </tbody>\n  </table>\n</div>";
    hoverTemplate = Handlebars.compile(p_html);
    window.hover_cache = {};
    $(document).on("mouseover", ".hover_user", function(e) {
      var _html, checkAndClear, data, element, placement, user;
      e.preventDefault();
      element = $(this);
      user = element.attr("href").split("/").slice(-1)[0];
      placement = "bottom";
      if (element.data("hplacement") != null) {
        placement = element.data("hplacement");
      }
      if (window.hover_cache[user] != null) {
        data = window.hover_cache[user];
        _html = hoverTemplate(data);
        element.popover({
          html: true,
          container: 'body',
          title: data.name,
          content: _html,
          placement: placement
        });
        element.popover("show");
        checkAndClear = function(n) {
          if (n == null) {
            n = 100;
          }
          return setTimeout(function() {
            if ($(".popover:hover").length !== 0) {
              return checkAndClear();
            } else {
              return element.popover("hide");
            }
          }, n);
        };
        return checkAndClear(2000);
      } else {
        return $.post("/get-user-info-api", JSON.stringify({
          user: user
        }), function(data) {
          window.hover_cache[user] = data;
          _html = hoverTemplate(data);
          element.popover({
            html: true,
            content: _html,
            container: 'body',
            title: data.name,
            placement: placement
          });
          element.popover("show");
          checkAndClear = function(n) {
            if (n == null) {
              n = 100;
            }
            return setTimeout(function() {
              if ($(".popover:hover").length !== 0) {
                return checkAndClear();
              } else {
                return element.popover("hide");
              }
            }, n);
          };
          return checkAndClear(2000);
        });
      }
    });
    reportModalHTML = function() {
      return "<div class=\"modal-dialog\">\n  <div class=\"modal-content\">\n    <div class=\"modal-header\">\n      <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n      <h4 class=\"modal-title\">Report Content</h4>\n    </div>\n    <div class=\"modal-body\">\n      Ready to make a report? Supply a reason and click submit.\n      <br><br>\n      <input class=\"form-control report-reason\" style=\"width: 400px; max-width: 100%;\">\n    </div>\n    <div class=\"modal-footer\">\n      <button type=\"button\" class=\"btn btn-danger\" id=\"modal-submit-report\">Report</button>\n      <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Cancel</button>\n    </div>\n  </div>\n</div>";
    };
    $(document).on("click", ".report-button", function(e) {
      var element;
      element = $(this);
      $("#report-click-modal").html(reportModalHTML());
      $("#report-click-modal").data("pk", element.data("pk"));
      $("#report-click-modal").data("type", element.data("type"));
      $("#modal-submit-report").click(function(e) {
        var post_data;
        post_data = {
          pk: $("#report-click-modal").data("pk"),
          content_type: $("#report-click-modal").data("type"),
          reason: $(".report-reason").val()
        };
        return $.post("/make-report", JSON.stringify(post_data), function(data) {
          $("#report-click-modal").modal("hide");
          element.text("Report Submitted");
          element.addClass("btn-success");
          return element.addClass("disabled");
        });
      });
      return $("#report-click-modal").modal("show");
    });
  });

}).call(this);
