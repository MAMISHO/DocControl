enyo.kind({
  name: "Field",
  kind: "Control",
  published: {
    //* whether the current field is required
    required: true,
    //* the current value of the field; this should be used for setting ui elements.
    value: undefined,
    //* the cleaned value; raises error if invalid; this will be a javascript datatype and should be used for any calculations, etc. You should use the toJSON() method to get a version appropriate for serialization.
    clean: undefined,
    //* list of validators
    validators: [],
    //* kind definition for widget (eg { kind: "Widget"})
    widget: "Widget",
    //* hash of attibutes to set on widget (eg `label`, `initial`)
    widgetAttrs: {},
    //* hash of error messages
    errorMessages: {
      required: _i('This field is required.')
    }
  },
  // the initial value of the field
  initial: undefined,
  events: {
    onValidation: "",
  },
  beforeWidgetInit: function () {},
  create: function() {
    // all fields were sharing the same validators list
    this.validators = enyo.cloneArray(this.validators);
    this.inherited(arguments);
    this.setWidget(this.widget);
    this.beforeWidgetInit();
    this.requiredChanged();
    if (this.value !== undefined) this.setValue(this.value);
    this.widgetAttrs.fieldName = this.getName();
  },
  handlers: {
    onRequestValidation: "onRequestValidation",
    onDelete: "onDelete"
  },
  onRequestValidation: function() {
    this.isValid();
  },
  onDelete: function(inSender, inEvent) {
    if (inEvent.originator instanceof Widget) {
      // we hijack inEvent.originator to point to the originating Field, not the originating widget.
      inEvent.originator = this;
    }
  },
  toJavascript: function() {
    this.clean = this.getValue();
  },
  validate: function() {
    if (validators.isEmpty(this.getValue()) && this.required) {
      this.errors.push(this.errorMessages.required);
    }
  },
  runValidators: function() {
    var i;
    value = this.clean;
    if (validators.isEmpty(value)) return;
    for (i = 0; i < this.validators.length; i++) {
      v = this.validators[i];
      try {
        v.validate(value);
      }
      catch(e) {
        if (e.code && e.code in this.errorMessages) {
          message = this.errorMessages[e.code];
          if (e.params) interpolate(message, e.params);
          this.errors.push(message);
        } else {
          this.errors.push(e.message);
        }
      }
    }
  },
  isValid: function() {
    // reset the errors array
    this.errors = [];
    // call the various validators
    this.toJavascript();
    this.validate();
    this.runValidators();
    var valid = !Boolean(this.errors.length);
    this.$.widget.setErrorMessage(this.errors[0]);
    this.$.widget.setValid(valid);
    this.$.widget.validatedOnce = true;
    this.doValidation({valid: valid});
    return valid;
  },
  getClean: function() {
    valid = this.isValid();
    if (!valid) {
      throw this.errors;
    }
    return this.clean;
  },
  toJSON: function() {
    return this.getClean();
  },
  requiredChanged: function() {
    this.$.widget.setRequired(this.required);
  },
  setValue: function(val) {
    this.$.widget.setValue(val);
  },
  getValue: function() {
    return this.$.widget.getValue();
  },
  setWidget: function(widget) {
    widget = (typeof(widget)=="string") ? { kind: widget } : widget;
    this.destroyComponents();
    widget = enyo.clone(widget);
    widget.name = "widget";
    widget.initial = this.initial;
    widget = enyo.mixin(widget, this.widgetAttrs);
    this.createComponent(widget);
  },
  getWidget: function() {
    return this.$.widget;
  },
  setWidgetAttrs: function(attrs) {
    var k;
    for (k in attrs) {
      var v = attrs[k];
      k = "set" + k[0].toUpperCase()+k.substring(1);
      this.$.widget[k](v);
    }
  }
});


enyo.kind({
  name: "BaseContainerField",
  kind: "Field",
  published: {
    //* A single instance of a kind definition object, such as `{kind: "CharField", maxLength: 50 }`, the list will consist of an arbitrary number of a single kind of that field
    schema: undefined
  },
  errorMessages: {
    required: _i('There must be at least one %s.'),
    invalid: _i('Please fix the errors indicated below.')
  },
  beforeWidgetInit: function() {
    this.schemaChanged();
  },
  handlers: {
    onValidation: "onValidation"
  },
  // number of invalid subfields
  validCounter: 0,
  // hash of invalid subfields (to prevent duplication)
  invalidFields: {},
  onValidation: function(inSender, inEvent) {
    if (inEvent.valid && inSender in this.invalidFields) {
      delete this.invalidFields[inSender];
      if (!--this.validCounter) {
        this.errors = [];
      }
    } else if (!inEvent.valid) {
      this.invalidFields[inSender] = true;
      this.errors = [this.errorMessages.invalid];
    }
  },
  isValid: function() {
    // reset the errors array
    this.errors = [];
    this.validate();
    valid = this.listFields().reduce(function(x, y) {return y.isValid() && x;}, true);
    if (!valid) {
      this.errors = [this.errorMessages.invalid];
    }
    valid = !this.errors.length;
    this.$.widget.setErrorMessage(this.errors[0]);
    this.$.widget.setValid(valid);
    this.$.widget.validatedOnce = true;
    return valid;
  },
  listFields: function() {
    return this.$.widget.listFields();
  },
  schemaChanged: function() {
    return this.$.widget.setFields(this.schema);
  },
  throwValidationError: function() {
    // test for validity, throw error if not valid
    if (!this.isValid()) { throw this.errors; }
  }
});

enyo.kind({
  name: "ContainerField",
  kind: "BaseContainerField",
  published: {
    //* A list of kind definition objects such as `[{kind: "CharField", maxLength: 50 }, {kind:IntegerField }`. It will contain the specified list of heterogenious fields.
    schema: undefined
  },
  widget: "ContainerWidget",
  validate: function() {},
  getClean: function() {
    this.throwValidationError();
    var out = {};
    this.listFields().forEach(function(x) { out[x.getName()] = x.getClean(); });
    return out;
  },
  toJSON: function() {
    this.throwValidationError();
    var out = {};
    this.listFields().forEach(function(x) { out[x.getName()] = x.toJSON(); });
    return out;
  }
});

enyo.kind({
  name: "ListField",
  kind: "BaseContainerField",
  widget: "ListWidget",
  validate: function() {
    if (!this.listFields().length && this.required) {
      var message = this.errorMessages.required;
      this.errors = [interpolate(message, [this.schema.name || this.schema.kind.slice(0,-5)])];
      return;
    }
  },
  getClean: function() {
    this.throwValidationError();
    return this.listFields().map(function(x) {x.getClean();});
  },
  fieldsChanged: function() {
    this.$.widgetAttrs.setFields(this.fields);
  },
  toJSON: function() {
    this.throwValidationError();
    return this.listFields().map(function(x) {x.toJSON();});
  },
  addField: function(value) {
    this.$.widget.addField(value);
  },
  removeField: function(index) {
    this.$.widget.removeField(index);
  },
  onDelete: function(inSender, inEvent) {
    if (inEvent.originator instanceof Widget) {
      // we hijack the originator to point to the originating field not the originating widget
      inEvent.originator = this;
    }
    else {
      // delete the field at inEvent.originator.
      var i = this.listFields().indexOf(inEvent.originator);
      if (i < 0) throw "Field to delete not found";
      this.removeField(i);
      return true;
    }
  }
});







enyo.kind({
  name: "CharField",
  kind: "Field",
  published: {
    maxLength: undefined,
    minLength: undefined
  },
  create: function() {
    this.inherited(arguments);
    if (this.maxLength !== undefined) {
      this.validators.push(new validators.MaxLengthValidator(this.maxLength));
    }
    if (this.minLength !== undefined) {
      this.validators.push(new validators.MinLengthValidator(this.minLength));
    }
  },
  toJavascript: function() {
    var value = (validators.isEmpty(this.getValue())) ? "" : this.getValue();
    this.clean = value;

  // TODO: need to be able to set widget attributes
  }
});

enyo.kind({
  name: "IntegerField",
  kind: "Field",
  published: {
    maxValue: undefined,
    minValue: undefined
  },
  errorMessages: {
    required: _i('This field is required.'),
    invalid: _i('Enter a whole number.')
  },
  create: function() {
    this.inherited(arguments);
    if (this.maxValue !== undefined) {
      this.validators.push(new validators.MaxValueValidator(this.maxValue));
    }
    if (this.minValue !== undefined) {
      this.validators.push(new validators.MinValueValidator(this.minValue));
    }
  },
  parseFn: parseInt,
  toJavascript: function() {
    value = this.getValue();
    var value = (validators.isEmpty(value)) ? undefined : this.parseFn(value, 10);
    if (value === undefined) {
      this.clean = undefined;
    } else if (isNaN(value)) {
      this.errors.push(this.errorMessages['invalid']);
    } else {
      this.clean = value;
    }
  }
});

enyo.kind({
  name: "FloatField",
  kind: "IntegerField",
  published: {
    maxDecimals: undefined,
    minDecimals: undefined,
    maxDigits: undefined
  },
  errorMessages: {
    required: _i('This field is required.'),
    invalid: _i('Enter a number.')
  },
  create: function() {
    this.inherited(arguments);
    if (this.maxDecimals !== undefined) {
      this.validators.push(new validators.MaxDecimalPlacesValidator(this.maxDecimals));
    }
    if (this.minDecimals !== undefined) {
      this.validators.push(new validators.MinDecimalPlacesValidator(this.minDecimals));
    }
    if (this.maxDigits !== undefined) {
      this.validators.push(new validators.MaxDigitsValidator(this.maxDigits));
    }
  },
  parseFn: parseFloat
});

enyo.kind({
  name: "RegexField",
  kind: "Field",
  published: {
    //* the compiled regex to test against.
    regex: undefined,
    //* the error message to display when the regex fails
    errorMessage: undefined
  },
  create: function() {
    this.inherited(arguments);
    this.validators.push(new RegexValidator(this.regex));
    if (this.errorMessage) {
      this.errorMessages.invalid = this.errorMessage;
    }
  }
});

enyo.kind({
  name: "EmailField",
  kind: "Field",
  widget: "EmailWidget",
  validators: [new validators.EmailValidator()]
});


enyo.kind({
  name: "BaseTemporalField",
  kind: "Field",
  errorMessages: {
    required: _i('This field is required.'),
    invalid: _i('Enter a Date/Time.')
  },
  timeToJavascript: function(val) {
    re = /([012]?\d):?([012345]\d):?([012345]\d)?\s*(am|pm)?/i;
    var match = val.match(re);
    if (match && parseInt(match[1], 10) < 25) {
      var hour = parseInt(match[1], 10);
      hour = (match[4] == "pm" && hour < 12) ? hour+12 : hour;
      hour = (match[4] == "am" && hour == 12) ? 0 : hour;
      var minute = parseInt(match[2], 10);
      var second = (match[3]) ? parseInt(match[3], 10) : 0;
      var timezone = new Date().getTimezoneOffset();
      // TODO finish this function and dateToJavascript helper function

    } else {
      this.errors.push(this.errorMessages['invalid']);
    }
  }
});

enyo.kind({
  name: "BooleanField",
  kind: "Field",
  widget: "CheckboxWidget",
  toJavascript: function() {
    var value = this.getValue();
    if (typeof(value) == "string" && value.toLowerCase() in {"false":"", "0":""}) {
      value = false;
    }
    else {
      value = Boolean(value);
    }
    if (!value && this.required) {
      this.errors.push(this.errorMessages.required);
    }
    this.clean = value;
  }
});

enyo.kind({
  name: "NullBooleanField",
  kind: "Field",
  widget: "CheckboxWidget",
  toJavascript: function() {
    var value = this.getValue();
    if (includes([true, "True", "1"], value)) { value =  true; }
    else if (includes([false, "False", "0"], value)) { value = false; }
    else { value = null; }
    this.clean = value;
  },
  validate: function() {
    return;
  }
});

enyo.kind({
  name: "ChoiceField",
  kind: "Field",
  widget: "ChoiceWidget",
  errorMessages: {
    'invalidChoice': _i('Select a valid choice. %(value)s is not one of the available choices.')
  },
  published: {
    //* Array of 2-arrays specifying valid choices. if 2-arrays, first value is value, second is display. create optgroups by setting display If display value to a 2-array. MUST USE SETTER.
    choices: {}
  },
  setChoices: function(val) {
    choices = {};
    iterChoices = function(x) {
      if (x[1] instanceof Array) x[1].forEach(iterChoices);
      else choices[x[0]] = x[1];
    },
    val.forEach(iterChoices);
  },
  toJavascript: function() {
    var value = (validators.isEmpty(this.getValue())) ? "" : this.getValue();
    this.clean = value;
  },
  validate: function() {
    this.inherited();
    var value = this.getValue();
    if (value && !this.validValue(value))
      var message = this.errorMessages.invalidChoices;
      this.errors = [interpolate(message, [value])];
  },
  validValue: function(val) {
    if (val in this.choices) return true;
    return false;
  },
  getDisplay: function() {
    return this.choices[this.getClean()];
  }
});
