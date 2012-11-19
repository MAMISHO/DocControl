// Generated by CoffeeScript 1.3.3
var fields, utils;

if (typeof exports !== "undefined" && exports !== null) {
  fields = require("../coffee/ContainerFields");
  utils = require("../coffee/utils");
}

describe("events", function() {
  beforeEach(function() {
    this.parent = {
      bubble: function(event, args) {
        this.event = event;
        this.args = args;
      }
    };
    this.field = new fields.Field();
    this.field.parent = this.parent;
    return spyOn(this.parent, "bubble");
  });
  it("should call bubble when emit is called; adding a \nnull sender and originator to the arguments", function() {
    spyOn(this.field, "bubble");
    this.field.emit("testEvent", {
      a: 1,
      b: 2
    });
    return expect(this.field.bubble).toHaveBeenCalledWith("testEvent", null, {
      originator: this.field,
      a: 1,
      b: 2
    });
  });
  it("should call event handler specific to event if it exists", function() {
    this.field.handlers = {
      testEvent: function(inSender, inEvent) {},
      "*": function(inSender, inEvent) {}
    };
    spyOn(this.field.handlers, "testEvent");
    spyOn(this.field.handlers, "*");
    this.field.emit("testEvent", {
      a: 1,
      b: 2
    });
    expect(this.field.handlers.testEvent).toHaveBeenCalledWith(null, {
      originator: this.field,
      a: 1,
      b: 2
    });
    return expect(this.field.handlers["*"]).not.toHaveBeenCalled();
  });
  it("should call wildcard handler if exists and specific handler doesn't", function() {
    this.field.handlers = {
      "*": function(inSender, inEvent) {}
    };
    spyOn(this.field.handlers, "*");
    this.field.emit("testEvent", {
      a: 1,
      b: 2
    });
    return expect(this.field.handlers["*"]).toHaveBeenCalledWith(null, {
      originator: this.field,
      a: 1,
      b: 2
    });
  });
  it("should call method identified by handler if handler is a string", function() {
    this.field.handler = function(inSender, inEvent) {};
    this.field.handlers = {
      testEvent: "handler"
    };
    spyOn(this.field, "handler");
    this.field.emit("testEvent", {
      a: 1,
      b: 2
    });
    return expect(this.field.handler).toHaveBeenCalled();
  });
  it("should stop bubbling event if handler returns true", function() {
    this.field.handlers = {
      testEvent: function(inSender, inEvent) {
        return true;
      }
    };
    this.field.emit("testEvent", {
      a: 1,
      b: 2
    });
    return expect(this.parent.bubble).not.toHaveBeenCalled();
  });
  it("should call any handlers and stop bubbling event if no parent", function() {
    this.field.parent = void 0;
    this.field.handlers = {
      testEvent: function(inSender, inEvent) {}
    };
    spyOn(this.field.handlers, "testEvent");
    this.field.emit("testEvent", {
      a: 1,
      b: 2
    });
    return expect(this.field.handlers.testEvent).toHaveBeenCalled();
  });
  it("should bubble event if handler returns true, updating inSender to itself", function() {
    this.field.handlers = {
      testEvent: function(inSender, inEvent) {
        return false;
      }
    };
    this.field.emit("testEvent", {
      a: 1,
      b: 2
    });
    return expect(this.parent.bubble).toHaveBeenCalledWith("testEvent", this.field, {
      originator: this.field,
      a: 1,
      b: 2
    });
  });
  return it("should bubble event if no handler, updating inSender to itself", function() {
    this.field.handlers = {
      testEvent: function(inSender, inEvent) {
        return false;
      }
    };
    this.field.emit("testEvent", {
      a: 1,
      b: 2
    });
    return expect(this.parent.bubble).toHaveBeenCalledWith("testEvent", this.field, {
      originator: this.field,
      a: 1,
      b: 2
    });
  });
});

describe("class inheritence", function() {
  it("should preserve errorMessages of superclass when none are added", function() {
    var field;
    field = new fields.CharField();
    return expect(field.errorMessages).toEqual({
      required: utils._i('This field is required.')
    });
  });
  it("should add class error messages to superclass messages", function() {
    var field;
    field = new fields.IntegerField();
    return expect(field.errorMessages).toEqual({
      required: utils._i('This field is required.'),
      invalid: utils._i('Enter a whole number.')
    });
  });
  it("should properly update attributes defined by either superclass or class from passed options", function() {
    var field;
    field = new fields.CharField({
      required: false,
      minLength: 5
    });
    expect(field.required).toBe(false);
    return expect(field.minLength).toBe(5);
  });
  return it("should override superclass error messages with subclass messages", function() {
    var field;
    field = new fields.ListField();
    return expect(field.errorMessages).toEqual({
      required: utils._i('There must be at least one %s.'),
      invalid: utils._i('Please fix the errors indicated below.')
    });
  });
});

describe("validation", function() {
  beforeEach(function() {
    return this.field = new fields.Field({
      name: "test"
    });
  });
  it("defaults to required", function() {
    return this.expect(this.field.required).toBe(true);
  });
  it("should not validate if required and no value", function() {
    this.expect(this.field.value).toBe(void 0);
    this.expect(this.field.isValid()).toBe(false);
    this.expect(this.field.errors).toEqual(['This field is required.']);
    this.field.setValue("");
    this.expect(this.field.isValid()).toBe(false);
    this.field.setValue(null);
    return this.expect(this.field.isValid()).toBe(false);
  });
  it("should validate if required and value", function() {
    this.field.setValue(0);
    this.expect(this.field.value).toBe(0);
    this.expect(this.field.isValid()).toBe(true);
    return this.expect(this.field.errors).toEqual([]);
  });
  it("should validate if not required and no value", function() {
    this.field.required = false;
    return this.expect(this.field.isValid()).toBe(true);
  });
  it("should not perform revalidation if nothing has changed", function() {
    this.field.setValue(0);
    this.field.isValid();
    spyOn(this.field, "validate");
    this.field.setValue(0);
    this.field.isValid();
    return expect(this.field.validate).not.toHaveBeenCalled();
  });
  it("should perform revalidation if value has changed", function() {
    this.field.setValue(0);
    this.field.isValid();
    spyOn(this.field, "validate");
    this.field.setValue(1);
    this.field.isValid();
    return expect(this.field.validate).toHaveBeenCalled();
  });
  it("should perform revalidation if the required value has changed", function() {
    this.field.isValid();
    spyOn(this.field, "validate");
    this.field.setRequired(false);
    this.field.isValid();
    return expect(this.field.validate).toHaveBeenCalled();
  });
  it("should emit a validChanged event, with any errors, when its valid status changes or when the errors list changes, but not otherwise", function() {
    this.field = new fields.CharField({
      name: "test",
      minLength: 5
    });
    this.field.handlers.validChanged = function(inSender, inOriginator, valid, errors) {};
    spyOn(this.field.handlers, "validChanged");
    expect(this.field.isValid()).toBe(false);
    expect(this.field.handlers.validChanged).toHaveBeenCalledWith(null, {
      originator: this.field,
      valid: false,
      errors: ['This field is required.']
    });
    this.field.setValue("a");
    expect(this.field.isValid()).toBe(false);
    expect(this.field.handlers.validChanged).toHaveBeenCalledWith(null, {
      originator: this.field,
      valid: false,
      errors: ['Ensure this value has at least 5 characters (it has 1).']
    });
    this.field.setValue("hello");
    expect(this.field.isValid()).toBe(true);
    expect(this.field.handlers.validChanged).toHaveBeenCalledWith(null, {
      originator: this.field,
      valid: true,
      errors: []
    });
    this.field.setValue("hello world");
    expect(this.field.isValid()).toBe(true);
    return expect(this.field.handlers.validChanged.calls.length).toEqual(3);
  });
  return it("should throw an error when getClean is called and it is not valid", function() {
    var _this = this;
    return expect(function() {
      return _this.field.getClean();
    }).toThrow();
  });
});

describe("genField() - field creation", function() {
  return it("should create a field from a schema", function() {
    var field, schema;
    schema = {
      field: "CharField",
      name: "test",
      minLength: 5
    };
    field = utils.genField(schema, fields);
    return expect(field instanceof fields.CharField).toBe(true);
  });
});

describe("field", function() {
  beforeEach(function() {
    return this.field = new fields.Field({
      name: "test",
      value: 5
    });
  });
  it("should emit valueChanged only when its value changes", function() {
    this.field.handlers.valueChanged = function(inSender, inEvent) {};
    spyOn(this.field.handlers, "valueChanged");
    this.field.setValue(5);
    expect(this.field.handlers.valueChanged).not.toHaveBeenCalled();
    this.field.setValue(6);
    expect(this.field.handlers.valueChanged).toHaveBeenCalledWith(null, {
      originator: this.field,
      value: 6,
      original: 5
    });
    return this.field.setValue();
  });
  return it("should emit valueChanged if it is created with a value", function() {
    var parent;
    parent = {
      bubble: function() {}
    };
    spyOn(parent, "bubble");
    this.field = new fields.Field({
      name: "test",
      value: 5,
      parent: parent
    });
    return this.field.setValue(6);
  });
});