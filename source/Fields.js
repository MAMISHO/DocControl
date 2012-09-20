/**
    _fields.Field_ is the base kind for creating Fields. All Fields must be a subclass of Field for the DocControl machinery to work.

*/
enyo.kind({
  name: "fields.Field",
  kind: "Control",
  published: {
    //* whether the current field is required
    required: true,
    //* the current value of the field
    value: undefined,
    //* the cleaned value accessed via `getClean()`; raises error if invalid; this will be a javascript datatype and should be used for any calculations, etc. Use the toJSON() method to get a version appropriate for serialization.
    clean: undefined,
    //* list of validators; If overriding a parent class, you must include all parent class validators
    validators: [],
    //* kind definition for widget (eg { kind: "widget.Widget"})
    widget: "widgets.Widget",
    //* hash of attibutes to set on widget (eg `{label: ..., initial: ...}`)
    widgetAttrs: {},
    //* hash of error messages; If overriding a parent class, you must include all parent class errorMessages
    errorMessages: {
      required: _i('This field is required.')
    },
    //* display method.
    //*  <ul><li> `null` or `undefined`:  no widget</li>
    //* <li>"display": non-editable view of widget (not yet implemented) </li>
    //* <li>"visible": standard edit widget</li></ul>
    display: "visible"
  },
  //* the initial value of the field.
  initial: undefined,
  //* @protected
  events: {
    //* called on validation completed to pass validation information to parent container so it can properly set it's valid state
    onValidation: "",
    //* called on creation to register field with its container
    onFieldRegistration: ""
  },
  create: function() {
    // all fields were sharing the same validators list
    this.validators = enyo.cloneArray(this.validators);
    this.inherited(arguments);
    //set initial value, if no value specified
    this.value = (this.value === undefined) ? this.initial : this.value;
    // we are displaying this field, then create the widget.
    if (this.display) {
      //prepare widget by creating or cloning the widget kind
      this.widget = (typeof(this.widget)=="string") ? { kind: this.widget } : enyo.clone(this.widget);
      // then add widget attributes
      var widgetAttrs = enyo.mixin(this.widgetAttrs, {name: "widget", required: this.required, value: this.value });
      this.widget = enyo.mixin(this.widget, widgetAttrs);
      // call prepareWidget, which is implemented by subclasses.
      this.prepareWidget();
      // create the component
      this.createComponent(this.widget);
      this.widgetAttrs.fieldName = this.getName();
    }
    // send event to register this field with it's container
    this.doFieldRegistration();
  },
  handlers: {
    //* a widget will request validation by sending an onRequestValidation event.
    onRequestValidation: "onRequestValidation",
    //* a listItem wrapping a widget will request deletion of the field by sending an onDelete event.
    onDelete: "onDelete"
  },
  //* perform validation for the widget
  onRequestValidation: function() {
    this.isValid();
  },
  //* pass the onDelete event on to the container.
  onDelete: function(inSender, inEvent) {
    if (inEvent.originator instanceof Widget) {
      // we hijack inEvent.originator to point to the originating Field, not the originating listItem.
      inEvent.originator = this;
    }
  },
  //* reset the validation state of the field and associated widget.
  reset: function() {
    this.errors = [];
    if (this.display) {
      this.$.widget.setErrorMessage(this.errors[0]);
      this.$.widget.setValid(true);
      this.$.widget.validatedOnce = false;
    }
  },
  //* @public
  //* First function called in validation process.<br />
  //* this function converts the raw value to javascript (from `this.getValue()`, and places it in the `this.clean` attribute<br />
  //* this function should be able to convert from any type that a widget might supply to the type needed for validation
  toJavascript: function() {
    this.clean = this.getValue();
  },
  //* Second function called in validation process.<br />
  //* Any custom validation logic should be placed here. When validation fails, push an error string
  //* from `this.errorMessages` onto `this.errors`. You can perform string interpolation using
  //* utils.interpolate(string "%(arg)s", {arg: value, ...})
  //* be sure to call `this.inherited()`<br />
  //* default action is to check if the field is required
  validate: function() {
    if (validators.isEmpty(this.getValue()) && this.required) {
      this.errors.push(this.errorMessages.required);
    }
  },
  //* Third function called by in validation process.<br />
  //* You should not have to override this function
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
  //* primary validation function<br />
  //* calls all other validation subfunctions and passes validation info up to parent fields and down to widget, if it exists.<br />
  //* returns `true` or `false`
  isValid: function() {
    // reset the errors array
    this.errors = [];
    // call the various validators
    this.toJavascript();
    this.validate();
    this.runValidators();
    var valid = !Boolean(this.errors.length);
    // if there is a widget, pass validation info
    if (this.display) {
      this.$.widget.setErrorMessage(this.errors[0]);
      this.$.widget.setValid(valid);
      this.$.widget.validatedOnce = true;
    }
    this.doValidation({valid: valid});
    return valid;
  },
  //* return the fild's cleaned data if there are no errors. throws an error if there are validation errors.
  //* you will likely have to override this in Field subclasses
  getClean: function() {
    valid = this.isValid();
    if (!valid) {
      throw this.errors;
    }
    return this.clean;
  },
  //* return the field's cleaned data in serializable form if there are no errors. throws an error if there are validation errors.<br />
  //* you might have to override this in Field subclasses.
  toJSON: function() {
    return this.getClean();
  },
  //* useful for subclassing. set any needed attributes on `this.widget` kind definition before widget is created.
  prepareWidget: function() {},
  //* @protected
  //* you cannot set `clean` manually
  setClean: function() { throw "clean not settable. use setValue, instead."; },
  requiredChanged: function() {
    if (this.display) this.$.widget.setRequired(this.required);
  },
  //* You should not have to override this in Field subclasses
  setValue: function(val) {
    if (this.display) {
      this.$.widget.setValue(val);
    } else {
      this.value = val;
    }
  },
  //* You should not have to override this in Field subclasses
  getValue: function() {
    if (this.display) {
      return this.$.widget.getValue();
    } else {
      return this.value;
    }
  },
  getWidget: function() {
    return (this.display) ? this.$.widget : null;
  },
  //* helper function for setting widget attributes on a field for quick definition of a complete schema
  setWidgetAttrs: function(attrs) {
    var k;
    for (k in attrs) {
      var v = attrs[k];
      k = "set" + k[0].toUpperCase()+k.substring(1);
      this.$.widget[k](v);
    }
  }
});






//* @public
enyo.kind({
  name: "fields.CharField",
  kind: "fields.Field",
  published: {
    //* The maximum lengthh of the string (optional)
    maxLength: undefined,
    //* The minimum length of the string (optional)
    minLength: undefined
  },
  //* @protected
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


//* @public
enyo.kind({
  name: "fields.IntegerField",
  kind: "fields.Field",
  published: {
    //* Maximum value of integer
    maxValue: undefined,
    //* Minimum value of integer
    minValue: undefined
  },
  //* @protected
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
  regex: /^\d*$/,
  toJavascript: function() {
    value = this.getValue();
    if (!value.match(this.regex)) {
      this.errors.push(this.errorMessages['invalid']);
      return;
    }
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

//* @public
enyo.kind({
  name: "fields.FloatField",
  kind: "fields.IntegerField",
  published: {
    //* Maximum number of digits after the decimal point
    maxDecimals: undefined,
    //* Minimum number of digits after the decimal point
    minDecimals: undefined,
    //* Maximum number of total digits before and after the decimal point
    maxDigits: undefined
  },
  //* @protected
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
  parseFn: parseFloat,
  regex: /^\d*\.?\d*$/
});

//* @public
//* a basic Regex Field for subclassing.
enyo.kind({
  name: "fields.RegexField",
  kind: "fields.Field",
  published: {
    //* the compiled regex to test against.
    regex: undefined,
    //* the error message to display when the regex fails
    errorMessage: undefined
  },
  //* @protected
  create: function() {
    this.inherited(arguments);
    this.validators.push(new RegexValidator(this.regex));
    if (this.errorMessage) {
      this.errorMessages.invalid = this.errorMessage;
    }
  }
});

//* @public
//* validates the value is a valid email
enyo.kind({
  name: "fields.EmailField",
  kind: "fields.Field",
  widget: "widgets.EmailWidget",
  //* @protected
  validators: [new validators.EmailValidator()]
});

//* @public
//* a baseclass for Temporal Fields (date, time, datetime)
enyo.kind({
  name: "fields.BaseTemporalField",
  kind: "fields.Field",
  errorMessages: {
    required: _i('This field is required.'),
    invalid: _i('Enter a Date/Time.')
  },
  //* Convert a time string to javascript
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

//* @public
//* Boolean Field. Normalizes to a `true` or `false` value - undefined normalizes to `false`. Validates that the value is `true` (e.g. the check box is checked) if the field has `required:true`.<br />
//* Since all Field subclasses have `required:true` by default, the validation condition here is important. If you want to include a boolean in your form that can be either `true` or `false` (e.g. a checked or unchecked checkbox), you must remember to pass in `required:false` when creating the BooleanField.
enyo.kind({
  name: "fields.BooleanField",
  kind: "fields.Field",
  widget: "widgets.CheckboxWidget",
  //* @protected
  toJavascript: function() {
    var value = this.getValue();
    if (typeof(value) == "string" && includes(["false", "0"], value.toLowerCase())) {
      value = false;
    } else {
      value = Boolean(value);
    }
    if (!value && this.required) {
      this.errors.push(this.errorMessages.required);
    }
    this.clean = value;
  }
});

//* @public
//* Normalizes to a `true`, `false` or `null` value. Will not check for required.
enyo.kind({
  name: "fields.NullBooleanField",
  kind: "fields.Field",
  widget: "widgets.CheckboxWidget",
  //* @protected
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

//* @public
//* a field that ensures its value is contained in the list of valid `choices`.
enyo.kind({
  name: "fields.ChoiceField",
  kind: "fields.Field",
  widget: "widgets.ChoiceWidget",
  published: {
    //* Array of 2-arrays specifying valid choices. if 2-arrays, first value is value, second is display. create optgroups by setting display If display value to a 2-array. MUST USE SETTER.
    choices: []
  },
  //* @protected
  errorMessages: {
    'invalidChoice': _i('Select a valid choice. %(value)s is not one of the available choices.')
  },
  create: function() {
    this.inherited(arguments);
    this.choicesChanged();
  },

  //* this function creates the widget.
  prepareWidget: function() {
    this.widget.choices = this.choices;
  },
  choicesChanged: function() {
    choices = {};
    iterChoices = function(x) {
      if (x[1] instanceof Array) x[1].forEach(iterChoices);
      else choices[x[0]] = x[1];
    };
    this.choices.forEach(iterChoices);
    this.choicesIndex = choices;
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
      this.errors = [ interpolate(message, [value]) ];
  },
  validValue: function(val) {
    if (val in this.choices) return true;
    return false;
  },
  getDisplay: function() {
    return this.choices[this.getClean()];
  }
});
