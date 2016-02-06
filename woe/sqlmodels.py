from woe import sqla as db
from sqlalchemy.dialects.postgresql import JSONB

############################################################
# Private Message Models
############################################################

class PrivateMessageUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    author = db.relationship("User")

    pm_id = db.Column(db.Integer, db.ForeignKey('private_message.id'))
    pm = db.relationship("PrivateMessage")

    ignoring = db.Column(db.Boolean)
    exited = db.Column(db.Boolean)
    blocked = db.Column(db.Boolean)
    viewed = db.Column(db.Integer)
    last_viewed = db.Column(db.DateTime)

    def __repr__(self):
        return "<PrivateMessageUser: (user='%s', pm='%s')>" % (self.user.display_name, self.pm.title)

class PrivateMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    count = db.Column(db.Integer)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    author = db.relationship("User")

    created = db.Column(db.Integer)
    old_mongo_hash = db.Column(db.String, nullable=True)

    def __repr__(self):
        return "<PrivateMessage: (title='%s')>" % (self.title, )

class PrivateMessageReply(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    author = db.relationship("User")

    pm_id = db.Column(db.Integer, db.ForeignKey('private_message.id'))
    pm = db.relationship("PrivateMessage")

    message = db.Column(db.Text)
    old_mongo_hash = db.Column(db.String, nullable=True)

    created = db.Column(db.DateTime)
    modified = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return "<PrivateMessageReply: (created='%s', user='%s', pm='%s')>" % (self.created, self.user.display_name, self.pm.title)

############################################################
# Status Update Models
############################################################

class StatusUpdateUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    author = db.relationship("User")

    status_id = db.Column(db.Integer, db.ForeignKey('status_update.id'))
    status = db.relationship("StatusUpdate")

    ignoring = db.Column(db.Boolean)
    blocked = db.Column(db.Boolean)
    viewed = db.Column(db.Integer)
    last_viewed = db.Column(db.DateTime)

    def __repr__(self):
        return "<StatusUpdateUser: (user='%s', status='%s')>" % (self.user.display_name, self.status.message[0:50])

class StatusComment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    author = db.relationship("User")

    status_id = db.Column(db.Integer, db.ForeignKey('status_update.id'))
    status = db.relationship("StatusUpdate")

    def __repr__(self):
        return "<StatusComment: (created='%s', user='%s', status='%s')>" % (self.created, self.user.display_name, self.status.message[0:50])

class StatusUpdate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    author = db.relationship("User")

    last_replied = db.Column(db.DateTime)
    last_viewed = db.Column(db.DateTime)
    replies = db.Column(db.Integer)

    old_mongo_hash = db.Column(db.String, nullable=True)

    def __repr__(self):
        return "<StatusUpdate: (created='%s', user='%s', message='%s')>" % (self.created, self.user.display_name, self.message[0:50])

############################################################
# Core Site Models
############################################################

class SiteTheme(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    css = db.Column(db.Text)
    name = db.Column(db.String, unique=True)
    weight = db.Column(db.Integer)
    created = db.Column(db.DateTime)

    def __repr__(self):
        return "<SiteTheme: (name='%s')>" % (self.name,)

############################################################
# Security Models
############################################################

class IPAddress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.Text)
    last_seen = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship("User")

    __table_args__ = (db.UniqueConstraint('user_id', 'id', name='unique_user_ip_addy'),)

    def __repr__(self):
        return "<IPAddress: (ip_address='%s', user=)>" % (self.ip_address,)

class Fingerprint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    json = db.Column(JSONB)
    factors = db.Column(db.Integer)
    last_seen = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship("User")

    def __repr__(self):
        return "<Fingerprint: (factors='%s', user=)>" % (self.factors,)

    def compute_similarity_score(self, stranger):
        score = 0.0
        attributes = {}

        for key in self.json.keys():
            attributes[key] = 1

        for key in stranger.json.keys():
            attributes[key] = 1

        max_score = float(len(attributes.keys()))
        for attribute in attributes.keys():
            if self.json.get(attribute, None) == stranger.json.get(attribute, None):
                score += 1

        return score/max_score

class SiteLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    method = db.Column(db.String)
    path = db.Column(db.String)
    ip_address = db.Column(db.String)
    agent_platform = db.Column(db.String)
    agent_browser = db.Column(db.String)
    agent_browser_version = db.Column(db.String)
    agent = db.Column(db.String)
    time = db.Column(db.DateTime)
    error = db.Column(db.Boolean)
    error_name = db.Column(db.String)
    error_code = db.Column(db.String)
    error_description = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    user = db.relationship("User")

    def __repr__(self):
        return "%s %s %s :: %s %s %s %s" % (self.time.isoformat(), self.method, self.ip_address, self.agent, self.agent_browser, self.agent_browser_version, self.agent_platform)


############################################################
# Core User Models
############################################################

class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pre_html = db.Column(db.String)
    role = db.Column(db.String)
    post_html = db.Column(db.String)

    def __repr__(self):
        return "<Role: (role='%s')>" % (self.role,)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship("User", backref="notifications")

    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    author = db.relationship("User")

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
        ("streaming", "Streaming"),
        ("other", "Other")
    )

    category = db.Column(db.String)
    created = db.Column(db.DateTime)
    url = db.Column(db.DateTime)
    acknowledged = db.Column(db.Boolean)
    seen = db.Column(db.Boolean)
    emailed = db.Column(db.Boolean)
    priority = db.Column(db.Integer)

    def __repr__(self):
        return "<Notification: (user='%s', message='%s')>" % (self.user.display_name, self.message)

class IgnoringUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship("User")
    ignoring_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    ignoring = db.relationship("User")
    __table_args__ = (db.UniqueConstraint('user_id', 'ignoring_id', name='unique_user_ignoring'),)
    created = db.Column(db.DateTime)

    distort_posts = db.Column(db.Boolean)
    block_sigs = db.Column(db.Boolean)
    block_pms = db.Column(db.Boolean)
    block_blogs = db.Column(db.Boolean)
    block_status = db.Column(db.Boolean)

    def __repr__(self):
        return "<IgnoredUser: (user='%s', ignoring='%s')>" % (self.user.display_name, self.ignored.display_name)

class FollowingUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship("User")
    following_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    following = db.relationship("User")
    __table_args__ = (db.UniqueConstraint('user_id', 'following_id', name='unique_user_following'),)
    created = db.Column(db.DateTime)

    def __repr__(self):
        return "<FollowingUser: (user='%s', following='%s')>" % (self.user.display_name, self.following.display_name)

class Friendship(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship("User")
    friend_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    friend = db.relationship("User")
    __table_args__ = (db.UniqueConstraint('user_id', 'friend_id', name='unique_user_friend'),)
    created = db.Column(db.DateTime)

    pending = db.Column(db.Boolean)
    blocked = db.Column(db.Boolean)

    def __repr__(self):
        return "<Friendship: (user='%s', friend='%s', pending='%s', blocked='%s')>" % (self.user.display_name, self.friend.display_name, self.pending, self.blocked)

user_role_table = db.Table('user_roles', db.metadata,
    db.Column('role_id', db.Integer, db.ForeignKey('role.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')))

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    roles = db.relationship("Role",
                    secondary=user_role_table,
                    backref="users")

    data = db.Column(JSONB)

    display_name = db.Column(db.String)
    login_name = db.Column(db.String)
    email_address = db.Column(db.String)
    password_hash = db.Column(db.String)

    how_did_you_find_us = db.Column(db.Text)
    is_allowed_during_construction = db.Column(db.Boolean)
    my_url = db.Column(db.String)
    time_zone = db.Column(db.String)

    banned = db.Column(db.Boolean)
    validated = db.Column(db.Boolean)
    over_thirteen = db.Column(db.Boolean)

    emails_muted = db.Column(db.Boolean)
    last_sent_notification_email = db.Column(db.DateTime, nullable=True)

    title = db.Column(db.String)
    minecraft = db.Column(db.String)
    location = db.Column(db.String)
    about_me = db.Column(db.Text)
    anonymous_login = db.Column(db.Boolean)

    avatar_extension = db.Column(db.String)
    avatar_full_x = db.Column(db.Integer)
    avatar_full_y = db.Column(db.Integer)
    avatar_60_x = db.Column(db.Integer)
    avatar_60_y = db.Column(db.Integer)
    avatar_40_x = db.Column(db.Integer)
    avatar_40_y = db.Column(db.Integer)
    avatar_timestamp = db.Column(db.String)

    password_forgot_token = db.Column(db.String)
    password_forgot_token_date = db.Column(db.DateTime, nullable=True)

    posts_count = db.Column(db.Integer)
    topic_count = db.Column(db.Integer)
    status_count = db.Column(db.Integer)
    status_comment_count = db.Column(db.Integer)

    last_seen = db.Column(db.DateTime, nullable=True)
    hidden_last_seen = db.Column(db.DateTime, nullable=True)
    last_at = db.Column(db.String)
    last_at_url = db.Column(db.String)

    is_admin = db.Column(db.Boolean)
    is_mod = db.Column(db.Boolean)

    display_name_history = db.Column(JSONB)

    # Migration related
    old_mongo_hash = db.Column(db.String, nullable=True)

    def __repr__(self):
        return "<IgnoredUser: (name='%s')>" % (self.display_name)

    def get_hash(self):
        return self.password_hash[-40:]

    def is_active(self):
        if self.banned:
            return False
        if not self.validated:
            return False
        return True

############################################################
# Roleplay Models
############################################################

class Character(db.Model):
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    author = db.relationship("User")

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    slug = db.Column(db.String, unique=True)

    age = db.Column(db.String)
    species = db.Column(db.String)
    appearance = db.Column(db.Text)
    personality = db.Column(db.Text)
    backstory = db.Column(db.Text)
    other = db.Column(db.Text)
    motto = db.Column(db.String)
    modified = db.Column(db.DateTime, nullable=True)

    character_history = db.Column(JSONB)
    old_mongo_hash = db.Column(db.String, nullable=True)

    def __repr__(self):
        return "<Character: (name='%s')>" % (self.name,)

############################################################
# Moderation Models
############################################################

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String)
    content_type = db.Column(db.String)
    content_id = db.Column(db.Integer)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    author = db.relationship("User")

    report = db.Column(db.Text)

    STATUS_CHOICES = (
        ('ignored', 'Ignored'),
        ('open', 'Open'),
        ('feedback', 'Feedback Requested'),
        ('waiting', 'Waiting'),
        ('action taken', 'Action Taken')
    )

    status = db.Column(db.String)
    created = db.Column(db.DateTime)

    def __repr__(self):
        return "<Report: (content_type='%s', content_id='%s')>" % (self.content_type, self.content_id)

class ReportComment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime)
    comment = db.Column(db.Text)
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    author = db.relationship("User")
    report_id = db.Column(db.Integer, db.ForeignKey('report.id'))
    report = db.relationship("Report")

    def __repr__(self):
        return "<ReportComment: (created='%s', comment='%s')>" % (self.created, self.comment[0:30])

############################################################
# Attachment Models
############################################################

class Attachment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    path = db.Column(db.String)
    mimetype = db.Column(db.String)
    extension = db.Column(db.String)

    size_in_bytes = db.Column(db.Integer)
    created_date = db.Column(db.DateTime)
    do_not_convert = db.Column(db.Boolean)
    alt = db.Column(db.String)

    old_mongo_hash = db.Column(db.String, nullable=True)

    x_size = db.Column(db.Integer)
    y_size = db.Column(db.Integer)

    file_hash = db.Column(db.String)
    linked = db.Column(db.Boolean)
    origin_url =  db.Column(db.String)
    origin_domain = db.Column(db.String)
    caption = db.Column(db.String)

    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    owner = db.relationship("User")

    character_id = db.Column(db.Integer, db.ForeignKey('character.id'), nullable=True)
    character = db.relationship("Character")
    character_gallery = db.Column(db.Boolean)
    character_gallery_weight = db.Column(db.Integer)
    character_avatar = db.Column(db.Boolean)

    def __repr__(self):
        return "<Attachment: (path='%s')>" % (self.path,)

############################################################
# Forum Models
############################################################

class Label(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pre_html = db.Column(db.String)
    label = db.Column(db.String)
    post_html = db.Column(db.String)

    def __repr__(self):
        return "<Label: (label='%s')>" % (self.label,)

class Section(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    slug = db.Column(db.String, unique=True)
    weight = db.Column(db.Integer)

    def __repr__(self):
        return "<Section: (name='%s', weight='%s')>" % (self.name, self.weight)

allowed_user_table = db.Table('category_allowed_users', db.metadata,
    db.Column('category_id', db.Integer, db.ForeignKey('category.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')))

allowed_label_table = db.Table('category_allowed_labels', db.metadata,
    db.Column('category_id', db.Integer, db.ForeignKey('category.id')),
    db.Column('label_id', db.Integer, db.ForeignKey('label.id')))

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    category = db.relationship("Category")
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'))
    section = db.relationship("Section")

    allowed_users = db.relationship("User",
                    secondary=allowed_user_table)
    allowed_labels = db.relationship("Label",
                    secondary=allowed_label_table)

    recent_post_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    recent_post = db.relationship("Post")
    recent_topic_id = db.Column(db.Integer, db.ForeignKey('topic.id'))
    recent_topic = db.relationship("Topic")

    name = db.Column(db.String)
    slug = db.Column(db.String, unique=True)

    weight = db.Column(db.Integer)
    restricted = db.Column(db.Boolean)

    topic_count = db.Column(db.Integer)
    post_count = db.Column(db.Integer)
    view_count = db.Column(db.Integer)

    def __repr__(self):
        return "<Category: (name='%s', weight='%s')>" % (self.name, self.weight)

topic_watchers_table = db.Table('topic_watchers', db.metadata,
    db.Column('topic_id', db.Integer, db.ForeignKey('topic.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')))

topic_mods_table = db.Table('topic_moderators', db.metadata,
    db.Column('topic_id', db.Integer, db.ForeignKey('topic.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')))

topic_banned_table = db.Table('topic_banned_users', db.metadata,
    db.Column('topic_id', db.Integer, db.ForeignKey('topic.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')))

class Topic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    category = db.relationship("Category")
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    author = db.relationship("User")

    editor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    editor = db.relationship("User")

    label_id = db.Column(db.Integer, db.ForeignKey('label.id'), nullable=True)
    label = db.relationship("Label")

    watchers = db.relationship("User",
                    secondary=topic_watchers_table)
    moderators = db.relationship("User",
                    secondary=topic_mods_table)
    banned = db.relationship("User",
                    secondary=topic_banned_table)
    recent_post_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    recent_post = db.relationship("Post")

    title = db.Column(db.String)
    slug = db.Column(db.String, unique=True)
    sticky = db.Column(db.Boolean)
    announcement = db.Column(db.Boolean)

    def __repr__(self):
        return "<Topic: (title='%s', created='%s')>" % (self.title, self.created)

post_boop_table = db.Table('post_boops_from_users', db.metadata,
    db.Column('post_id', db.Integer, db.ForeignKey('post.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')))

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topic.id'))
    topic = db.relationship("Topic")

    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    author = db.relationship("User")

    editor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    editor = db.relationship("User")

    boops = db.relationship("User",
                    secondary=post_boop_table,
                    backref="booped_posts")

    character_id = db.Column(db.Integer, db.ForeignKey('character.id'), nullable=True)
    character = db.relationship("Character")

    avatar_id = db.Column(db.Integer, db.ForeignKey('attachment.id'), nullable=True)
    avatar = db.relationship("Attachment")

    html = db.Column(db.Text)
    modified = db.Column(db.DateTime, nullable=True)

    old_mongo_hash = db.Column(db.String, nullable=True)
    data = db.Column(JSONB)

    def __repr__(self):
        return "<Post: (author='%s', created='%s', topic='%s')>" % (self.author.display_name, self.created, self.topic.title[0:50])
