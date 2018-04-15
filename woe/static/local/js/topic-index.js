// Generated by CoffeeScript 1.12.6
(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $(function() {
    var Topic;
    Topic = (function() {
      function Topic(slug) {
        var getSelectionParentElement, getSelectionText, initialURL, popped, socket, topic;
        this.first_load = true;
        this.slug = slug;
        topic = this;
        this.page = window._initial_page;
        this.max_pages = 1;
        this.pagination = window._pagination;
        this.postHTML = Handlebars.compile(this.postHTMLTemplate());
        this.paginationHTML = Handlebars.compile(this.paginationHTMLTemplate());
        this.is_mod = window._is_topic_mod;
        if (this.is_mod === 0) {
          this.is_mod = false;
        } else {
          this.is_mod = true;
        }
        this.is_logged_in = window._is_logged_in;
        this.selected_character = "";
        this.selected_avatar = "";
        if ($(".io-class").data("path") !== "/") {
          socket = io.connect($(".io-class").data("config"), {
            path: $(".io-class").data("path") + "/socket.io"
          });
        } else {
          socket = io.connect($(".io-class").data("config"));
        }
        window.onbeforeunload = function() {
          if (topic.inline_editor.quill.getText().trim() !== "") {
            return "It looks like you were typing up a post.";
          }
        };
        socket.on("connect", (function(_this) {
          return function() {
            return socket.emit('join', "topic--" + _this.slug);
          };
        })(this));
        socket.on("console", function(data) {
          return console.log(data);
        });
        socket.on("event", function(data) {
          if (data.post != null) {
            if (topic.page === topic.max_pages) {
              data.post._is_topic_mod = topic.is_mod;
              data.post._is_logged_in = topic.is_logged_in;
              data.post.show_boop = true;
              if (data.post.author_login_name === window.woe_is_me) {
                data.post.can_boop = false;
              } else {
                data.post.can_boop = true;
              }
              data.post._show_character_badge = !window.roleplay_area;
              data.post.is_author = false;
              $("#post-container").append(topic.postHTML(data.post));
              window.addExtraHTML($("#post-" + data.post._id));
              if (topic.inline_editor != null) {
                if (topic.inline_editor.quill.getText().trim() !== "" && $("#new-post-box").find(".ql-editor").is(":focus")) {
                  return $("#new-post-box")[0].scrollIntoView();
                }
              }
            } else {
              topic.max_pages = Math.ceil(data.count / topic.pagination);
              return topic.page = topic.max_pages;
            }
          }
        });
        window.socket = socket;
        this.refreshPosts();
        if ((window._can_edit != null) && $("#new-post-box").length > 0) {
          this.inline_editor = new InlineEditor("#new-post-box", "", false);
          this.inline_editor.onSave(function(html, text) {
            topic.inline_editor.disableSaveButton();
            return $.post("/t/" + topic.slug + "/new-post", JSON.stringify({
              post: html,
              text: text,
              character: topic.selected_character,
              avatar: $("#avatar-picker-" + topic.inline_editor.quillID).val()
            }), (function(_this) {
              return function(data) {
                topic.inline_editor.enableSaveButton();
                if (data.closed_topic != null) {
                  topic.inline_editor.flashError("Topic Closed: " + data.closed_message);
                }
                if (data.no_content != null) {
                  topic.inline_editor.flashError("Your post has no text.");
                }
                if (data.error != null) {
                  topic.inline_editor.flashError(data.error);
                }
                if (data.success != null) {
                  topic.inline_editor.clearEditor();
                  socket.emit("event", {
                    room: "topic--" + topic.slug,
                    post: data.newest_post,
                    count: data.count
                  });
                  if (topic.page === topic.max_pages) {
                    data.newest_post.author_online = true;
                    data.newest_post.show_boop = true;
                    data.newest_post.can_boop = false;
                    data.newest_post._is_topic_mod = topic.is_mod;
                    data.newest_post._is_logged_in = topic.is_logged_in;
                    data.newest_post.author_login_name = window.woe_is_me;
                    data.newest_post._show_character_badge = !window.roleplay_area;
                    $("#post-container").append(topic.postHTML(data.newest_post));
                    return window.addExtraHTML($("#post-" + data.newest_post._id));
                  } else {
                    return window.location = "/t/" + topic.slug + "/page/1/post/latest_post";
                  }
                }
              };
            })(this));
          });
        }
        $("#post-container").delegate(".go-to-end-of-page", "click", function(e) {
          e.preventDefault();
          return $("#new-post-box")[0].scrollIntoView();
        });
        $("#post-container").delegate(".boop-button", "click", function(e) {
          var count, current_status, element, pk;
          e.preventDefault();
          element = $(this);
          current_status = element.data("status");
          count = parseInt(element.data("count"));
          pk = element.data("pk");
          return $.post("/boop-post", JSON.stringify({
            pk: pk
          }), function(data) {
            if (current_status === "notbooped") {
              element.children(".boop-text").text("Boop!");
              element.children(".badge").text("");
              element.data("status", "booped");
              return element.data("count", count + 1);
            } else {
              element.children(".boop-text").html("");
              element.data("status", "notbooped");
              element.children(".boop-text").text(" Boop");
              element.data("count", count - 1);
              element.children(".badge").text(element.data("count"));
              return element.children(".badge").css("background-color", "#555");
            }
          });
        });
        getSelectionParentElement = function() {
          var parentEl, sel;
          parentEl = null;
          sel = null;
          if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
              parentEl = sel.getRangeAt(0).commonAncestorContainer;
              if (parentEl.nodeType !== 1) {
                parentEl = parentEl.parentNode;
              }
            }
          } else if (sel === document.selection && sel.type !== "Control") {
            parentEl = sel.createRange().parentElement();
          }
          return parentEl;
        };
        getSelectionText = function() {
          var text;
          text = "";
          if (window.getSelection) {
            text = window.getSelection().toString();
          } else if (document.selection && document.selection.type !== "Control") {
            text = document.selection.createRange().text;
          }
          return text;
        };
        $("#post-container").delegate(".reply-button", "click", function(e) {
          var element, highlighted_text, my_content, post_object;
          e.preventDefault();
          try {
            post_object = $(getSelectionParentElement()).closest(".post-content")[0];
            if (post_object == null) {
              post_object = $(getSelectionParentElement()).find(".post-content")[0];
            }
          } catch (error) {
            post_object = null;
          }
          highlighted_text = getSelectionText().trim();
          element = $(this);
          my_content = "";
          return $.get("/t/" + topic.slug + "/edit-post/" + (element.data("pk")), function(data) {
            var current_position, x, y;
            if ((post_object != null) && post_object === $("#post-" + (element.data("pk")))[0]) {
              my_content = "[reply=" + (element.data("pk")) + ":post:" + data.author + "]\n" + highlighted_text + "\n[/reply]";
            } else {
              my_content = "[reply=" + (element.data("pk")) + ":post:" + data.author + "][/reply]\n\n";
            }
            x = window.scrollX;
            y = window.scrollY;
            try {
              topic.inline_editor.quill.focus();
            } catch (error) {
              current_position = 0;
            }
            window.scrollTo(x, y);
            if (current_position == null) {
              current_position = topic.inline_editor.quill.getSelection(true).index;
              if (current_position == null) {
                current_position = topic.inline_editor.quill.getLength();
              }
            }
            return topic.inline_editor.quill.insertText(current_position, my_content);
          });
        });
        $("#post-container").delegate(".toggle-show-roles-button", "click", function(e) {
          return $(this).parent().children(".roles-div").toggle();
        });
        $("#post-container").delegate(".mention-button", "click", function(e) {
          var current_position, element, x, y;
          e.preventDefault();
          element = $(this);
          x = window.scrollX;
          y = window.scrollY;
          try {
            topic.inline_editor.quill.focus();
          } catch (error) {
            current_position = 0;
          }
          window.scrollTo(x, y);
          if (current_position == null) {
            current_position = topic.inline_editor.quill.getSelection(true).index;
            if (current_position == null) {
              current_position = topic.inline_editor.quill.getLength();
            }
          }
          return topic.inline_editor.quill.insertText(current_position, "[@" + (element.data("author")) + "], ");
        });
        $("#post-container").delegate(".post-edit", "click", function(e) {
          var element, inline_editor, post_author, post_buttons, post_character, post_content;
          e.preventDefault();
          element = $(this);
          post_content = $("#post-" + element.data("pk"));
          post_buttons = $("#post-buttons-" + element.data("pk"));
          post_character = element.data("character");
          if (element.data("author") != null) {
            post_author = element.data("author");
          } else {
            post_author = window.woe_is_me;
          }
          post_buttons.hide();
          inline_editor = new InlineEditor("#post-" + element.data("pk"), "/t/" + topic.slug + "/edit-post/" + (element.data("pk")), true, true);
          inline_editor.onReady(function() {
            var avatarPickerHTML, avatarPickerTemplate, character, characterPickerHTML, characterPickerTemplate, j, len, quill_id, ref;
            if (topic.characters.length > 0 && window.woe_is_me === post_author) {
              quill_id = inline_editor.quillID;
              characterPickerTemplate = "<!-- <label style=\"margin-left: 10px;\">Character Picker: </label> -->\n<select id=\"character-picker-{{quill_id}}\" style=\"margin-left: 5px; width: 300px;\">\n  <option value=\"\" selected></option>\n  {{#each characters}}\n  <option value=\"{{slug}}\" data-image=\"{{default_avvie}}\" {{#if default}}selected{{/if}}>\n      {{name}}\n  </option>\n  {{/each}}\n</select>";
              characterPickerHTML = Handlebars.compile(characterPickerTemplate);
              avatarPickerTemplate = "<!-- <label style=\"margin-left: 10px;\">Character Picker: </label> -->\n<select id=\"avatar-picker-{{quill_id}}\" style=\"margin-left: 5px; width: 80px;\">\n  <option value=\"\" selected></option>\n  {{#each avatars}}\n  <option value=\"{{id}}\" data-count=\"{{@index}}\" data-image=\"{{url}}\" {{#if @first}}selected{{/if}}>\n  </option>\n  {{/each}}\n</select>";
              avatarPickerHTML = Handlebars.compile(avatarPickerTemplate);
              ref = topic.characters;
              for (j = 0, len = ref.length; j < len; j++) {
                character = ref[j];
                if (character.slug === post_character) {
                  character["default"] = true;
                }
              }
              $("#inline-editor-buttons-" + quill_id).append(characterPickerHTML({
                characters: topic.characters,
                quill_id: quill_id
              }));
              $("#character-picker-" + quill_id).select2({
                templateResult: function(result) {
                  var __element, image;
                  __element = $(result.element);
                  image = __element.data("image");
                  if (image != null) {
                    return "<div class=\"media-left\">\n  <img src=\"" + image + "\" style=\"max-width: 50px;\" />\n</div>\n<div class=\"media-body\">\n  " + (__element.text()) + "\n</div>";
                  } else {
                    return "Clear Character";
                  }
                },
                escapeMarkup: function(text) {
                  return text;
                }
              });
              return $("#character-picker-" + quill_id).on("select2:select", (function(_this) {
                return function(e) {
                  var k, len1, ref1, selected;
                  topic["selected_character_" + quill_id] = $("#character-picker-" + quill_id).val();
                  if ($("#avatar-picker-" + quill_id).length > 0) {
                    try {
                      $("#avatar-picker-" + quill_id).select2("destroy");
                      $("#avatar-picker-" + quill_id).remove();
                    } catch (error) {

                    }
                  }
                  selected = {};
                  ref1 = topic.characters;
                  for (k = 0, len1 = ref1.length; k < len1; k++) {
                    character = ref1[k];
                    if (character.slug === $("#character-picker-" + quill_id).val()) {
                      selected = character;
                      break;
                    }
                  }
                  if (selected.alternate_avvies.length > 0) {
                    $("#inline-editor-buttons-" + quill_id).append(avatarPickerHTML({
                      avatars: selected.alternate_avvies,
                      quill_id: quill_id
                    }));
                    $("#avatar-picker-" + quill_id).select2({
                      templateResult: function(result) {
                        var __element, image;
                        __element = $(result.element);
                        image = __element.data("image");
                        if (image != null) {
                          return "<img src=\"" + image + "\" style=\"max-width: 50px;\" />";
                        }
                      },
                      templateSelection: function(result) {
                        var __element, alt;
                        __element = $(result.element);
                        alt = __element.data("count") + 1;
                        return "" + alt;
                      },
                      escapeMarkup: function(text) {
                        return text;
                      }
                    });
                    return $("#avatar-picker-" + quill_id).on("select2:select", function(e) {
                      return topic["selected_avatar_" + quill_id] = $("#avatar-picker-" + quill_id).val();
                    });
                  }
                };
              })(this));
            }
          });
          inline_editor.onSave(function(html, text, edit_reason) {
            var avatar, character, quill_id;
            quill_id = inline_editor.quillID;
            character = $("#character-picker-" + quill_id).val();
            avatar = $("#avatar-picker-" + quill_id).val();
            return $.post("/t/" + topic.slug + "/edit-post", JSON.stringify({
              pk: element.data("pk"),
              post: html,
              text: text,
              edit_reason: edit_reason,
              character: character,
              avatar: avatar
            }), (function(_this) {
              return function(data) {
                if (data.error != null) {
                  inline_editor.flashError(data.error);
                }
                if (data.success != null) {
                  inline_editor.destroyEditor();
                  post_content.html(data.html);
                  window.addExtraHTML(post_content);
                  return post_buttons.show();
                }
              };
            })(this));
          });
          return inline_editor.onCancel(function(html, text) {
            inline_editor.destroyEditor();
            inline_editor.resetElementHtml();
            window.addExtraHTML($("#post-" + element.data("pk")));
            return post_buttons.show();
          });
        });
        $("nav.pagination-listing").delegate("#previous-page", "click", function(e) {
          var element;
          e.preventDefault();
          element = $(this);
          if (topic.page !== 1) {
            $(".change-page").parent().removeClass("active");
            topic.page--;
            return topic.refreshPosts();
          }
        });
        $("nav.pagination-listing").delegate("#next-page", "click", function(e) {
          var element;
          e.preventDefault();
          element = $(this);
          if (topic.page !== topic.max_pages) {
            $(".change-page").parent().removeClass("active");
            topic.page++;
            return topic.refreshPosts();
          }
        });
        $("nav.pagination-listing").delegate(".change-page", "click", function(e) {
          var element;
          e.preventDefault();
          element = $(this);
          topic.page = parseInt(element.text());
          return topic.refreshPosts();
        });
        $("nav.pagination-listing").delegate("#go-to-end", "click", function(e) {
          var element;
          e.preventDefault();
          element = $(this);
          topic.page = parseInt(topic.max_pages);
          return topic.refreshPosts();
        });
        $("nav.pagination-listing").delegate("#go-to-start", "click", function(e) {
          var element;
          e.preventDefault();
          element = $(this);
          topic.page = 1;
          return topic.refreshPosts();
        });
        popped = (indexOf.call(window.history, 'state') >= 0);
        initialURL = location.href;
        $(window).on("popstate", function(e) {
          var initialPop;
          initialPop = !popped && location.href === initialURL;
          popped = true;
          if (initialPop) {
            return;
          }
          return setTimeout(function() {
            return window.location = window.location;
          }, 200);
        });
        window.RegisterAttachmentContainer("#post-container");
        $.post("/user-characters-api", {}, (function(_this) {
          return function(data) {
            var avatarPickerHTML, avatarPickerTemplate, characterPickerHTML, characterPickerTemplate, quill_id;
            _this.characters = data.characters;
            if (_this.characters.length > 0) {
              try {
                quill_id = _this.inline_editor.quillID;
              } catch (error) {
                return false;
              }
              characterPickerTemplate = "<!-- <label style=\"margin-left: 10px;\">Character Picker: </label> -->\n<select id=\"character-picker-{{quill_id}}\" style=\"margin-left: 5px; width: 300px;\">\n  <option value=\"\" selected></option>\n  {{#each characters}}\n  <option value=\"{{slug}}\" data-image=\"{{default_avvie}}\">\n      {{name}}\n  </option>\n  {{/each}}\n</select>";
              characterPickerHTML = Handlebars.compile(characterPickerTemplate);
              avatarPickerTemplate = "<!-- <label style=\"margin-left: 10px;\">Character Picker: </label> -->\n<select id=\"avatar-picker-{{quill_id}}\" style=\"margin-left: 5px; width: 80px;\">\n  <option value=\"\" selected></option>\n  {{#each avatars}}\n  <option value=\"{{id}}\" data-count=\"{{@index}}\" data-image=\"{{url}}\" {{#if @first}}selected{{/if}}>\n  </option>\n  {{/each}}\n</select>";
              avatarPickerHTML = Handlebars.compile(avatarPickerTemplate);
              $("#upload-files-" + quill_id).after(characterPickerHTML({
                characters: _this.characters,
                quill_id: quill_id
              }));
              $("#character-picker-" + quill_id).select2({
                templateResult: function(result) {
                  var element, image;
                  element = $(result.element);
                  image = element.data("image");
                  if (image != null) {
                    return "<div class=\"media-left\">\n  <img src=\"" + image + "\" style=\"max-width: 50px;\" />\n</div>\n<div class=\"media-body\">\n  " + (element.text()) + "\n</div>";
                  } else {
                    return "Clear Character";
                  }
                },
                escapeMarkup: function(text) {
                  return text;
                }
              });
              return $("#character-picker-" + quill_id).on("select2:select", function(e) {
                var character, j, len, ref, selected;
                _this.selected_character = $("#character-picker-" + quill_id).val();
                if ($("#avatar-picker-" + quill_id).length > 0) {
                  try {
                    $("#avatar-picker-" + quill_id).select2("destroy");
                    $("#avatar-picker-" + quill_id).remove();
                  } catch (error) {

                  }
                }
                selected = {};
                ref = _this.characters;
                for (j = 0, len = ref.length; j < len; j++) {
                  character = ref[j];
                  if (character.slug === $("#character-picker-" + quill_id).val()) {
                    selected = character;
                    break;
                  }
                }
                if (selected.alternate_avvies.length > 0) {
                  $("#inline-editor-buttons-" + quill_id).append(avatarPickerHTML({
                    avatars: selected.alternate_avvies,
                    quill_id: quill_id
                  }));
                  return $("#avatar-picker-" + quill_id).select2({
                    templateResult: function(result) {
                      var element, image;
                      element = $(result.element);
                      image = element.data("image");
                      if (image != null) {
                        return "<img src=\"" + image + "\" style=\"max-width: 50px;\" />";
                      }
                    },
                    templateSelection: function(result) {
                      var alt, element;
                      element = $(result.element);
                      alt = element.data("count") + 1;
                      return "" + alt;
                    },
                    escapeMarkup: function(text) {
                      return text;
                    }
                  });
                }
              });
            }
          };
        })(this));
      }

      Topic.prototype.paginationHTMLTemplate = function() {
        return "<ul class=\"pagination\">\n  <li>\n    <a href=\"\" aria-label=\"Start\" id=\"go-to-start\">\n      <span aria-hidden=\"true\">Go to Start</span>\n    </a>\n  </li>\n  <li>\n    <a href=\"\" aria-label=\"Previous\" id=\"previous-page\">\n      <span aria-hidden=\"true\">&laquo;</span>\n    </a>\n  </li>\n  {{#each pages}}\n  <li><a href=\"\" class=\"change-page page-link-{{this}}\">{{this}}</a></li>\n  {{/each}}\n  <li>\n    <a href=\"\" aria-label=\"Next\" id=\"next-page\">\n      <span aria-hidden=\"true\">&raquo;</span>\n    </a>\n  </li>\n  <li>\n    <a href=\"\" aria-label=\"End\" id=\"go-to-end\">\n      <span aria-hidden=\"true\">Go to End</span>\n    </a>\n  </li>\n</ul>";
      };

      Topic.prototype.postHTMLTemplate = function() {
        var theme_tmpl;
        theme_tmpl = window.getClientThemeTemplate("topic-postHTMLTemplate");
        if (theme_tmpl) {
          return theme_tmpl;
        } else {
          return "<li class=\"list-group-item post-listing-info\">\n  <div class=\"row\">\n    <div class=\"col-xs-4 hidden-md hidden-lg\">\n      {{#unless character_avatar}}\n        <a href=\"/member/{{author_login_name}}\"><img src=\"{{user_avatar_60}}\" width=\"{{user_avatar_x_60}}\" height=\"{{user_avatar_y_60}}\" class=\"avatar-mini\"></a>\n      {{else}}\n        <a href={{#unless _show_character_badge}}\"/characters/{{character_slug}}\" target=\"_blank\"{{else}}\"/member/{{author_login_name}}\"{{/unless}}><img src=\"{{character_avatar_small}}\" style=\"max-width: 60px;\" class=\"avatar-mini\"></a>\n      {{/unless}}\n    </div>\n    <div class=\"col-md-3 col-xs-8\">\n      {{#if author_online}}\n      <b><span class=\"glyphicon glyphicon-ok-sign\" aria-hidden=\"true\"></span> <a class=\"hover_user\" href=\"/member/{{author_login_name}}\">{{#unless character_name}}{{author_name}}{{else}}{{character_name}}{{/unless}}</a></b>\n      {{else}}\n      <b><span class=\"glyphicon glyphicon-minus-sign\" aria-hidden=\"true\"></span> <a class=\"hover_user\" href=\"/member/{{author_login_name}}\" class=\"inherit_colors\">{{#unless character_name}}{{author_name}}{{else}}{{character_name}}{{/unless}}</a></b>\n      {{/if}}\n      <span class=\"hidden-md hidden-sm hidden-lg\">\n      {{#unless roles}}\n      {{#unless character_name}}\n        <span style=\"color:#F88379;\"><strong>Members</strong></span><br>\n      {{else}}\n        <span style=\"color:#B00E0E;\"><strong>Characters</strong></span><br>\n      {{/unless}}\n      {{else}}\n      {{#if roles}}\n      {{#each roles}}\n      {{#if @first}}\n      <strong>{{{this}}}</strong>\n      {{/if}}\n      {{/each}}\n      {{/if}}\n      {{/unless}}\n      </span>\n      {{#unless character_name}}\n        <span style=\"color:#F88379;\" class=\"hidden-xs\"><strong>Members</strong></span><br>\n      {{else}}\n        <span style=\"color:#B00E0E;\" class=\"hidden-xs\"><strong>Characters</strong></span><br>\n      {{/unless}}\n      <span class=\"hidden-md hidden-lg\"><span id=\"post-number-1\" class=\"post-number\" style=\"vertical-align: top;\"><a href=\"{{direct_url}}\" id=\"postlink-smallscreen-{{_id}}\">\#{{_id}}</a></span>\n      Posted {{created}}</span>\n    </div>\n    <div class=\"col-md-9 hidden-xs hidden-sm\">\n      <span id=\"post-number-1\" class=\"post-number\" style=\"vertical-align: top;\"><a href=\"{{direct_url}}\" id=\"postlink-{{_id}}\">\#{{_id}}</a></span>\n      Posted {{created}}\n    </div>\n  </div>\n</li>\n<li class=\"list-group-item post-listing-post\">\n  <div class=\"row\">\n    <div class=\"col-md-3\" style=\"text-align: center;\">\n      {{#unless character_avatar}}\n        <a href=\"/member/{{author_login_name}}\"><img src=\"{{user_avatar}}\" width=\"{{user_avatar_x}}\" height=\"{{user_avatar_y}}\" class=\"post-member-avatar hidden-xs hidden-sm\"></a>\n      {{else}}\n        <a href={{#unless _show_character_badge}}\"/characters/{{character_slug}}\" target=\"_blank\"{{else}}\"/member/{{author_login_name}}\"{{/unless}}><img src=\"{{character_avatar_large}}\" style=\"max-width: 200px;\" class=\"post-member-avatar hidden-xs hidden-sm\"></a>\n      {{/unless}}\n      <span class=\"hidden-xs hidden-sm\"><br><br>\n        {{#if character_motto}}\n        <div class=\"post-member-self-title\">{{character_motto}}</div>\n        {{else}}\n        <div class=\"post-member-self-title\">{{user_title}}</div>\n        {{/if}}\n        {{#if character_name}}\n        <a href=\"/characters/{{character_slug}}\" target=\"_blank\"><img src=\"/static/emoticons/button_character_by_angelishi-d6wlo5k.gif\"></a>\n        {{#if roles}}\n        <br>\n        {{/if}}\n        {{/if}}\n        {{#if roles}}\n        <center>\n        {{#each roles}}\n        <span class=\"site-role\">{{{this}}}</span><br>\n        {{/each}}\n        </center>\n        {{/if}}\n        <hr></span>\n      <div class=\"post-meta\">\n      </div>\n    </div>\n    <div class=\"col-md-9 post-right\">\n      <div class=\"post-content\" id=\"post-{{_id}}\">\n        {{{html}}}\n      </div>\n      <br>\n      <div class=\"row post-edit-likes-info\" id=\"post-buttons-{{_id}}\">\n          <div class=\"col-xs-8\">\n            {{#if _is_logged_in}}\n            <div class=\"btn-group\" role=\"group\" aria-label=\"...\">\n              <div class=\"btn-group\">\n                <button type=\"button\" class=\"btn btn-default mention-button\" data-author=\"{{author_login_name}}\">@</button>\n                <button type=\"button\" class=\"btn btn-default reply-button\" data-pk=\"{{_id}}\">Reply</button>\n                <button type=\"button\" class=\"btn btn-default report-button\" data-pk=\"{{_id}}\" data-type=\"post\"><span class=\"glyphicon glyphicon-exclamation-sign\"></span></button>\n                {{#if is_admin}}<a href=\"/admin/post/edit/?id={{_id}}\" target=\"_blank\"><button type=\"button\" class=\"btn btn-default\" data-type=\"post\"><span class=\"glyphicon glyphicon-cog\"></span></button></a>{{/if}}\n                <!-- <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n                  <span class=\"caret\"></span>\n                  <span class=\"sr-only\">Toggle Dropdown</span>\n                </button>\n                <ul class=\"dropdown-menu\" role=\"menu\">\n                  <li><a href=\"\">Quote</a></li>\n                  <li><a href=\"\">Multiquote</a></li>\n                </ul> -->\n              </div>\n            {{/if}}\n              {{#if _is_logged_in}}\n              <div class=\"btn-group\" style=\"\">\n                {{#if _is_topic_mod}}\n                <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n                  <span class=\"caret\"></span>\n                  <span class=\"sr-only\">Toggle Dropdown</span>\n                </button>\n                <ul class=\"dropdown-menu\" role=\"menu\">\n                  <li><a href=\"\" class=\"post-edit\" data-pk=\"{{_id}}\" {{#if character_name}}data-character=\"{{character_slug}}\" data-author=\"{{author_login_name}}\"{{/if}}>Edit Post</a></li>\n                  {{#if topic_leader}}\n                   <li><a href=\"{{topic_leader}}\">Edit Topic</a></li>\n                   {{#if is_admin}}\n                    <li>\n                      <a href=\"/admin/topic/edit/?id={{_tid}}\" target=\"_blank\">Topic Admin</a>\n                    </li>\n                  {{/if}}\n                  {{/if}}\n                  <li><a href=\"\">Hide</a></li>\n                  <li class=\"divider hidden-md hidden-sm hidden-lg\"></li>\n                  <li class=\"hidden-md hidden-sm hidden-lg\"><a class=\"go-to-end-of-page\" href=\"\">Go to End</a></li>\n                </ul>\n                {{else}}\n                  {{#if is_author}}\n                    <button type=\"button\" class=\"btn btn-default dropdown-toggle\" data-toggle=\"dropdown\" aria-expanded=\"false\">\n                      <span class=\"caret\"></span>\n                      <span class=\"sr-only\">Toggle Dropdown</span>\n                    </button>\n                    <ul class=\"dropdown-menu\" role=\"menu\">\n                      <li><a href=\"\" class=\"post-edit\" data-pk=\"{{_id}}\" {{#if character_name}}data-character=\"{{character_slug}}\" data-author=\"{{author_login_name}}\"{{/if}}>Edit Post</a></li>\n                      {{#if topic_leader}}\n                       <li><a href=\"{{topic_leader}}\">Edit Topic</a></li>\n                      {{/if}}\n                      <li class=\"divider hidden-md hidden-sm hidden-lg\"></li>\n                      <li class=\"hidden-md hidden-sm hidden-lg\"><a class=\"go-to-end-of-page\" href=\"\">Go to End</a></li>\n                    </ul>\n                  {{/if}}\n                {{/if}}\n              {{/if}}\n              </div>\n            </div>\n        </div>\n        <div class=\"col-xs-4 post-likes\">\n          {{#if show_boop}}\n          {{#if can_boop}}\n          {{#if has_booped}}\n          <button type=\"button\" class=\"btn btn-default boop-button\" data-pk=\"{{_id}}\" data-status=\"booped\" data-count=\"{{boop_count}}\"><span class=\"badge\" style=\"background-color: green;\">{{boop_count}}</span><span class=\"boop-text\"> Unboop</span></button>\n          {{else}}\n          <button type=\"button\" class=\"btn btn-default boop-button\" data-pk=\"{{_id}}\" data-status=\"notbooped\" data-count=\"{{boop_count}}\"><span class=\"badge\" style=\"background-color: #555;\">{{boop_count}}</span><span class=\"boop-text\">  Boop</span></button>\n          {{/if}}\n          {{else}}\n          {{#if one_boop}}\n          <span><span class=\"badge\">{{boop_count}}</span> boop</span>\n          {{else}}\n          <span><span class=\"badge\">{{boop_count}}</span> boops</span>\n          {{/if}}\n          {{/if}}\n          {{/if}}\n        </div>\n      </div>\n      {{#if modified_by}}\n      <br>\n      <div class=\"text-muted\"><i>edited by {{modified_by}}, {{modified}}</i></span>\n      {{/if}}\n      {{#if active_rolls}}\n      <br>\n      <span class=\"text-muted\">Active Rolls: </span>\n      <br>\n      {{#each active_rolls}}\n        <span class=\"badge dice-roll active-dice-roll\">{{2}} {{1}}={{3}} </span>&nbsp;\n      {{/each}}\n      {{/if}}\n      {{#if inactive_rolls}}\n      <br>\n      <span class=\"text-muted\">Deleted/Edited Rolls: </span>\n      <br>\n      {{#each inactive_rolls}}\n        <span class=\"badge dice-roll inactive-dice-roll\">{{2}} {{1}}={{3}} </span>&nbsp;\n      {{/each}}\n      {{/if}}\n      <hr>\n      <div class=\"post-signature\">\n        {{#if signature}}\n        {{#if is_admin}}\n        <a href=\"/admin/signature/edit/?id={{signature_id}}\" target=\"_blank\" class=\"float-right\"><span class=\"glyphicon glyphicon-cog\"></span></a>\n        {{/if}}\n        {{/if}}\n        {{#if signature}}\n        {{{signature}}}\n        {{/if}}\n      </div>\n    </div>";
        }
      };

      Topic.prototype.refreshPosts = function() {
        var new_post_html;
        new_post_html = "";
        return $.post("/t/" + this.slug + "/posts", JSON.stringify({
          page: this.page,
          pagination: this.pagination
        }), (function(_this) {
          return function(data) {
            var first_post, i, j, k, l, len, m, n, pages, pagination_html, post, ref, ref1, ref2, ref3, ref4, ref5, ref6, results, results1, results2, results3;
            if (!_this.first_load) {
              history.pushState({
                id: "topic-page-" + _this.page
              }, '', "/t/" + _this.slug + "/page/" + _this.page);
            } else {
              _this.first_load = false;
            }
            first_post = ((_this.page - 1) * _this.pagination) + 1;
            ref = data.posts;
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
              post = ref[i];
              post.count = first_post + i;
              post._is_topic_mod = _this.is_mod;
              post._is_logged_in = _this.is_logged_in;
              post._show_character_badge = !window.roleplay_area;
              if (_this.is_logged_in) {
                post.show_boop = true;
              }
              post.direct_url = "/t/" + _this.slug + "/page/" + _this.page + "/post/" + post._id;
              new_post_html = new_post_html + _this.postHTML(post);
            }
            pages = [];
            _this.max_pages = Math.ceil(data.count / _this.pagination);
            if (_this.max_pages > 5) {
              if (_this.page > 3 && _this.page < _this.max_pages - 5) {
                pages = (function() {
                  results = [];
                  for (var k = ref1 = _this.page - 2, ref2 = _this.page + 5; ref1 <= ref2 ? k <= ref2 : k >= ref2; ref1 <= ref2 ? k++ : k--){ results.push(k); }
                  return results;
                }).apply(this);
              } else if (_this.page > 3) {
                pages = (function() {
                  results1 = [];
                  for (var l = ref3 = _this.page - 2, ref4 = _this.max_pages; ref3 <= ref4 ? l <= ref4 : l >= ref4; ref3 <= ref4 ? l++ : l--){ results1.push(l); }
                  return results1;
                }).apply(this);
              } else if (_this.page <= 3) {
                pages = (function() {
                  results2 = [];
                  for (var m = 1, ref5 = _this.page + 5; 1 <= ref5 ? m <= ref5 : m >= ref5; 1 <= ref5 ? m++ : m--){ results2.push(m); }
                  return results2;
                }).apply(this);
              }
            } else {
              pages = (function() {
                results3 = [];
                for (var n = 1, ref6 = Math.ceil(data.count / _this.pagination); 1 <= ref6 ? n <= ref6 : n >= ref6; 1 <= ref6 ? n++ : n--){ results3.push(n); }
                return results3;
              }).apply(this);
            }
            pagination_html = _this.paginationHTML({
              pages: pages
            });
            $(".pagination-listing").html(pagination_html);
            $("#post-container").html(new_post_html);
            $(".page-link-" + _this.page).parent().addClass("active");
            if (window._initial_post !== "") {
              setTimeout(function() {
                $("#postlink-" + window._initial_post)[0].scrollIntoView();
                $("#postlink-smallscreen-" + window._initial_post)[0].scrollIntoView();
                return window._initial_post = "";
              }, 500);
            } else {
              setTimeout(function() {
                return $("#topic-breadcrumb")[0].scrollIntoView();
              }, 500);
            }
            return window.setupContent();
          };
        })(this));
      };

      return Topic;

    })();
    return window.topic = new Topic($("#post-container").data("slug"));
  });

}).call(this);
