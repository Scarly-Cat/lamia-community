from woe import db
from woe import app
from woe import bcrypt
from woe.utilities import ipb_password_check
from wand.image import Image
from urllib import quote
import arrow, re, os
attachment_re = re.compile(r'\[attachment=(.+?):(\d+)\]')

class Fingerprint(db.DynamicDocument):
    user = db.ReferenceField("User", required=True)
    fingerprint = db.DictField(required=True)
    last_seen = db.DateTimeField()
    
    def compute_similarity_score(self, stranger):
        max_score = float(len(self.fingerprint))
        score = 0.0
        
        for key, value in self.fingerprint.iteritems():
            if stranger.get(key, False) == value:
                score += 1
                
        return score/max_score
        
    def get_factors(self):
        return float(len(self.fingerprint))

class IPAddress(db.DynamicDocument):
    user = db.ReferenceField("User", required=True)
    ip_address = db.StringField(required=True)
    last_seen = db.DateTimeField()
    
class Ban(db.DynamicDocument):
    user = db.ReferenceField("User", required=True)

class ModNote(db.DynamicEmbeddedDocument):
    date = db.DateTimeField(required=True)
    note = db.StringField(required=True)
    reference = db.GenericReferenceField()
    INCIDENT_LEVELS = (
        ("Other", "???"),
        ("Wat", "Something Weird"),
        ("Minor", "Just A Heads Up"),
        ("Major", "Will Need a Talking To"),
        ("Extreme", "Worthy of Being Banned")
    )
    incident_level = db.StringField(choices=INCIDENT_LEVELS, required=True)

class UserActivity(db.DynamicEmbeddedDocument):
    content = db.GenericReferenceField()
    category = db.StringField(required=True)
    created = db.DateTimeField(required=True)
    data = db.DictField()

class DisplayNameHistory(db.DynamicEmbeddedDocument):
    name = db.StringField(required=True)
    date = db.DateTimeField(required=True)

class ProfileField(db.DynamicEmbeddedDocument):
    field = db.StringField(required=True)
    value = db.StringField(required=True)

class User(db.DynamicDocument):
    data = db.DictField(default={})
    login_name = db.StringField(required=True, unique=True)
    display_name = db.StringField(required=True, unique=True)
    password_hash = db.StringField()
    email_address = db.EmailField(required=True)
    emails_muted = db.BooleanField(default=False)
    
    # Customizable display values
    
    title = db.StringField(default="")
    location = db.StringField(default="")
    about = db.StringField(default="")
    avatar_extension = db.StringField()
    
    # User group names!
    group_pre_html = db.StringField(default="")
    group_name = db.StringField(default="")
    group_post_html = db.StringField(default="")
    
    # avatar_sizes
    avatar_full_x = db.IntField()
    avatar_full_y = db.IntField()
    avatar_60_x = db.IntField()
    avatar_60_y = db.IntField()
    avatar_40_x = db.IntField()
    avatar_40_y = db.IntField()
    avatar_timestamp = db.StringField(default="")
    
    information_fields = db.ListField(db.EmbeddedDocumentField(ProfileField))
    social_fields = db.ListField(db.EmbeddedDocumentField(ProfileField))
    
    # Restoring account
    password_token = db.StringField()
    password_token_age = db.DateTimeField()
    
    # Background details
    topic_pagination = db.IntField(default=20)
    post_pagination = db.IntField(default=20)

    last_sent_notification_email = db.DateTimeField()
    auto_acknowledge_notifications_after = db.IntField()
    last_looked_at_notifications = db.DateTimeField()
    
    signatures = db.ListField(db.StringField())
    timezone = db.IntField(default=0) # Relative to UTC
    birth_d = db.IntField()
    birth_m = db.IntField()
    birth_y = db.IntField()
    hide_age = db.BooleanField(default=True)
    hide_birthday = db.BooleanField(default=True)
    hide_login = db.BooleanField(default=False)
    banned = db.BooleanField(default=False)
    validated = db.BooleanField(default=False)
    
    warning_points = db.IntField(default=0)
    
    display_name_history = db.ListField(db.EmbeddedDocumentField(DisplayNameHistory))
    mod_notes = db.ListField(db.EmbeddedDocumentField("ModNote"))
    
    ALLOWED_INFO_FIELDS = (
        'Gender',
        'Favorite color',
    )
    
    ALLOWED_SOCIAL_FIELDS = (
        'Website',
        'DeviantArt'
        'Skype',
        'Steam',
        'Tumblr'
    )
    
    # Blocks
    ignored_users = db.ListField(db.ReferenceField("User")) # Topics, Blogs, Statuses, PMs
    ignored_user_signatures = db.ListField(db.ReferenceField("User"))
    
    remain_anonymous = db.BooleanField(default=False)
    
    # NOTE MOD NOTES ARE AUTO SENT VIA BOTH
    notification_preferences = db.DictField()
    
    # Friends and social stuff
    friends = db.ListField(db.ReferenceField("User"))
    profile_feed = db.ListField(db.EmbeddedDocumentField(UserActivity))
    
    # Moderation options
    disable_posts = db.BooleanField(default=False)
    disable_status = db.BooleanField(default=False)
    disable_status_participation = db.BooleanField(default=False)
    disable_pm = db.BooleanField(default=False)
    disable_topics = db.BooleanField(default=False)
    hellban = db.BooleanField(default=False)
    ban_date = db.DateTimeField()
    
    # Statistics
    joined = db.DateTimeField(required=True)
    posts_count = db.IntField(default=0)
    topic_count = db.IntField(default=0)
    status_count = db.IntField(default=0)
    status_comment_count = db.IntField(default=0)
    last_seen = db.DateTimeField()
    last_at = db.StringField(default="Watching forum index.")
    last_at_url = db.StringField(default="/")
    smile_usage = db.DictField()
    post_frequency = db.DictField()
    
    # Migration related
    old_member_id = db.IntField(default=0)
    legacy_password = db.BooleanField(default=False)
    ipb_salt = db.StringField()
    ipb_hash = db.StringField()
    
    # Permissions
    is_admin = db.BooleanField(default=False)
    is_mod = db.BooleanField(default=False)
    
    meta = {
        'indexes': [
            'old_member_id',
            'display_name',
            'login_name',
            'email_address'
        ]
    }
    
    def __unicode__(self):
        return self.login_name
    
    def is_active(self):
        if self.banned:
            return False
        if not self.validated:
            return False
        return True
        
    def get_id(self):
        return self.login_name
        
    def is_authenticated(self):
        return True # Will only ever return True.
        
    def is_anonymous(self):
        return False # Will only ever return False. Anonymous = guest user. We don't support those.
    
    def set_password(self, password, rounds=12):
        self.password_hash = bcrypt.generate_password_hash(password.strip(),rounds)
        
    def check_password(self, password):
        if self.legacy_password:
            if ipb_password_check(self.ipb_salt, self.ipb_hash, password):
                self.set_password(password)
                self.legacy_password = False
                self.ipb_salt = ""
                self.ipb_hash = ""
                self.save()
                return True
            else:
                return False
        else:
            return bcrypt.check_password_hash(self.password_hash, password)
        
    def get_avatar_url(self, size=""):
        if size != "":
            size = "_"+size
        
        if not self.avatar_extension:
            return ""
        else:
            return "/static/avatars/"+str(self.avatar_timestamp)+str(self.pk)+size+self.avatar_extension
        
class PrivateMessage(db.DynamicDocument):
    message = db.StringField(required=True)
    author = db.ReferenceField(User, required=True)
    author_name = db.StringField(required=True)
    topic = db.ReferenceField("PrivateMessageTopic")
    topic_name = db.StringField(required=True)
    topic_creator_name = db.StringField(required=True)
    created = db.DateTimeField(required=True)
    modified = db.DateTimeField()
    
    meta = {
        'ordering': ['created'],
        'indexes': [
            'topic',
            'created',
            {
                'fields': ['$message',],
                'default_language': 'english'
            }
        ]
    }
    

class PrivateMessageParticipant(db.DynamicEmbeddedDocument):
    user = db.ReferenceField(User, required=True)
    left_pm = db.BooleanField(default=False)
    blocked = db.BooleanField(default=False)
    do_not_notify = db.BooleanField(default=False)
    last_read = db.DateTimeField()

class PrivateMessageTopic(db.DynamicDocument):
    title = db.StringField(required=True)
    creator = db.ReferenceField(User, required=True)
    creator_name = db.StringField(required=True)
    created = db.DateTimeField(required=True)
    
    last_reply_by = db.ReferenceField(User)
    last_reply_name = db.StringField()
    last_reply_time = db.DateTimeField()
    
    message_count = db.IntField(default=0)
    participating_users = db.ListField(db.ReferenceField(User))
    blocked_users = db.ListField(db.ReferenceField(User))
    users_left_pm = db.ListField(db.ReferenceField(User))
    participants = db.ListField(db.EmbeddedDocumentField(PrivateMessageParticipant))
    participant_count = db.IntField(default=0)
    
    labels = db.ListField(db.StringField())
    old_ipb_id = db.IntField()
    
    meta = {
        'ordering': ['-last_reply_time'],
        'indexes': [
            'old_ipb_id',
            '-last_reply_time',
            {
                'fields': ['$title',],
                'default_language': 'english'
            },
            'participating_users',
            'blocked_users',
            'users_left_pm'
        ]
    }
    
class Notification(db.DynamicDocument):
    user = db.ReferenceField(User, required=True)
    text = db.StringField(required=True)
    description = db.StringField()
    NOTIFICATION_CATEGORIES = (
        ("topic", "Topics"),
        ("pm", "Private Messages"),
        ("mention", "Mentioned"),
        ("topic_reply", "Topic Replies"),
        ("boop", "Boops"),
        ("mod", "Moderation"),
        ("status", "Status Updates"),
        ("new_member", "New Members"),
        ("announcement", "Announcements"),
        ("profile_comment","Profile Comments"),
        ("rules_updated", "Rule Update"),
        ("faqs", "FAQs Updated"),
        ("user_activity", "Followed User Activity"),
        ("streaming", "Streaming")
    )
    category = db.StringField(choices=NOTIFICATION_CATEGORIES, required=True)
    created = db.DateTimeField(required=True)
    url = db.StringField(required=True)
    content = db.GenericReferenceField()
    author = db.ReferenceField(User, required=True)
    acknowledged = db.BooleanField(default=False)
    emailed = db.BooleanField(default=False)

class ReportComment(db.DynamicDocument):
    author = db.ReferenceField(User, required=True)
    created = db.DateTimeField(required=True)
    text = db.StringField(required=True)

class Report(db.DynamicDocument):
    content = db.GenericReferenceField(required=True)
    text = db.StringField(required=True)
    initiated_by = db.ReferenceField(User, required=True)
    STATUS_CHOICES = ( 
        ('closed', 'Closed'), 
        ('open', 'Open'), 
        ('feedback', 'Feedback Requested'), 
        ('waiting', 'Waiting') 
    )
    status = db.StringField(choices=STATUS_CHOICES, default='open')
    created = db.DateTimeField(required=True)
    
class Log(db.DynamicDocument):
    content = db.GenericReferenceField()
    user = db.ReferenceField(User, required=True)
    ip_address = db.ReferenceField(IPAddress, required=True)
    fingerprint = db.ReferenceField(Fingerprint, required=True)
    action = db.StringField(required=True)
    url = db.StringField(required=True)
    data = db.DictField()
    logged_at_time = db.DateTimeField(required=True)

class StatusViewer(db.DynamicEmbeddedDocument):
    last_seen = db.DateTimeField(required=True)
    user = db.ReferenceField(User, required=True)
    
class StatusComment(db.DynamicEmbeddedDocument):
    text = db.StringField(required=True)
    author = db.ReferenceField(User, required=True)
    created = db.DateTimeField(required=True)
    hidden = db.BooleanField(default=False)

class StatusUpdate(db.DynamicDocument):
    attached_to_user = db.ReferenceField(User)
    attached_to_user_name = db.StringField(default="")
    author = db.ReferenceField(User, required=True)
    author_name = db.StringField(default="")
    message = db.StringField(required=True)
    comments = db.ListField(db.EmbeddedDocumentField(StatusComment))
    
    # Fake-Realtime stuff
    viewing = db.ListField(db.EmbeddedDocumentField(StatusViewer))
    
    # Notification stuff
    participants = db.ListField(db.ReferenceField(User))
    ignoring = db.ListField(db.ReferenceField(User))
    blocked = db.ListField(db.ReferenceField(User))
    
    # Mod stuff
    hidden = db.BooleanField(default=False)
    locked = db.BooleanField(default=False)
    muted = db.BooleanField(default=False)
    
    # Tracking
    view_count = db.IntField(default=0)
    viewers = db.IntField(default=0)
    participant_count = db.IntField(default=0)
    created = db.DateTimeField()
    last_replied = db.DateTimeField()
    last_viewed = db.DateTimeField()
    replies = db.IntField(default=0)
    hot_score = db.IntField(default=0) # Replies - Age (basically)
    
    old_ipb_id = db.IntField()
    
    meta = {
        'ordering': ['-created'],
        'indexes': [
            'old_ipb_id',
            '-created',
            'author',
            'attached_to_user',
            {
                'fields': ['$**',],
                'default_language': 'english'
            }
        ]
    }
    
    def get_comment_count(self):
        count = 0
        for c in self.comments:
            if not c.hidden:
                count += 1
        return count

class Attachment(db.DynamicDocument):
    owner_name = db.StringField(required=True)
    path = db.StringField(required=True)
    mimetype = db.StringField(required=True)
    extension = db.StringField(required=True)
    size_in_bytes = db.IntField(required=True)
    created_date = db.DateTimeField(required=True)
    owner = db.ReferenceField(User, required=True)
    used_in = db.IntField(default=1)
    old_ipb_id = db.IntField()
    alt = db.StringField(default="")
    
    x_size = db.IntField()
    y_size = db.IntField()
    
    file_hash = db.StringField()
    linked = db.BooleanField(default=False)
    origin_url = db.StringField()
    origin_domain = db.StringField()
    
    meta = {
        'indexes': [
            'file_hash',
            'origin_url',
            'origin_domain',
        ]
    }
    
class ForumPostParser(object):
    def __init__(self):
        pass
        
    def parse(self, html):
        # parse html
        html = html.replace("[hr]", "<hr>")
        
        # parse attachment tags
        attachment_bbcode_in_post = attachment_re.findall(html)
        
        for attachment_bbcode in attachment_bbcode_in_post:
            try:
                attachment = Attachment.objects(pk=attachment_bbcode[0])[0]
            except:
                pass
                
            size = attachment_bbcode[1]
            if int(size) > 500:
                size = "500"
            print attachment_bbcode
            print size
            print attachment.x_size
            if int(size) == attachment.x_size:
                url = os.path.join("/static/uploads", attachment.path)
                
                image_html = """
                <img class="attachment-image" src="%s" width="%spx" height="%spx" alt="%s" data-url="/static/uploads/%s" data-size="%s"/>
                """ % (quote(url), attachment.x_size, attachment.y_size, attachment.alt, quote(attachment.path), int(float(attachment.size_in_bytes)/1024))
                html = html.replace("[attachment=%s:%s]" % (attachment_bbcode[0], attachment_bbcode[1]), image_html, 1)
            else:
                attachment_path = attachment.path
                filepath = os.path.join(os.getcwd(), "woe/static/uploads", attachment.path)
                sizepath = os.path.join(os.getcwd(), "woe/static/uploads", 
                    ".".join(filepath.split(".")[:-1])+".custom_size."+size+"."+filepath.split(".")[-1])
            
                if not os.path.exists(sizepath):
                    image = Image(filename=filepath)
                    xsize = image.width
                    ysize = image.height
                    resize_measure = min(float(size)/float(xsize),float(size)/float(ysize))
                    image.resize(int(round(xsize*resize_measure)),int(round(ysize*resize_measure)))
                    image.save(filename=sizepath)
                    new_x = image.width
                    new_y = image.height
                else:
                    resize_measure = min(float(size)/float(attachment.x_size),float(size)/float(attachment.y_size))
                    new_x = int(round(attachment.x_size*resize_measure))
                    new_y = int(round(attachment.y_size*resize_measure))
            
                url = os.path.join("/static/uploads", 
                    ".".join(attachment_path.split(".")[:-1])+".custom_size."+size+"."+attachment_path.split(".")[-1])
                
                image_html = """
                <img class="attachment-image" src="%s" width="%spx" height="%spx" alt="%s" data-url="/static/uploads/%s" data-size="%s"/>
                """ % (quote(url), new_x, new_y, attachment.alt, quote(attachment.path), int(float(attachment.size_in_bytes)/1024))
                html = html.replace("[attachment=%s:%s]" % (attachment_bbcode[0], attachment_bbcode[1]), image_html, 1)
        
        return html
