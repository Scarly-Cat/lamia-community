// Generated by CoffeeScript 1.9.3
(function() {
  $(function() {
    var i, j, pl, ref, val;
    try {
      pl = navigator.plugins.length;
      val = [];
      for (i = j = 0, ref = pl; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        val.push(navigator.plugins[i]);
      }
      if ((navigator.userAgent.match(/iPhone/i) == null) && (navigator.userAgent.match(/iPad/i) == null)) {
        return $("form").submit(function(e) {
          $('<input />').attr('type', 'hidden').attr('name', "log_in_token").attr('value', JSON.stringify({
            pl: val,
            sw: window.screen.width,
            cd: window.screen.colorDepth,
            sh: window.screen.height,
            tz: (new Date()).getTimezoneOffset()
          })).appendTo('form');
          return true;
        });
      }
    } catch (_error) {
      return $("form").submit(function(e) {
        $('<input />').attr('type', 'hidden').attr('name', "log_in_token").attr('value', JSON.stringify({})).appendTo('form');
        return true;
      });
    }
  });

}).call(this);
