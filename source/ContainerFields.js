// Generated by CoffeeScript 1.4.0
(function() {
  var addFields,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  addFields = function(fields) {
    var BaseContainerField, ContainerField, HashField, ListField, utils;
    if (typeof exports !== "undefined" && exports !== null) {
      utils = require("./utils");
    } else if (typeof window !== "undefined" && window !== null) {
      utils = window.utils;
    }
    /*
      DocControl allows you to create arbitrarily nested forms, to validate arbitrary data structures.
      You do this by using ContainerFields. create a nested form by creating a containerField
      then adding subfields to the schema. See example in README.md.
    */

    BaseContainerField = (function(_super) {

      __extends(BaseContainerField, _super);

      function BaseContainerField() {
        return BaseContainerField.__super__.constructor.apply(this, arguments);
      }

      /*
            _fields.BaseContainerField_ is the baseKind for all container-type fields.
            DocControl allows you to create, validate and display arbitrarily complex
            nested data structures. container-type fields contain other fields. There
            are currently two types. A `ContainerField`, analogous to a hash of subfields,
            and a `ListField`, analogous to a list of subfields. container-type fields
            act in most ways like a regular field. You can set them, and all their subfields
            with `setValue`, you can get their, and all their subfields', data with
            `getClean` or `toJSON`.
      
            When a subfield is invalid, the containing field will also be invalid.
      
            You specify a container's subfields in the `schema` attribute. Each container type
            accepts a different format for the `schema`.
      
            DocControl schemas are fully recursive - that is, containers can contain containers,
            allowing you to model and validate highly nested datastructures like you might find
            in a document database.
      */


      BaseContainerField.prototype.schema = void 0;

      BaseContainerField.prototype._fields = void 0;

      BaseContainerField.prototype.errorMessages = {
        required: utils._i('There must be at least one %s.'),
        invalid: utils._i('Please fix the errors indicated below.')
      };

      BaseContainerField.prototype.listeners = {
        onValueChanged: "subfieldChanged",
        onValidChanged: "subfieldChanged",
        onRequiredChanged: "subfieldChanged"
      };

      BaseContainerField.prototype.subfieldChanged = function(inSender, inEvent) {
        /* if an immediate subfield has changed, then we want to perform validation next time inValid called
        */
        this._hasChanged = true;
        return false;
      };

      BaseContainerField.prototype.isValid = function(opts) {
        /* custom isvalid method that validates all child fields as well.
        */

        var oldErrors, valid, value, _ref,
          _this = this;
        if (opts != null ? (_ref = opts.path) != null ? _ref.length : void 0 : void 0) {
          return this._applyToSubfield("isValid", opts);
        }
        if (!this._hasChanged) {
          return this._valid;
        }
        oldErrors = this.errors;
        this.errors = [];
        value = void 0;
        utils.forEach(this.getFields(), function(x) {
          if (!x.isValid()) {
            return _this.errors = [_this.errorMessages.invalid];
          }
        });
        if (!this.errors.length) {
          value = this._querySubfields("getClean");
          value = this.validate(value);
        }
        utils.forEach(this.getFields(), function(x) {
          if (!x.isValid()) {
            return _this.errors = [_this.errorMessages.invalid];
          }
        });
        valid = !this.errors.length;
        if (valid) {
          value = this._querySubfields("getClean");
        }
        this.clean = valid ? value : void 0;
        if (valid !== this._valid || (!valid && !utils.isEqual(oldErrors, this.errors))) {
          this.emit("onValidChanged", {
            valid: valid,
            errors: this.errors
          });
          this._valid = valid;
        }
        this._hasChanged = false;
        return valid;
      };

      BaseContainerField.prototype._querySubfields = function() {
        var args, fn;
        fn = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        /* get data from each subfield `fn` and put it into the appropriate data structure
        */

        return utils.map(this.getFields(), function(x) {
          return x[fn].apply(x, args);
        });
      };

      BaseContainerField.prototype.getFields = function(opts) {
        var _ref;
        if (opts != null ? (_ref = opts.path) != null ? _ref.length : void 0 : void 0) {
          return this._applyToSubfield("getFields", opts);
        }
        return this._fields;
      };

      BaseContainerField.prototype.getField = function(path) {
        /*
              return an arbitrarily deep subfield given a path. Path can be an array
              of indexes/names, or it can be a dot-delimited string
        */

        var subfield;
        if (!path || path.length === 0) {
          return this;
        }
        if (typeof path === "string") {
          path = path.split(".");
        }
        subfield = this._getField(path.shift());
        if (!(subfield != null)) {
          return void 0;
        }
        return subfield.getField(path);
      };

      BaseContainerField.prototype.resetFields = function() {
        this.emit("onSubfieldsReset");
        if (this._fields && this._fields.length) {
          this.value = this.getValue();
        }
        return this._fields = [];
      };

      BaseContainerField.prototype.throwValidationError = function() {
        if (!this.isValid()) {
          throw this.errors;
        }
      };

      BaseContainerField.prototype.getValue = function(opts) {
        var _ref;
        opts = this._procOpts(opts);
        if (opts != null ? (_ref = opts.path) != null ? _ref.length : void 0 : void 0) {
          return this._applyToSubfield("getValue", opts);
        }
        if (this.value !== void 0) {
          return this.value;
        }
        return this._querySubfields("getValue");
      };

      BaseContainerField.prototype.getClean = function(opts) {
        var _ref;
        opts = this._procOpts(opts);
        if (opts != null ? (_ref = opts.path) != null ? _ref.length : void 0 : void 0) {
          return this._applyToSubfield("getClean", opts);
        }
        this.throwValidationError();
        return this.clean;
      };

      BaseContainerField.prototype.toJSON = function(opts) {
        var _ref;
        opts = this._procOpts(opts);
        if (opts != null ? (_ref = opts.path) != null ? _ref.length : void 0 : void 0) {
          return this._applyToSubfield("toJSON", opts);
        }
        this.throwValidationError();
        return this._querySubfields("toJSON");
      };

      BaseContainerField.prototype.getErrors = function(opts) {
        var _ref;
        opts = this._procOpts(opts);
        if (opts != null ? (_ref = opts.path) != null ? _ref.length : void 0 : void 0) {
          return this._applyToSubfield("getErrors", opts);
        }
        this.isValid();
        if (!this.errors.length) {
          return null;
        }
        return this._querySubfields("getErrors");
      };

      BaseContainerField.prototype._addField = function(definition, value) {
        var field;
        definition = utils.clone(definition);
        definition.parent = this;
        if (value != null) {
          definition.value = value;
        }
        field = fields.genField(definition, this, value);
        return field;
      };

      BaseContainerField.prototype._applyToSubfield = function() {
        var args, fn, opts, subfield;
        fn = arguments[0], opts = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        subfield = this.getField(opts.path);
        if (!subfield) {
          throw Error("Field does not exist: " + String(opts.path));
        }
        delete opts.path;
        args.push(opts);
        return subfield[fn].apply(subfield, args);
      };

      BaseContainerField.prototype._procOpts = function(opts) {
        if (opts == null) {
          opts = {};
        }
        if (typeof opts === "string" || opts instanceof Array) {
          opts = {
            path: opts
          };
        }
        return opts;
      };

      return BaseContainerField;

    })(fields.Field);
    ContainerField = (function(_super) {

      __extends(ContainerField, _super);

      function ContainerField() {
        return ContainerField.__super__.constructor.apply(this, arguments);
      }

      /*
            A ContainerField contains a number of heterogeneous
            subfields. When data is extracted from it using `toJSON`, or `getClean`, the
            returned data is in a hash object where the key is the name of the subfield
            and the value is the value of the subfield.
      
            the schema for a ContainerField is an Array of kind definition objects such as
            `[{kind: "CharField", maxLength: 50 }, {kind:IntegerField }`.
            The ContainerField will contain the specified array of heterogenious fields.
      */


      ContainerField.prototype.widget = "widgets.ContainerWidget";

      ContainerField.prototype.setValue = function(val, opts) {
        var field, origValue, _fields, _i, _len, _ref;
        opts = this._procOpts(opts);
        if (opts != null ? (_ref = opts.path) != null ? _ref.length : void 0 : void 0) {
          return this._applyToSubfield("setValue", opts, val);
        }
        origValue = this.getValue();
        if (val === void 0) {
          val = utils.clone(this["default"]) || {};
        }
        if (!val || utils.isEqual(val, origValue) || !this._fields) {
          return;
        }
        if (!(val instanceof Object) || val instanceof Array) {
          throw JSON.stringify(val) + " must be a hash";
        }
        this.value = val;
        _fields = this.getFields();
        for (_i = 0, _len = _fields.length; _i < _len; _i++) {
          field = _fields[_i];
          field.setValue(val[field.name]);
        }
        this.value = this.value !== null ? void 0 : void 0;
        return this.emit("onValueChanged", {
          value: this.getValue(),
          original: origValue
        });
      };

      ContainerField.prototype._getField = function(name) {
        var field, _i, _len, _ref;
        _ref = this.getFields();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          field = _ref[_i];
          if (field.name === name) {
            return field;
          }
        }
      };

      ContainerField.prototype.setSchema = function(schema, opts) {
        var definition, origValue, value, _i, _len, _ref;
        if (opts != null ? (_ref = opts.path) != null ? _ref.length : void 0 : void 0) {
          return this._applyToSubfield("setSchema", opts, schema);
        }
        if (!(schema != null) || schema === this.schema) {
          return;
        }
        this.schema = schema;
        origValue = this.getValue();
        this.resetFields();
        if ((opts != null ? opts.value : void 0) != null) {
          this.value = opts.value;
        }
        for (_i = 0, _len = schema.length; _i < _len; _i++) {
          definition = schema[_i];
          value = this.value != null ? this.value[definition.name] : void 0;
          this._addField(definition, value);
        }
        this.value = this.value !== null ? void 0 : void 0;
        return this.emit("onValueChanged", {
          value: this.getValue(),
          original: origValue
        });
      };

      ContainerField.prototype.validate = function(value) {
        return value;
      };

      ContainerField.prototype._querySubfields = function() {
        var args, fn, out;
        fn = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        out = {};
        utils.forEach(this.getFields(), function(x) {
          return out[x.name] = x[fn].apply(x, args);
        });
        return out;
      };

      ContainerField.prototype.getPath = function(subfield) {
        var end;
        end = [];
        if (subfield) {
          end.push(subfield.name);
        }
        if (this.parent) {
          return this.parent.getPath(this).concat(end);
        } else {
          return end;
        }
      };

      return ContainerField;

    })(BaseContainerField);
    HashField = (function(_super) {

      __extends(HashField, _super);

      function HashField() {
        return HashField.__super__.constructor.apply(this, arguments);
      }

      /*
              A HashField contains an arbitrary number of identical subfields in a hash
              (javascript object). When data is extracted from it using `toJSON`, or 
              `getClean`, the returned data is in an object where each value is the value 
              of the subfield at the corresponding key.
      
              A HashField's `schema` consists of a single field definition, such as
              `{ kind: "email" }`.
      
              This doesn't really seem to have a use case for a widget, just for arbitrary
              json validation. so no widget is provided
      */


      HashField.prototype.widget = null;

      HashField.prototype.setSchema = function(schema, opts) {
        var _ref;
        opts = this._procOpts(opts);
        if (opts != null ? (_ref = opts.path) != null ? _ref.length : void 0 : void 0) {
          return this._applyToSubfield("setSchema", opts, schema);
        }
        if (!(schema != null) || schema === this.schema) {
          return;
        }
        this.schema = schema;
        this.resetFields();
        this.setValue(this.value);
        return this.value = this.value !== null ? void 0 : void 0;
      };

      HashField.prototype.setValue = function(val, opts) {
        var key, schema, value, _ref;
        opts = this._procOpts(opts);
        if (opts != null ? (_ref = opts.path) != null ? _ref.length : void 0 : void 0) {
          return this._applyToSubfield("setValue", opts, val);
        }
        if (val === void 0) {
          val = utils.clone(this["default"]) || [];
        }
        if (!val || !this.schema || utils.isEqual(val, this.getValue())) {
          return;
        }
        if (!(val instanceof Object) || val instanceof Array) {
          throw JSON.stringify(val) + " must be a hash";
        }
        this.resetFields();
        this.value = val;
        for (key in val) {
          value = val[key];
          schema = utils.clone(this.schema);
          schema.name = key;
          this._addField(schema, value);
        }
        this.value = this.value !== null ? void 0 : void 0;
        return this.emit("onValueChanged", {
          value: this.getValue(),
          original: this.value
        });
      };

      HashField.prototype.validate = function(value) {
        var message;
        if (utils.isEmpty(value) && this.required) {
          message = this.errorMessages.required;
          this.errors = [utils.interpolate(message, [this.schema.name || (typeof this.schema.field === "string" && this.schema.field.slice(0, -5)) || "item"])];
          return value;
        }
      };

      HashField.prototype.addField = function(key, value) {
        /* add the field at key with value
        */

        var schema;
        schema = utils.clone(this.schema);
        schema.name = key;
        return this._addField(schema, value);
      };

      HashField.prototype.removeField = function(index) {
        /* remove the field at `index`.
        */

        var value;
        this._getField(index).emit("onFieldDelete");
        value = this.getValue();
        value.splice(index, 1);
        this.setValue(value);
        return this.emit("onValueChanged", {
          value: this.getValue(),
          original: value,
          op: "remove"
        });
      };

      return HashField;

    })(ContainerField);
    ListField = (function(_super) {

      __extends(ListField, _super);

      function ListField() {
        return ListField.__super__.constructor.apply(this, arguments);
      }

      /*
              A ListField contains an arbitrary number of identical subfields in a
              list. When data is extracted from it using `toJSON`, or `getClean`, the
              returned data is in a list where each value is the value of the subfield at
              the corresponding index.
      
              A ListField's `schema` consists of a single field definition, such as
              `{ kind: "email" }`.
      */


      ListField.prototype.widget = "widgets.ListWidget";

      ListField.prototype.setSchema = function(schema, opts) {
        var _ref;
        opts = this._procOpts(opts);
        if (opts != null ? (_ref = opts.path) != null ? _ref.length : void 0 : void 0) {
          return this._applyToSubfield("setSchema", opts, schema);
        }
        if (!(schema != null) || schema === this.schema) {
          return;
        }
        this.schema = schema;
        this.resetFields();
        this.setValue(this.value);
        return this.value = this.value !== null ? void 0 : void 0;
      };

      ListField.prototype.setValue = function(val, opts) {
        /*
              accepts an array, where each element in the array is the value for a subfield.
              if the optional value `reset` is truthy, then validation state will be reset.
        */

        var value, _i, _len, _ref;
        opts = this._procOpts(opts);
        if (opts != null ? (_ref = opts.path) != null ? _ref.length : void 0 : void 0) {
          return this._applyToSubfield("setValue", opts, val);
        }
        if (val === void 0) {
          val = utils.clone(this["default"]) || [];
        }
        if (!val || !this.schema || utils.isEqual(val, this.getValue())) {
          return;
        }
        if (!(val instanceof Array)) {
          throw JSON.stringify(val) + " must be an array";
        }
        this.resetFields();
        this.value = val;
        for (_i = 0, _len = val.length; _i < _len; _i++) {
          value = val[_i];
          this._addField(this.schema, value);
        }
        this.value = this.value !== null ? void 0 : void 0;
        return this.emit("onValueChanged", {
          value: this.getValue(),
          original: this.value
        });
      };

      ListField.prototype.addField = function(value, index) {
        if ((index != null) && index !== this._fields.length) {
          return;
        }
        return this._addField(this.schema, value);
      };

      ListField.prototype.removeField = function(index) {
        /* remove the field at `index`.
        */

        var value;
        this._getField(index).emit("onFieldDelete");
        value = this.getValue();
        value.splice(index, 1);
        this.setValue(value);
        return this.emit("onValueChanged", {
          value: this.getValue(),
          original: value,
          op: "remove"
        });
      };

      ListField.prototype._getField = function(index) {
        /* get an immediate subfield by index
        */
        return this.getFields()[index];
      };

      ListField.prototype.validate = function(value) {
        var message;
        if (!value.length && this.required) {
          message = this.errorMessages.required;
          this.errors = [utils.interpolate(message, [this.schema.name || (typeof this.schema.field === "string" && this.schema.field.slice(0, -5)) || "item"])];
          return value;
        }
      };

      ListField.prototype.getPath = function(subfield) {
        var end;
        end = [];
        if (subfield) {
          end.push(this.getFields().indexOf(subfield));
        }
        if (this.parent) {
          return this.parent.getPath(this).concat(end);
        } else {
          return end;
        }
      };

      return ListField;

    })(BaseContainerField);
    fields.BaseContainerField = BaseContainerField;
    fields.ContainerField = ContainerField;
    fields.HashField = HashField;
    return fields.ListField = ListField;
  };

  if (typeof window !== "undefined" && window !== null) {
    addFields(window.fields);
  } else if (typeof exports !== "undefined" && exports !== null) {
    module.exports = addFields;
  }

}).call(this);
