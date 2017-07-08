// Generated by CoffeeScript 1.12.6
(function() {
  $(function() {
    var blog_comment_editor;
    blog_comment_editor = new InlineEditor("#blog-comment");
    blog_comment_editor.noSaveButton();
    window.onbeforeunload = function() {
      if (!window.save) {
        return "You haven't saved your changes.";
      }
    };
    return $("form").submit(function(e) {
      window.save = true;
      $("#comment").val(blog_comment_editor.quill.getHTML());
      return true;
    });
  });

}).call(this);
