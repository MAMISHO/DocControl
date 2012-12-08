if exports?
  utils = require "./utils"
  validators = require "./Validators"
else if window?
  utils = window.utils
  validators = window.validators

class Field
  # the cleaned value accessed via `getClean()`; raises error if invalid; this will be a javascript datatype and should be used for any calculations, etc. Use the toJSON() method to get a version appropriate for serialization.
  clean: undefined,
  # a list of errors for this field.
  errors: [],
  # list of validators; If overriding a parent class, you must include all parent class validators
  validators: [],
  # hash of error messages; If overriding a parent class, you must include all parent class errorMessages
  errorMessages:
    required: utils._i('This field is required.')
  # hash of listeners of the form
  # `'event': (inSender, inEvent) ->`
  # `'event': "handlerMethod"`
  # `'*': "handlerMethod"`
  # wildcard will handle all incoming events
  listeners: {}
  # parent field, set by parent
  parent: undefined
  # kind definition for widget to display (eg { kind: "widget.Widget"}, or simply the string name of the widget kind)
  widget: "widgets.Widget",
  # the name/identifier for this field
  name: undefined
  # whether the current field is required
  required: true
  # the current value of the field
  value: undefined
  # the initial value of the field (for validation)
  initial: undefined
  # the default value of the field. if the set value is undefined, the value will changed to the default value
  default: undefined
  constructor: (opts) ->
    # save an unadulterated copy of opts in @opts
    opts ?= {}
    @opts = utils.clone(opts)
    # compile inherited attributes
    @errorMessages = @_walkProto("errorMessages")
    if opts.errorMessages 
      utils.mixin(@errorMessages, opts.errorMessages)
      delete opts.errorMessages    
    @listeners = {}
    # set initial values; 
    opts.value ?= opts.initial
    opts.initial ?= opts.value
    utils.mixin(this, opts)
    delete @value
    # add this field to its parent's list of subfields (have to do it 
    # here so it can be found when it emits events during construction)
    if @parent?._fields? then @parent._fields.push(this)
    # all fields were sharing the same validators list
    @validators = utils.cloneArray(@validators)
    # announce that a new field has been created
    @emit("onFieldAdd", {schema: @opts, value: opts.value})
    if @setSchema
      schema = utils.clone(@schema)
      delete @schema
      @setSchema(schema, {value: opts.value})
    #set initial value
    @setValue(opts.value)
  # walks the prototype chain collecting all the values off attr and combining them in one.
  _walkProto: (attr) ->
    sup = @constructor.__super__
    if sup?
      return utils.mixin(utils.clone(sup._walkProto(attr)), @[attr])
    else
      return this[attr]
  # get the errors for this field. returns null if no errors.
  getErrors: () ->
    @isValid()
    return if @errors.length then @errors else null
  # First function called in validation process.<br />
  # this function converts the raw value to javascript. `value` is the raw value from
  # `@getValue()`. The function returns the value in the proper javascript format,<br />
  # this function should be able to convert from any type that a widget might supply to the type needed for validation
  toJavascript: (value) ->
    return value
  # for keeping track of whether to emit the validChanged event
  _valid: false
  # whether we need to run the full validation process
  _hasChanged: true
  # Second function called in validation process.<br />
  # Any custom validation logic should be placed here. receives the input, `value`, from `toJavascript`'s output.
  # return the value with any modifications. When validation fails, push an error string
  # from `@errorMessages` onto `@errors`. You can perform string interpolation using
  # utils.utils.interpolate("%(arg)s", {arg: value, ...}).
  # be sure to call `@super <br />
  # default action is to check if the field is required
  validate: (value) ->
    if (validators.isEmpty(value) && @required)
      @errors.push(@errorMessages.required)
    return value
  # Third function called in validation process.<br />
  # You should not have to override this function
  runValidators: (value) ->
    if (validators.isEmpty(value)) then return
    for v in @validators
      try
        v.validate(value)
      catch e
        if (e.code and e.code of @errorMessages)
          message = @errorMessages[e.code]
          if (e.params) then utils.interpolate(message, e.params)
          @errors.push(message)
        else
          @errors.push(e.message)
    return value;
  # primary validation function<br />
  # calls all other validation subfunctions and passes validation info up to parent fields and down to widget, if it exists.<br />
  # returns `true` or `false`
  # only precesses the full validation if hasChanged is true, which is only true if something has changed since the last call to isValid()
  # emits the `validChanged` event if the valid state has changed.
  isValid: (opts) ->
    if not @_hasChanged then return @_valid
    # reset the errors array
    oldErrors = utils.clone(@errors)
    @errors = []
    # call the various validators
    value = @getValue()
    value = @toJavascript(value)
    if (!Boolean(@errors.length)) then value = @validate(value)
    if (!Boolean(@errors.length)) then value = @runValidators(value)
    valid = !Boolean(@errors.length)
    @clean = if valid then value else undefined
    if valid != @_valid or not valid and not utils.isEqual(oldErrors, @errors)
      @emit("onValidChanged", valid: valid, errors: @errors)
      @_valid = valid
    @_hasChanged = false
    return valid
  # return the fild's cleaned data if there are no errors. throws an error if there are validation errors.
  # you will likely have to override this in Field subclasses
  getClean: (opts) ->
    valid = @isValid(opts)
    if not valid
      throw @errors
    return @clean
  # return the field's cleaned data in serializable form if there are no errors. throws an error if there are validation errors.<br />
  # you might have to override this in Field subclasses.
  toJSON: (opts) ->
    return @getClean(opts)
  setRequired: (val) ->
    if val != @required
      @_hasChanged = true
      @required = val
      @emit("onRequiredChanged", {required: @required})
  # You should not have to override this in Field subclasses
  setValue: (val, opts) ->
    if val == undefined then val = @default
    if val != @value
      @_hasChanged = true
      origValue = @value
      @value = val;
      @emit("onValueChanged", value: @getValue(), original: origValue)
  # You should not have to override this in Field subclasses
  getValue: () ->
    return @value;
  # Get an array of the unique path to the field. A ListField's subfields are denoted by an integer representing the index of the subfield.
  # A ContainerField's subfields are denoted by a string or integer representing the key of the subfield.
  # Example:
  # {parent: {child1: hello, child2: [the, quick, brown, fox]}}
  # ["parent", "child2", 1] points to "quick"
  # [] points to {parent: {child1: hello, child2: [the, quick, brown, fox]}}
  getPath: () ->
    # if no parent, then the path is siply the empty list
    if @parent
      return @parent.getPath(this)
    else
      return []
  # get a field given a path 
  getField: (path) ->
    return if path.length > 0 then undefined else this
  # emit an event that bubbles up
  # eventName: name of the event to emit
  # inEvent: optional hash of data to send with the event
  emit: (eventName, inEvent) ->
    inEvent ?= {}
    inEvent.originator = this
    @_bubble(eventName, null, inEvent)

  # handle bubbling to parent
  _bubble: (eventName, inSender, inEvent) ->
    for listener in @_getProtoListeners(eventName, true)
      if listener.apply(this, [inSender, inEvent]) == true then return
    if @parent
      @parent._bubble(eventName, this, inEvent)

  # handle bubbling up the prototype chain
  _getProtoListeners: (eventName, start) ->
    sup = if start then @constructor.prototype else @constructor.__super__
    listener = @listeners[eventName] or @listeners["*"]
    listener = if listener instanceof Function then listener else this[listener]
    listener = if listener? then [listener] else []
    if sup?
      return sup._getProtoListeners(eventName).concat(listener)
    else
      return listener
      


class CharField extends Field
  # The maximum length of the string (optional)
  maxLength: undefined
  # The minimum length of the string (optional)
  minLength: undefined
  constructor: (opts) ->
    super(opts)
    if @maxLength?
      @validators.push(new validators.MaxLengthValidator(@maxLength))
    if @minLength?
      @validators.push(new validators.MinLengthValidator(@minLength))
  toJavascript: (value) ->
    value = if validators.isEmpty(value) then "" else value
    return value




class IntegerField extends Field
  # Maximum value of integer
  maxValue: undefined
  # Minimum value of integer
  minValue: undefined
  errorMessages: {
    invalid: utils._i('Enter a whole number.')
  },
  constructor: (opts) ->
    super(opts)
    if @maxValue?
      @validators.push(new validators.MaxValueValidator(@maxValue))
    if @minValue?
      @validators.push(new validators.MinValueValidator(@minValue))
  parseFn: parseInt
  regex: /^-?\d*$/
  toJavascript: (value) ->
    if typeof(value) == "string" and not value.match(@regex)
      @errors.push(@errorMessages['invalid'])
      return
    value = if validators.isEmpty(value) then undefined else @parseFn(value, 10)
    if value? and isNaN(value)
      @errors.push(@errorMessages['invalid'])
    return value


class FloatField extends IntegerField
  # Maximum number of digits after the decimal point
  maxDecimals: undefined,
  # Minimum number of digits after the decimal point
  minDecimals: undefined,
  # Maximum number of total digits before and after the decimal point
  maxDigits: undefined
  # @protected
  errorMessages:
    invalid: utils._i('Enter a number.')
  constructor: (opts) ->
    super(opts)
    if @maxDecimals?
      @validators.push(new validators.MaxDecimalPlacesValidator(@maxDecimals))
    if @minDecimals?
      @validators.push(new validators.MinDecimalPlacesValidator(@minDecimals))
    if @maxDigits?
      @validators.push(new validators.MaxDigitsValidator(@maxDigits))
  parseFn: parseFloat
  regex: /^\d*\.?\d*$/

# a basic Regex Field for subclassing.
class RegexField extends Field
  # the compiled regex to test against.
  regex: undefined,
  # the error message to display when the regex fails
  errorMessage: undefined
  # @protected
  constructor: (opts) ->
    super(opts)
    @validators.push(new validators.RegexValidator(@regex))
    if @errorMessage
      @errorMessages.invalid = @errorMessage



class EmailField extends RegexField
  widget: "widgets.EmailWidget"
  validators: [new validators.EmailValidator()]

class BooleanField extends Field
  widget: "widgets.CheckboxWidget"
  # @protected
  toJavascript: (value) ->
    if typeof(value) == "string" and includes(["false", "0"], value.toLowerCase())
      value = false
    else
      value = Boolean(value)
    if not value and @required
      @errors.push(@errorMessages.required)
    return value

class NullBooleanField extends BooleanField
  toJavascript: (value) ->
    if includes([true, "True", "1"], value)
      value =  true
    else if includes([false, "False", "0"], value)
      value = false
    else 
      value = null
    return value
  validate: (value) ->
    return value


class ChoiceField extends Field
  widget: "widgets.ChoiceWidget"
  # Array of 2-arrays specifying valid choices. if 2-arrays, first value is value, second is display. create optgroups by setting display If display value to a 2-array. MUST USE SETTER.
  choices: []
  errorMessages:
    invalidChoice: utils._i('Select a valid choice. %(value)s is not one of the available choices.')
  constructor: (opts) ->
    if opts.choices then this.choices = opts.choices
    @setChoices(utils.cloneArray(@choices))
    super(opts)

  setChoices: (val) ->
    choices = {};
    iterChoices = (x) ->
      if (x[1] instanceof Array) then utils.forEach(x[1], iterChoices)
      else choices[x[0]] = x[1];
    utils.forEach(@choices, iterChoices)
    @choicesIndex = choices
  toJavascript: (value) ->
    value = if validators.isEmpty(value) then "" else value
    return value
  validate: (value) ->
    value = super(value)
    if value and not @validValue(value)
      message = @errorMessages.invalidChoice
      @errors = [ utils.interpolate(message, [value]) ]
    return value
  validValue: (val) ->
    return val of @choicesIndex
  getDisplay: () ->
    return @choices[@getClean()]

fields =
  Field: Field
  CharField: CharField
  IntegerField: IntegerField
  FloatField: FloatField
  RegexField: RegexField
  EmailField: EmailField
  BooleanField: BooleanField
  NullBooleanField: NullBooleanField
  ChoiceField: ChoiceField
  # get a variable from the global variable, g, identified by a dot-delimited string
  getField: (path) ->
    path = path.split(".")
    out = this
    for part in path
      out = out[part]
    return out
  # generate a field from its schema
  genField: (schema, parent, value) ->
    schema = utils.clone(schema)
    schema.parent = parent
    if value? then schema.value = value
    field = @getField(schema.field)
    if not field then throw Error("Unknown field: "+ schema.field)
    return new field(schema)


if window?
  window.fields = fields
else if exports?
  require("./ContainerFields")(fields)
  module.exports = fields