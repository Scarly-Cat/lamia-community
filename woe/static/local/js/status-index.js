// Generated by CoffeeScript 1.12.6
(function() {
  $(function() {
    var $grid, _option, author, j, len, ref, select_options, statusHTML, statusHTMLTemplate;
    $grid = $('#status-container');
    window.grid = $grid;
    $grid.shuffle({
      itemSelector: '.status-index-panel',
      speed: 0
    });
    statusHTMLTemplate = "<div class=\"col-md-4 col-sm-6 status-index-panel\">\n  <div class=\"panel panel-default\">\n    <div class=\"panel-body\">\n      <div class=\"media-left\"><a href=\"{{profile_address}}\"><img src=\"{{user_avatar}}\" width=\"{{user_avatar_x}}px\" height=\"{{user_avatar_y}}px\" class=\"media-object avatar-mini\"></a>\n      </div>\n      <div class=\"media-body\"><a href=\"{{profile_address}}\" class=\"hover_user\">{{user_name}}</a>\n      {{#unless attached_to_user}}\n      <span>&nbsp;says:</span>\n      {{else}}\n      <span>&nbsp;says to <a href=\"{{attached_to_user_url}}\" class=\"hover_user\">{{attached_to_user}}</a>:</span>\n      {{/unless}}\n      <span class=\"discuss\"><a href=\"/status/{{_id}}\" class=\"status-reply-time float-right\">Discuss{{#if comment_count}} ({{comment_count}}){{/if}}</a></span><br><p><span class=\"status-message\">\n      {{{message}}}\n      </span></p><span class=\"status-reply-time\"><a href=\"/status/{{id}}\">{{created}}</a></span>\n      </div>\n    </div>\n  </div>\n</div>";
    statusHTML = Handlebars.compile(statusHTMLTemplate);
    if (window.authors.length > 0) {
      ref = window.authors;
      for (j = 0, len = ref.length; j < len; j++) {
        author = ref[j];
        _option = "<option value=\"" + author.id + "\" selected=\"selected\">" + author.text + "</option>";
        $(".by-who").append(_option);
        $(".by-who-two").append(_option);
      }
    }
    $(".search-for").val(window.search);
    $(".how-many").val(window.count);
    select_options = {
      ajax: {
        url: "/user-list-api",
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
    };
    $(".by-who").select2(select_options);
    $(".by-who-two").select2(select_options);
    $(".how-many").change(function(e) {
      return console.log($(this).val());
    });
    return $(".update-statuses").click(function(e) {
      var authors, how_many, search;
      e.preventDefault();
      how_many = $(this).parent().parent().find(".how-many").val();
      authors = $(this).parent().parent().find(".author").val();
      search = $(this).parent().parent().find(".search-for").val();
      return $.post("/status-updates", JSON.stringify({
        count: how_many,
        authors: authors,
        search: search
      }), function(data) {
        var i, items, k, len1, ref1, status;
        $('#msg-container').html("");
        $grid.shuffle("remove", $('.status-index-panel'));
        if (data.status_updates.length === 0) {
          return $('#msg-container').html("<p>No results...</p>");
        } else {
          items = [];
          ref1 = data.status_updates;
          for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
            status = ref1[i];
            if (i === 0) {
              items = $(statusHTML(status));
            } else {
              items = items.add(statusHTML(status));
            }
          }
          $('#status-container').append(items);
          return setTimeout(function() {
            $('#status-container').shuffle('appended', items);
            return $('#filtering-header')[0].scrollIntoView();
          }, 0);
        }
      });
    });
  });

}).call(this);
