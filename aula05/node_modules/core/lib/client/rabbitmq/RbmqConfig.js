//var base64 = require('base64');
var crypto = require('crypto');

var RbmqConfig = function(data) {
    this.initialize(data);
};

RbmqConfig.parse = function(str, CfgClass) {
    var data;

    try {
        data = JSON.parse(str);
    } catch(err) {
        return;
    }

    if (!CfgClass) {
        CfgClass = RbmqConfig;
    }

    return new CfgClass(data);
};

RbmqConfig.passwordHash = function(password, salt) {
    if (!salt) {
        salt = crypto.randomBytes(8);
    }

    if (!(salt instanceof Buffer)) {
        salt = new Buffer(salt);
    }

    if (salt.length != 8) {
        throw new Error('Salt must be 8 bytes long');
    }

    if (!(password instanceof Buffer)) {
        password = new Buffer(password);
    }

    var buf = new Buffer(password.length + 8);
    var hash = crypto.createHash('md5');

    salt.copy(buf);
    password.copy(buf, 8);
    hash.update(buf);

    var res = new Buffer(23);
    var hashBuf = new Buffer(base64.decode(hash.digest('base64')));

    salt.copy(res);
    hashBuf.copy(res, 8);

    return base64.encode(hashBuf);
};

RbmqConfig.prototype.initialize = function(data) {
    var that = this;

    if (!data) {
        data = {};
    }

    RbmqConfig.KEYS.forEach(function(each) {
        that[each] = data[each] || [];
    });
};

RbmqConfig.prototype.defaultPassword = function(login) {
    return login;
};

RbmqConfig.prototype.defaultConfigurePermission = function() {
    return '.*';
};

RbmqConfig.prototype.defaultReadPermission = function() {
    return '.*';
};

RbmqConfig.prototype.defaultWritePermission = function() {
    return '.*';
};

RbmqConfig.prototype.userExists = function(name) {
    for (var i = 0, l = this.users.length; i < l; i++) {
        if (this.users[i].name == name) {
            return true;
        }
    }
    return false;
};

RbmqConfig.prototype.userAdd = function(name, password, tags) {
    this.users.push({
        name: name,
        'password_hash': RbmqConfig.passwordHash(password || this.defaultPassword(name)),
        tags: tags || ''
    });
};

RbmqConfig.prototype.permissionAdd = function(login, vhost, configure, write, read) {
    this.permissions.push({
        user: login,
        vhost: vhost,
        configure: configure || this.defaultConfigurePermission(login, vhost),
        read: read || this.defaultReadPermission(login, vhost),
        write: write || this.defaultWritePermission(login, vhost)
    });
};

RbmqConfig.prototype.vhostExists = function(name) {
    for (var i = 0, l = this.vhosts.length; i < l; i++) {
        if (this.vhosts[i].name == name) {
            return true;
        }
    }
    return false;
};

RbmqConfig.prototype.vhostAdd = function(name) {
    this.vhosts.push({
        name: name,
    });
};

RbmqConfig.prototype.serialize = function() {
    var result = {};
    var that = this;

    RbmqConfig.KEYS.forEach(function(each) {
        result[each] = that[each];
    });

    return result;
};

RbmqConfig.prototype.toJson = function() {
    return JSON.stringify(this.serialize());
};

RbmqConfig.KEYS = ['users', 'vhosts', 'permissions', 'parameters', 'policies', 'queues', 'exchanges', 'bindings'];

exports.RbmqConfig = RbmqConfig;
