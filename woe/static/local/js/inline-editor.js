// Generated by CoffeeScript 1.10.0
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    var InlineEditor;
    InlineEditor = (function() {
      function InlineEditor(element, url, cancel_button, edit_reason, height) {
        if (url == null) {
          url = "";
        }
        if (cancel_button == null) {
          cancel_button = false;
        }
        if (edit_reason == null) {
          edit_reason = false;
        }
        if (height == null) {
          height = 300;
        }
        this.toolbarHTML = bind(this.toolbarHTML, this);
        this.editordivHTML = bind(this.editordivHTML, this);
        this.submitButtonHTML = bind(this.submitButtonHTML, this);
        this.enableSaveButton = bind(this.enableSaveButton, this);
        this.disableSaveButton = bind(this.disableSaveButton, this);
        this.previewHTML = bind(this.previewHTML, this);
        this.dropzoneHTML = bind(this.dropzoneHTML, this);
        this.editReasonHTML = bind(this.editReasonHTML, this);
        this.setupEditor = bind(this.setupEditor, this);
        this.createAndShowMentionModal = bind(this.createAndShowMentionModal, this);
        this.createAndShowEmoticonModal = bind(this.createAndShowEmoticonModal, this);
        this.createAndShowImageLinkModal = bind(this.createAndShowImageLinkModal, this);
        Dropzone.autoDiscover = false;
        this.quillID = this.getQuillID();
        this.element = $(element);
        if (this.element.data("editor_is_active")) {
          return false;
        }
        this.element.data("editor_is_active", true);
        this.edit_reason = edit_reason;
        this.height = height + "px";
        if (url !== "") {
          $.get(url, (function(_this) {
            return function(data) {
              _this.element.data("editor_initial_html", data.content);
              return _this.setupEditor(cancel_button);
            };
          })(this));
        } else {
          this.element.data("editor_initial_html", this.element.html());
          this.setupEditor(cancel_button);
        }
      }

      InlineEditor.prototype.createAndShowImageLinkModal = function() {
        var _this, current_position, ref;
        this.quill.focus();
        current_position = (ref = this.quill.getSelection()) != null ? ref.start : void 0;
        if (current_position == null) {
          current_position = this.quill.getLength();
        }
        $("#image-link-modal-" + this.quillID).html("<div class=\"modal-dialog\">\n  <div class=\"modal-content\">\n    <div class=\"modal-header\">\n      <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n      <h4 class=\"modal-title\">Paste image URL</h4>\n    </div>\n    <div class=\"modal-body\">\n      <span id=\"image-link-instructions\">Use this to insert images into your post.</span>\n      <br><br>\n      <input id=\"image-link-select\" class=\"form-control\" style=\"max-width: 100%; width: 400px;\" multiple=\"multiple\">\n      <img id=\"image-link-load\" src=\"/static/loading.gif\" style=\"display: none;\">\n    </div>\n    <div class=\"modal-footer\">\n      <button type=\"button\" class=\"btn btn-primary\" id=\"image-link-modal-insert\">Insert</button>\n      <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Cancel</button>\n    </div>\n  </div>\n</div>");
        _this = this;
        $("#image-link-modal-insert").click(function(e) {
          e.preventDefault();
          $(".image-link-error").remove();
          $("#image-link-instructions").text("Processing your image...");
          $("#image-link-load").show();
          $("#image-link-modal-insert").addClass("disabled");
          $("#image-link-select").hide();
          return $.post("/upload-image", JSON.stringify({
            image: $("#image-link-select").val()
          }), function(data) {
            $("#image-link-instructions").text("Use this to insert images into your post.");
            $("#image-link-load").hide();
            $("#image-link-modal-insert").removeClass("disabled");
            $("#image-link-select").show();
            if (data.error) {
              if ($(".image-link-error").length === 0) {
                return $("#image-link-select").before("<div class=\"image-link-error alert alert-danger alert-dismissible fade in\" role=\"alert\" id=\"create-status-error\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">×</span></button>\n  " + data.error + "\n</div>");
              }
            } else {
              $("#image-link-modal-" + _this.quillID).modal("hide");
              return _this.quill.insertText(current_position, "[attachment=" + data.attachment + ":" + data.xsize + "]");
            }
          });
        });
        return $("#image-link-modal-" + this.quillID).modal("show");
      };

      InlineEditor.prototype.createAndShowEmoticonModal = function() {
        var _this, current_position, ref;
        this.quill.focus();
        current_position = (ref = this.quill.getSelection()) != null ? ref.start : void 0;
        if (current_position == null) {
          current_position = this.quill.getLength();
        }
        $("#emoticon-modal-" + this.quillID).html("          <div class=\"modal-dialog\">\n            <div class=\"modal-content\">\n              <div class=\"modal-header\">\n                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n                <h4 class=\"modal-title\">Pick an Emote! <img src=\"/static/emoticons/fluttershy_happy_by_angelishi.gif\"></h4>\n              </div>\n              <div class=\"modal-body\">\n                <img src=\"/static/emoticons/fluttershy_happy_by_angelishi.gif\" class=\"emoticon-listing\" data-emotecode=\":)\">\n                <img src=\"/static/emoticons/fluttershy_sad_by_angelishi.gif\" class=\"emoticon-listing\" data-emotecode=\":(\">\n                <img src=\"/static/emoticons/shocked_fluttershy_by_angelishi-d7xyd7j.gif\" class=\"emoticon-listing\" data-emotecode=\":horror:\">\n                <img src=\"/static/emoticons/embarrassed_fluttershy_by_angelishi-d7xyd7k.gif\" class=\"emoticon-listing\" data-emotecode=\":shy:\">\n             	<img src=\"/static/emoticons/applejack_confused_by_angelishi-d6wk2ew.gif\" class=\"emoticon-listing\" data-emotecode=\":wat:\">\n                <img src=\"/static/emoticons/nervous_aj_by_angelishi-d7ahd5y.gif\" class=\"emoticon-listing\" data-emotecode=\":S\">\n                <img src=\"/static/emoticons/liar_applejack_by_angelishi-d7aglwl.gif\" class=\"emoticon-listing\" data-emotecode=\":liarjack:\">\n                <img src=\"/static/emoticons/pinkie_laugh_by_angelishi-d6wk2ek.gif\" class=\"emoticon-listing\" data-emotecode=\":D\">\n                <img src=\"/static/emoticons/pinkie_mustache_by_angelishi-d6wk2eh.gif\" class=\"emoticon-listing\" data-emotecode=\":mustache:\">\n                <img src=\"/static/emoticons/pinkie_silly_by_angelishi-d6wk2ef.gif\" class=\"emoticon-listing\" data-emotecode=\":P\">\n                <img src=\"/static/emoticons/pinkamena_by_angelishi-d6wk2er.gif\" class=\"emoticon-listing\" data-emotecode=\":pinkamena:\">\n                <img src=\"/static/emoticons/rarity_happy_by_angelishi.gif\" class=\"emoticon-listing\" data-emotecode=\":pleased:\">\n                <img src=\"/static/emoticons/rarity_shock_2_by_angelishi-d6wk2eb.gif\" class=\"emoticon-listing\" data-emotecode=\":shocked:\">\n                <img src=\"/static/emoticons/singing_rarity_by_angelishi-d7agp33.gif\" class=\"emoticon-listing\" data-emotecode=\":sing:\">\n                <img src=\"/static/emoticons/twilight___twitch_by_angelishi.gif\" class=\"emoticon-listing\" data-emotecode=\":twitch:\">\n                <img src=\"/static/emoticons/twilight_think_by_angelishi.gif\" class=\"emoticon-listing\" data-emotecode=\":?\">\n                <img src=\"/static/emoticons/twilight_wink_by_angelishi.gif\" class=\"emoticon-listing\" data-emotecode=\";)\">\n                <img src=\"/static/emoticons/rd_yawn_by_angelishi-d9cwc1o.gif\" class=\"emoticon-listing\" data-emotecode=\":yawn:\">\n                <img src=\"/static/emoticons/rainbowdash_cool_by_angelishi.gif\" class=\"emoticon-listing\" data-emotecode=\":cool:\">\n                <img src=\"/static/emoticons/rd_laugh_by_angelishi-d7aharw.gif\" class=\"emoticon-listing\" data-emotecode=\":rofl:\">\n                <img src=\"/static/emoticons/scootaloo_want_face_by_angelishi-d7xyd7g.gif\" class=\"emoticon-listing\" data-emotecode=\":want:\">\n                <img src=\"/static/emoticons/derpy_by_angelishi-d7amv0j.gif\" class=\"emoticon-listing\" data-emotecode=\":derp:\">\n                <img src=\"/static/emoticons/head_wobble_by_angelishi-d9cwc16.gif\" class=\"emoticon-listing\" data-emotecode=\":jester:\">\n                <img src=\"/static/emoticons/love_spike_by_angelishi-d7amv0g.gif\" class=\"emoticon-listing\" data-emotecode=\":love:\">\n<br>\n                <img src=\"/static/emoticons/celestia_noapproval_by_angelishi-d9cwc1c.png\" class=\"emoticon-listing\" data-emotecode=\":unamused:\">\n                <img src=\"/static/emoticons/celestia_playful_by_angelishi-d9cwc1g.gif\" class=\"emoticon-listing\" data-emotecode=\":playful:\">\n                <img src=\"/static/emoticons/luna_please_by_angelishi-d9cwc1l.gif\" class=\"emoticon-listing\" data-emotecode=\":plz:\">\n                <img src=\"/static/emoticons/discord_troll_laugh_by_angelishi-d7xyd7m.gif\" class=\"emoticon-listing\" data-emotecode=\":troll:\">\n                <img src=\"/static/emoticons/sun_happy_by_angelishi-d6wlo5g.gif\" class=\"emoticon-listing\" data-emotecode=\":sunjoy:\">\n                <img src=\"/static/emoticons/moon_by_angelishi-d7amv0a.gif\" class=\"emoticon-listing\" data-emotecode=\":moonjoy:\">\n	        <img src=\"/static/emoticons/brohoof_by_angelishi-d6wk2et.gif\" class=\"emoticon-listing\" data-emotecode=\":hoofbump:\">              </div>\n              <div class=\"modal-footer\">\n                <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Cancel</button>\n              </div>\n            </div>\n          </div>");
        _this = this;
        $(".emoticon-listing").click(function(e) {
          var emoticon_code;
          e.preventDefault();
          emoticon_code = $(this).data("emotecode");
          _this.quill.insertText(current_position, emoticon_code);
          return $("#emoticon-modal-" + _this.quillID).modal("hide");
        });
        return $("#emoticon-modal-" + this.quillID).modal("show");
      };

      InlineEditor.prototype.createAndShowMentionModal = function() {
        $("#mention-modal-" + this.quillID).html("<div class=\"modal-dialog\">\n  <div class=\"modal-content\">\n    <div class=\"modal-header\">\n      <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n      <h4 class=\"modal-title\">Mention Lookup</h4>\n    </div>\n    <div class=\"modal-body\">\n      Use this to insert mentions into your post.\n      <br><br>\n      <select id=\"member-select\" class=\"form-control\" style=\"max-width: 100%; width: 400px;\" multiple=\"multiple\">\n      </select>\n    </div>\n    <div class=\"modal-footer\">\n      <button type=\"button\" class=\"btn btn-primary\" id=\"mention-modal-insert\">Insert</button>\n      <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Cancel</button>\n    </div>\n  </div>\n</div>");
        $("#member-select").select2({
          ajax: {
            url: "/user-list-api-variant",
            dataType: 'json',
            delay: 250,
            data: function(params) {
              return {
                q: params.term
              };
            },
            processResults: function(data, page) {
              console.log({
                results: data.results
              });
              return {
                results: data.results
              };
            },
            cache: true
          },
          minimumInputLength: 2
        });
        $("#mention-modal-insert").click((function(_this) {
          return function(e) {
            var __text, i, j, len, ref, val;
            e.preventDefault();
            __text = "";
            ref = $("#member-select").val();
            for (i = j = 0, len = ref.length; j < len; i = ++j) {
              val = ref[i];
              __text = __text + ("[@" + val + "]");
              if (i !== $("#member-select").val().length - 1) {
                __text = __text + ", ";
              }
            }
            _this.quill.insertText(_this.quill.getLength(), __text);
            return $("#mention-modal-" + _this.quillID).modal("hide");
          };
        })(this));
        return $("#mention-modal-" + this.quillID).modal("show");
      };

      InlineEditor.prototype.setupEditor = function(cancel_button) {
        var quill;
        if (cancel_button == null) {
          cancel_button = false;
        }
        this.element.html(this.editordivHTML());
        if (this.edit_reason) {
          this.element.before(this.editReasonHTML);
        }
        this.element.before("<div id=\"mention-modal-" + this.quillID + "\" class=\"modal fade\"></div>");
        this.element.before("<div id=\"emoticon-modal-" + this.quillID + "\" class=\"modal fade\"></div>");
        this.element.before("<div id=\"image-link-modal-" + this.quillID + "\" class=\"modal fade\"></div>");
        this.element.before(this.toolbarHTML);
        $("#toolbar-" + this.quillID).find(".ql-mention").click((function(_this) {
          return function(e) {
            return _this.createAndShowMentionModal();
          };
        })(this));
        $("#toolbar-" + this.quillID).find(".ql-emoticons").click((function(_this) {
          return function(e) {
            return _this.createAndShowEmoticonModal();
          };
        })(this));
        $("#toolbar-" + this.quillID).find(".ql-image-link").click((function(_this) {
          return function(e) {
            return _this.createAndShowImageLinkModal();
          };
        })(this));
        this.element.after(this.dropzoneHTML);
        this.element.after(this.previewHTML);
        this.element.after(this.submitButtonHTML(cancel_button));
        quill = new Quill("#post-editor-" + this.quillID, {
          modules: {
            'link-tooltip': true,
            'toolbar': {
              container: "#toolbar-" + this.quillID
            }
          },
          theme: 'snow'
        });
        quill.setHTML(this.element.data("editor_initial_html"));
        this.quill = quill;
        this.element.data("_editor", this);
        this.element.data("editor", quill);
        $("#toolbar").on('click mousedown mousemove', function(e) {
          return e.preventDefault();
        });
        $("#dropzone-" + this.quillID).dropzone({
          url: "/attach",
          dictDefaultMessage: "Click here or drop a file in to upload (image files only).",
          acceptedFiles: "image/jpeg,image/jpg,image/png,image/gif",
          maxFilesize: 30,
          init: function() {
            return this.on("success", function(file, response) {
              var last_character;
              last_character = quill.getLength();
              return quill.insertText(last_character, "\n[attachment=" + response.attachment + ":" + response.xsize + "]");
            });
          }
        });
        $("#upload-files-" + this.quillID).click((function(_this) {
          return function(e) {
            e.preventDefault();
            if ($("#dropzone-" + _this.quillID).is(":visible")) {
              return $("#dropzone-" + _this.quillID).hide();
            } else {
              return $("#dropzone-" + _this.quillID).show();
            }
          };
        })(this));
        $("#save-text-" + this.quillID).click((function(_this) {
          return function(e) {
            e.preventDefault();
            if (_this.saveFunction != null) {
              if (_this.edit_reason) {
                return _this.saveFunction(_this.element.data("editor").getHTML(), _this.element.data("editor").getText(), $("#edit-reason-" + _this.quillID).val());
              } else {
                return _this.saveFunction(_this.element.data("editor").getHTML(), _this.element.data("editor").getText());
              }
            }
          };
        })(this));
        $("#cancel-edit-" + this.quillID).click((function(_this) {
          return function(e) {
            e.preventDefault();
            if (_this.cancelFunction != null) {
              return _this.cancelFunction(_this.element.data("editor").getHTML(), _this.element.data("editor").getText());
            }
          };
        })(this));
        $("#preview-" + this.quillID).click((function(_this) {
          return function(e) {
            e.preventDefault();
            $("#preview-box-" + _this.quillID).parent().show();
            return $.post("/preview", JSON.stringify({
              text: _this.element.data("editor").getHTML()
            }), function(response) {
              return $("#preview-box-" + _this.quillID).html(response.preview);
            });
          };
        })(this));
        if (this.readyFunction != null) {
          return this.readyFunction();
        }
      };

      InlineEditor.prototype.getQuillID = function() {
        return Quill.editors.length + 1;
      };

      InlineEditor.prototype.setElementHtml = function(set_html) {
        return this.element.data("given_editor_initial_html", set_html);
      };

      InlineEditor.prototype.resetElementHtml = function() {
        if (this.element.data("given_editor_initial_html") != null) {
          return this.element.html(this.element.data("given_editor_initial_html"));
        } else {
          return this.element.html(this.element.data("editor_initial_html"));
        }
      };

      InlineEditor.prototype.onSave = function(saveFunction) {
        return this.saveFunction = saveFunction;
      };

      InlineEditor.prototype.onReady = function(readyFunction) {
        return this.readyFunction = readyFunction;
      };

      InlineEditor.prototype.onCancel = function(cancelFunction) {
        return this.cancelFunction = cancelFunction;
      };

      InlineEditor.prototype.onFullPage = function(fullPageFunction) {
        return this.fullPageFunction = fullPageFunction;
      };

      InlineEditor.prototype.noSaveButton = function() {
        return $("#save-text-" + this.quillID).remove();
      };

      InlineEditor.prototype.flashError = function(message) {
        this.element.parent().children(".alert").remove();
        return this.element.parent().prepend("<div class=\"alert alert-danger alert-dismissible fade in\" role=\"alert\">\n  <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">×</span></button>\n  " + message + "\n</div>");
      };

      InlineEditor.prototype.clearEditor = function() {
        this.element.data("editor").setText("");
        return Dropzone.forElement("#dropzone-" + this.quillID).removeAllFiles();
      };

      InlineEditor.prototype.destroyEditor = function() {
        this.element.data("editor_is_active", false);
        this.element.parent().children(".alert").remove();
        $("#inline-editor-buttons-" + this.quillID).remove();
        $("#toolbar-" + this.quillID).remove();
        $("#post-editor-" + this.quillID).remove();
        Dropzone.forElement("#dropzone-" + this.quillID).destroy();
        $("#dropzone-" + this.quillID).remove();
        $("#emoticon-modal-" + this.quillID).remove();
        $("#mention-modal-" + this.quillID).remove();
        return $("#edit-reason-" + this.quillID).parent().parent().remove();
      };

      InlineEditor.prototype.editReasonHTML = function() {
        return "<div class=\"form-inline\">\n  <div class=\"form-group\">\n    <label>Edit Reason: </label>\n    <input class=\"form-control\" id=\"edit-reason-" + this.quillID + "\" type=\"text\" initial=\"\"></input>\n  </div>\n</form>\n<br><br>";
      };

      InlineEditor.prototype.dropzoneHTML = function() {
        return "<div id=\"dropzone-" + this.quillID + "\" class=\"dropzone\" style=\"display: none;\"></div>";
      };

      InlineEditor.prototype.previewHTML = function() {
        return "<div class=\"panel panel-default\" style=\"display: none;\">\n  <div class=\"panel-heading\">Post Preview (Click Preview Button to Update)</div>\n  <div id=\"preview-box-" + this.quillID + "\" class=\"panel-body\"></div>\n</div>";
      };

      InlineEditor.prototype.disableSaveButton = function() {
        $("#save-text-" + this.quillID).addClass("disabled");
        $("#upload-files-" + this.quillID).addClass("disabled");
        return $("#cancel-edit-" + this.quillID).addClass("disabled");
      };

      InlineEditor.prototype.enableSaveButton = function() {
        $("#save-text-" + this.quillID).removeClass("disabled");
        $("#upload-files-" + this.quillID).removeClass("disabled");
        return $("#cancel-edit-" + this.quillID).removeClass("disabled");
      };

      InlineEditor.prototype.submitButtonHTML = function(cancel_button) {
        if (cancel_button == null) {
          cancel_button = false;
        }
        if (cancel_button === true) {
          return "<div id=\"inline-editor-buttons-" + this.quillID + "\" class=\"inline-editor-buttons\">\n  <button type=\"button\" class=\"btn btn-default post-post\" id=\"save-text-" + this.quillID + "\">Save</button>\n  <button type=\"button\" class=\"btn btn-default post-post\" id=\"upload-files-" + this.quillID + "\">Upload Files</button>\n  <button type=\"button\" class=\"btn btn-default\" id=\"cancel-edit-" + this.quillID + "\">Cancel</button>\n  <button type=\"button\" class=\"btn btn-default\" id=\"preview-" + this.quillID + "\">Preview</button>\n</div>";
        } else {
          return "<div id=\"inline-editor-buttons-" + this.quillID + "\" class=\"inline-editor-buttons\">\n  <button type=\"button\" class=\"btn btn-default post-post\" id=\"save-text-" + this.quillID + "\">Save</button>\n  <button type=\"button\" class=\"btn btn-default post-post\" id=\"upload-files-" + this.quillID + "\">Upload Files</button>\n  <button type=\"button\" class=\"btn btn-default\" id=\"preview-" + this.quillID + "\">Preview</button>\n</div>";
        }
      };

      InlineEditor.prototype.editordivHTML = function() {
        return "<div id=\"post-editor-" + this.quillID + "\" class=\"editor-box\" style=\"height: " + this.height + ";\" data-placeholder=\"\"></div>";
      };

      InlineEditor.prototype.toolbarHTML = function() {
        return "<div id=\"toolbar-" + this.quillID + "\" class=\"toolbar\">\n  <span class=\"ql-format-group\">\n    <select title=\"Font\" class=\"ql-font\">\n      <option value=\"pt_sansregular\" selected>Regular</option>\n      <option value=\"pt_sanscaption\">Caption</option>\n      <option value=\"caviar_dreams\">Caviar</option>\n      <option value=\"comic_reliefregular\">Comic</option>\n      <option value=\"droid_sans_monoregular\">Monotype</option>\n      <option value=\"monterrey\">Monterrey</option>\n      <option value=\"opensans\">Open Sans</option>\n    </select>\n    <select title=\"Size\" class=\"ql-size\">\n      <option value=\"8px\">Micro</option>\n      <option value=\"10px\">Small</option>\n      <option value=\"14px\" selected>Normal</option>\n      <option value=\"18px\">Large</option>\n      <option value=\"24px\">Larger</option>\n      <option value=\"32px\">Huge</option>\n    </select>\n  </span>\n  <span class=\"ql-format-group\">\n    <span title=\"Bold\" class=\"ql-format-button ql-bold\"></span>\n    <span class=\"ql-format-separator\"></span>\n    <span title=\"Italic\" class=\"ql-format-button ql-italic\"></span>\n    <span class=\"ql-format-separator\"></span>\n    <span title=\"Underline\" class=\"ql-format-button ql-underline\"></span>\n    <span class=\"ql-format-separator\"></span>\n    <span title=\"Strikethrough\" class=\"ql-format-button ql-strike\"></span>\n  </span>\n  <span class=\"ql-format-group\">\n    <select title=\"Text Color\" class=\"ql-color\">\n      <option value=\"rgb(0, 0, 0)\" label=\"rgb(0, 0, 0)\" selected></option>\n      <option value=\"rgb(230, 0, 0)\" label=\"rgb(230, 0, 0)\"></option>\n      <option value=\"rgb(255, 153, 0)\" label=\"rgb(255, 153, 0)\"></option>\n      <option value=\"rgb(255, 255, 0)\" label=\"rgb(255, 255, 0)\"></option>\n      <option value=\"rgb(0, 138, 0)\" label=\"rgb(0, 138, 0)\"></option>\n      <option value=\"rgb(0, 102, 204)\" label=\"rgb(0, 102, 204)\"></option>\n      <option value=\"rgb(153, 51, 255)\" label=\"rgb(153, 51, 255)\"></option>\n      <option value=\"rgb(255, 255, 255)\" label=\"rgb(255, 255, 255)\"></option>\n      <option value=\"rgb(250, 204, 204)\" label=\"rgb(250, 204, 204)\"></option>\n      <option value=\"rgb(255, 235, 204)\" label=\"rgb(255, 235, 204)\"></option>\n      <option value=\"rgb(255, 255, 204)\" label=\"rgb(255, 255, 204)\"></option>\n      <option value=\"rgb(204, 232, 204)\" label=\"rgb(204, 232, 204)\"></option>\n      <option value=\"rgb(204, 224, 245)\" label=\"rgb(204, 224, 245)\"></option>\n      <option value=\"rgb(235, 214, 255)\" label=\"rgb(235, 214, 255)\"></option>\n      <option value=\"rgb(187, 187, 187)\" label=\"rgb(187, 187, 187)\"></option>\n      <option value=\"rgb(240, 102, 102)\" label=\"rgb(240, 102, 102)\"></option>\n      <option value=\"rgb(255, 194, 102)\" label=\"rgb(255, 194, 102)\"></option>\n      <option value=\"rgb(255, 255, 102)\" label=\"rgb(255, 255, 102)\"></option>\n      <option value=\"rgb(102, 185, 102)\" label=\"rgb(102, 185, 102)\"></option>\n      <option value=\"rgb(102, 163, 224)\" label=\"rgb(102, 163, 224)\"></option>\n      <option value=\"rgb(194, 133, 255)\" label=\"rgb(194, 133, 255)\"></option>\n      <option value=\"rgb(136, 136, 136)\" label=\"rgb(136, 136, 136)\"></option>\n      <option value=\"rgb(161, 0, 0)\" label=\"rgb(161, 0, 0)\"></option>\n      <option value=\"rgb(178, 107, 0)\" label=\"rgb(178, 107, 0)\"></option>\n      <option value=\"rgb(178, 178, 0)\" label=\"rgb(178, 178, 0)\"></option>\n      <option value=\"rgb(0, 97, 0)\" label=\"rgb(0, 97, 0)\"></option>\n      <option value=\"rgb(0, 71, 178)\" label=\"rgb(0, 71, 178)\"></option>\n      <option value=\"rgb(107, 36, 178)\" label=\"rgb(107, 36, 178)\"></option>\n      <option value=\"rgb(68, 68, 68)\" label=\"rgb(68, 68, 68)\"></option>\n      <option value=\"rgb(92, 0, 0)\" label=\"rgb(92, 0, 0)\"></option>\n      <option value=\"rgb(102, 61, 0)\" label=\"rgb(102, 61, 0)\"></option>\n      <option value=\"rgb(102, 102, 0)\" label=\"rgb(102, 102, 0)\"></option>\n      <option value=\"rgb(0, 55, 0)\" label=\"rgb(0, 55, 0)\"></option>\n      <option value=\"rgb(0, 41, 102)\" label=\"rgb(0, 41, 102)\"></option>\n      <option value=\"rgb(61, 20, 102)\" label=\"rgb(61, 20, 102)\"></option>\n    </select>\n  </span>\n  <span class=\"ql-format-group\">\n    <span title=\"List\" class=\"ql-format-button ql-list\"></span>\n    <span class=\"ql-format-separator\"></span>\n    <span title=\"Bullet\" class=\"ql-format-button ql-bullet\"></span>\n    <span class=\"ql-format-separator\"></span>\n    <select title=\"Text Alignment\" class=\"ql-align\">\n      <option value=\"left\" label=\"Left\" selected></option>\n      <option value=\"center\" label=\"Center\"></option>\n      <option value=\"right\" label=\"Right\"></option>\n      <option value=\"justify\" label=\"Justify\"></option>\n    </select>\n  </span>\n  <span class=\"ql-format-group\">\n    <span title=\"Link\" class=\"ql-format-button ql-link\"></span>\n    <span class=\"ql-format-separator\"></span>\n    <span title=\"Image\" class=\"ql-format-button ql-image-link ql-custom-button\"><span class=\"glyphicon glyphicon-picture\"></span></span>\n  </span>\n  <span class=\"ql-format-group\">\n    <span class=\"ql-mention ql-format-button ql-custom-button\">@</span>\n    <span class=\"ql-emoticons ql-format-button ql-custom-button\">&#9786;</span>\n  </span>\n</div>";
      };

      return InlineEditor;

    })();
    return window.InlineEditor = InlineEditor;
  });

}).call(this);
