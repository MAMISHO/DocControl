// Generated by CoffeeScript 1.2.1-pre
(function() {
  var BaseValidator, CommaSeparatedIntegerListValidator, EmailValidator, IPv46AddressValidator, IPv4AddressValidator, IPv6AddressValidator, IntegerValidator, MaxDecimalPlacesValidator, MaxDigitsValidator, MaxLengthValidator, MaxValueValidator, MinDecimalPlacesValidator, MinLengthValidator, MinValueValidator, RegexValidator, SlugValidator, URLValidator, ip_address_validator_map, ip_address_validators, isEmpty, validators, _explode_shorthand_ip_string, _is_shorthand_ip,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  RegexValidator = (function() {

    RegexValidator.name = 'RegexValidator';

    RegexValidator.prototype.regex = '';

    RegexValidator.prototype.message = _i('Enter a valid value.');

    RegexValidator.prototype.code = 'invalid';

    function RegexValidator(regex, message, code) {
      this.regex = regex != null ? regex : this.regex;
      this.message = message != null ? message : this.message;
      this.code = code != null ? code : this.code;
      if (typeof this.regex === 'string') this.regex = new RegExp(this.regex);
    }

    RegexValidator.prototype.validate = function(value) {
      /*
          Validates that the input matches the regular expression.
      */
      if (!value.match(this.regex)) {
        throw new ValidationError(this.message, this.code);
      }
    };

    return RegexValidator;

  })();

  URLValidator = (function(_super) {

    __extends(URLValidator, _super);

    URLValidator.name = 'URLValidator';

    function URLValidator() {
      return URLValidator.__super__.constructor.apply(this, arguments);
    }

    URLValidator.prototype.regex = /^(?:http|ftp)s?:\/\/(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+)$/i;

    URLValidator.prototype.message = _i('Enter a valid URL.');

    return URLValidator;

  })(RegexValidator);

  IntegerValidator = (function() {

    IntegerValidator.name = 'IntegerValidator';

    function IntegerValidator() {}

    IntegerValidator.prototype.validate = function(value) {
      if (isNaN(parseInt(value))) throw new ValidationError('', '');
    };

    return IntegerValidator;

  })();

  EmailValidator = (function(_super) {

    __extends(EmailValidator, _super);

    EmailValidator.name = 'EmailValidator';

    function EmailValidator() {
      return EmailValidator.__super__.constructor.apply(this, arguments);
    }

    EmailValidator.prototype.regex = /(^[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+\/=?^_`{}|~0-9A-Z]+)*|^"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-\011\013\014\016-\177])*")@((?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?$)|\[(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}\]$/i;

    EmailValidator.prototype.message = _i('Enter a valid e-mail address.');

    return EmailValidator;

  })(RegexValidator);

  SlugValidator = (function(_super) {

    __extends(SlugValidator, _super);

    SlugValidator.name = 'SlugValidator';

    function SlugValidator() {
      return SlugValidator.__super__.constructor.apply(this, arguments);
    }

    SlugValidator.prototype.regex = /^[-\w]+$/;

    SlugValidator.prototype.message = _i("Enter a valid 'slug' consisting of letters, numbers, underscores or hyphens.");

    return SlugValidator;

  })(RegexValidator);

  IPv4AddressValidator = (function(_super) {

    __extends(IPv4AddressValidator, _super);

    IPv4AddressValidator.name = 'IPv4AddressValidator';

    function IPv4AddressValidator() {
      return IPv4AddressValidator.__super__.constructor.apply(this, arguments);
    }

    IPv4AddressValidator.prototype.regex = /^(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}$/;

    IPv4AddressValidator.prototype.message = _i('Enter a valid IPv4 address.');

    return IPv4AddressValidator;

  })(RegexValidator);

  IPv6AddressValidator = (function() {

    IPv6AddressValidator.name = 'IPv6AddressValidator';

    function IPv6AddressValidator() {}

    IPv6AddressValidator.prototype.error = new ValidationError(_i('Enter a valid IPv6 address.'), 'invalid');

    IPv6AddressValidator.prototype.validate = function(value) {
      var hextet, v, _i, _len, _ref, _results;
      if (__indexOf.call(value, ':') < 0) throw this.error;
      if (value.match(/::/g).length > 1) throw this.error;
      if (__indexOf.call(value, ':::') >= 0) throw this.error;
      if ((value.match('^:') != null) || (value.match(':$') != null)) {
        throw this.error;
      }
      if (value.match(/:/g).length > 7) throw this.error;
      if (__indexOf.call(value, '::') < 0 && value.match(/:/g).length !== 7) {
        if (value.match(/\./g).length !== 3) throw this.error;
      }
      value = _explode_shorthand_ip_string(value);
      _ref = value.split(':');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        hextet = _ref[_i];
        if (hextet.match(/\./g).length === 3) {
          v = value.split(':');
          if (!v[v.length - 1] === hextet) throw this.error;
          try {
            _results.push(new IPv4AddressValidator().validate(hextet));
          } catch (e) {
            throw this.error;
          }
        } else {
          try {
            if (parseInt(hextet, 16) < 0x0 || parseInt(hextet, 16) > 0xFFFF) {
              throw this.error;
            } else {
              _results.push(void 0);
            }
          } catch (e) {
            throw this.error;
          }
        }
      }
      return _results;
    };

    return IPv6AddressValidator;

  })();

  IPv46AddressValidator = (function() {

    IPv46AddressValidator.name = 'IPv46AddressValidator';

    function IPv46AddressValidator() {}

    IPv46AddressValidator.prototype.validate = function(value) {
      try {
        return new IPv4AddressValidator().validate(value);
      } catch (e) {
        try {
          return new IPv6AddressValidator().validate(value);
        } catch (e) {
          throw ValidationError(_i('Enter a valid IPv4 or IPv6 address.'), 'invalid');
        }
      }
    };

    return IPv46AddressValidator;

  })();

  ip_address_validator_map = {
    both: [[IPv46AddressValidator], _i('Enter a valid IPv4 or IPv6 address.')],
    ipv4: [[IPv4AddressValidator], _i('Enter a valid IPv4 address.')],
    ipv6: [[IPv6AddressValidator], _i('Enter a valid IPv6 address.')]
  };

  ip_address_validators = function(protocol, unpack_ipv4) {
    /*
      Depending on the given parameters returns the appropriate validators for
      the GenericIPAddressField.
    
      This code is here, because it is exactly the same for the model and the form field.
    */
    if (protocol !== 'both' && unpack_ipv4) {
      raise(ValueError("You can only use `unpack_ipv4` if `protocol` is set to 'both'"));
    }
    try {
      return ip_address_validator_map[protocol.lower()];
    } catch (e) {
      return raise(ValueError(interpolate("The protocol '%s' is unknown. Supported: 'both', 'ipv4', 'ipv6'", [protocol])));
    }
  };

  CommaSeparatedIntegerListValidator = (function(_super) {
    var error, regex;

    __extends(CommaSeparatedIntegerListValidator, _super);

    CommaSeparatedIntegerListValidator.name = 'CommaSeparatedIntegerListValidator';

    function CommaSeparatedIntegerListValidator() {
      return CommaSeparatedIntegerListValidator.__super__.constructor.apply(this, arguments);
    }

    regex = /^[\d,]+$/;

    error = _i('Enter only digits separated by commas.');

    return CommaSeparatedIntegerListValidator;

  })(RegexValidator);

  BaseValidator = (function() {

    BaseValidator.name = 'BaseValidator';

    BaseValidator.prototype.compare = function(a, b) {
      return a !== b;
    };

    BaseValidator.prototype.clean = function(x) {
      return x;
    };

    BaseValidator.prototype.message = _i("Ensure this value is %(limit_value)s (it is %(show_value)s).");

    BaseValidator.prototype.code = 'limit_value';

    function BaseValidator(limit_value) {
      this.limit_value = limit_value;
    }

    BaseValidator.prototype.validate = function(value) {
      var cleaned, params;
      cleaned = this.clean(value);
      params = {
        limit_value: this.limit_value,
        show_value: cleaned
      };
      if (this.compare(cleaned, this.limit_value)) {
        throw ValidationError(interpolate(this.message, params), this.code, params);
      }
    };

    return BaseValidator;

  })();

  MaxValueValidator = (function(_super) {

    __extends(MaxValueValidator, _super);

    MaxValueValidator.name = 'MaxValueValidator';

    function MaxValueValidator() {
      return MaxValueValidator.__super__.constructor.apply(this, arguments);
    }

    MaxValueValidator.prototype.compare = function(a, b) {
      return a > b;
    };

    MaxValueValidator.prototype.message = _i('Ensure this value is less than or equal to %(limit_value)s.');

    MaxValueValidator.prototype.code = 'max_value';

    return MaxValueValidator;

  })(BaseValidator);

  MinValueValidator = (function(_super) {

    __extends(MinValueValidator, _super);

    MinValueValidator.name = 'MinValueValidator';

    function MinValueValidator() {
      return MinValueValidator.__super__.constructor.apply(this, arguments);
    }

    MinValueValidator.prototype.compare = function(a, b) {
      return a < b;
    };

    MinValueValidator.prototype.message = _i('Ensure this value is greater than or equal to %(limit_value)s.');

    MinValueValidator.prototype.code = 'min_value';

    return MinValueValidator;

  })(BaseValidator);

  MinLengthValidator = (function(_super) {

    __extends(MinLengthValidator, _super);

    MinLengthValidator.name = 'MinLengthValidator';

    function MinLengthValidator() {
      return MinLengthValidator.__super__.constructor.apply(this, arguments);
    }

    MinLengthValidator.prototype.x = 53;

    MinLengthValidator.prototype.compare = function(a, b) {
      return a < b;
    };

    MinLengthValidator.prototype.clean = function(x) {
      return x.length;
    };

    MinLengthValidator.prototype.message = _i('Ensure this value has at least %(limit_value)d characters (it has %(show_value)d).');

    MinLengthValidator.prototype.code = 'min_length';

    return MinLengthValidator;

  })(BaseValidator);

  MaxLengthValidator = (function(_super) {

    __extends(MaxLengthValidator, _super);

    MaxLengthValidator.name = 'MaxLengthValidator';

    function MaxLengthValidator() {
      return MaxLengthValidator.__super__.constructor.apply(this, arguments);
    }

    MaxLengthValidator.prototype.compare = function(a, b) {
      return a > b;
    };

    MaxLengthValidator.prototype.clean = function(x) {
      return x.length;
    };

    MaxLengthValidator.prototype.message = _i('Ensure this value has at most %(limit_value)d characters (it has %(show_value)d).');

    MaxLengthValidator.prototype.code = 'max_length';

    return MaxLengthValidator;

  })(BaseValidator);

  MaxDecimalPlacesValidator = (function(_super) {

    __extends(MaxDecimalPlacesValidator, _super);

    MaxDecimalPlacesValidator.name = 'MaxDecimalPlacesValidator';

    function MaxDecimalPlacesValidator() {
      return MaxDecimalPlacesValidator.__super__.constructor.apply(this, arguments);
    }

    MaxDecimalPlacesValidator.prototype.compare = function(a, b) {
      return a > b;
    };

    MaxDecimalPlacesValidator.prototype.clean = function(x) {
      return String(x.split(".")[1] || "").length;
    };

    MaxDecimalPlacesValidator.prototype.message = _i('Ensure this value has at most %(limit_value)d digits after the decimal.');

    return MaxDecimalPlacesValidator;

  })(BaseValidator);

  MinDecimalPlacesValidator = (function(_super) {

    __extends(MinDecimalPlacesValidator, _super);

    MinDecimalPlacesValidator.name = 'MinDecimalPlacesValidator';

    function MinDecimalPlacesValidator() {
      return MinDecimalPlacesValidator.__super__.constructor.apply(this, arguments);
    }

    MinDecimalPlacesValidator.prototype.compare = function(a, b) {
      return a < b;
    };

    MinDecimalPlacesValidator.prototype.clean = function(x) {
      return String(x.split(".")[1] || "").length;
    };

    MinDecimalPlacesValidator.prototype.message = _i('Ensure this value has at least %(limit_value)d digits after the decimal.');

    return MinDecimalPlacesValidator;

  })(BaseValidator);

  MaxDigitsValidator = (function(_super) {

    __extends(MaxDigitsValidator, _super);

    MaxDigitsValidator.name = 'MaxDigitsValidator';

    function MaxDigitsValidator() {
      return MaxDigitsValidator.__super__.constructor.apply(this, arguments);
    }

    MaxDigitsValidator.prototype.compare = function(a, b) {
      return a > b;
    };

    MaxDigitsValidator.prototype.clean = function(x) {
      return String(x).replace('.', '').length;
    };

    MaxDigitsValidator.prototype.message = _i('Ensure this value has at most %(limit_value)d digits.');

    return MaxDigitsValidator;

  })(BaseValidator);

  isEmpty = function(val) {
    var emptyValues;
    emptyValues = [null, void 0, ''];
    if (__indexOf.call(emptyValues, val) >= 0) {
      return true;
    } else {
      return false;
    }
  };

  validators = {
    RegexValidator: RegexValidator,
    URLValidator: URLValidator,
    IntegerValidator: IntegerValidator,
    EmailValidator: EmailValidator,
    SlugValidator: SlugValidator,
    IPv4AddressValidator: IPv4AddressValidator,
    IPv6AddressValidator: IPv6AddressValidator,
    IPv46AddressValidator: IPv46AddressValidator,
    ip_address_validators: ip_address_validators,
    CommaSeparatedIntegerListValidator: CommaSeparatedIntegerListValidator,
    BaseValidator: BaseValidator,
    MaxValueValidator: MaxValueValidator,
    MinValueValidator: MinValueValidator,
    MinLengthValidator: MinLengthValidator,
    MaxLengthValidator: MaxLengthValidator,
    isEmpty: isEmpty
  };

  if (window) {
    window.validators = validators;
  } else if (module) {
    module.exports = validators;
  }

  _explode_shorthand_ip_string = function(ip_str) {
    /*
      Expand a shortened IPv6 address.
    
      Args:
          ip_str: A string, the IPv6 address.
    
      Returns:
          A string, the expanded IPv6 address.
    */

    var fill_to, hextet, new_ip, ret_ip, sep, _, _i, _j, _len, _len2, _ref;
    if (!_is_shorthand_ip(ip_str)) return ip_str;
    new_ip = [];
    hextet = ip_str.split('::');
    if (__indexOf.call(ip_str.split(':')[-1], '.') >= 0) {
      fill_to = 7;
    } else {
      fill_to = 8;
    }
    if (len(hextet) > 1) {
      sep = len(hextet[0].split(':')) + len(hextet[1].split(':'));
      new_ip = hextet[0].split(':');
      _ref = xrange(fill_to - sep);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _ = _ref[_i];
        new_ip.push('0000');
      }
      new_ip += hextet[1].split(':');
    } else {
      new_ip = ip_str.split(':');
    }
    ret_ip = [];
    for (_j = 0, _len2 = new_ip.length; _j < _len2; _j++) {
      hextet = new_ip[_j];
      ret_ip.push(('0' * (4 - len(hextet)) + hextet).lower());
    }
    return ':'.join(ret_ip);
  };

  _is_shorthand_ip = function(ip_str) {
    /*Determine if the address is shortened.
    
    Args:
        ip_str: A string, the IPv6 address.
    
    Returns:
        A boolean, True if the address is shortened.
    */
    if (ip_str.match(/::/g).length === 1) return true;
    if (_.any(ip_str.split(':'), function(x) {
      return x.length < 4;
    })) {
      return true;
    }
    return false;
  };

}).call(this);
