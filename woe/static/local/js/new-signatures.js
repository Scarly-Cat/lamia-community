// Generated by CoffeeScript 1.12.6
(function() {
  $(function() {
    var blog_entry_editor;
    blog_entry_editor = new InlineEditor("#sig-html");
    blog_entry_editor.noSaveButton();
    window.onbeforeunload = function() {
      if (!window.save) {
        return "You haven't saved your changes.";
      }
    };
    return $("form").submit(function(e) {
      window.save = true;
      $("#signature").val(blog_entry_editor.quill.getHTML());
      return true;
    });
  });

}).call(this);
