widgets.Widget.prototype.defaultSkin = function() {
  var components = [this.inputKind];
  if (!this.noHelpText) {
    var helpKind = enyo.clone(this.helpKind);
    helpKind.fit = true;
    components.push(helpKind);
  }
  if (!this.noLabel) components.unshift(this.labelKind);
  var comp = {
    kind: "FittableColumns",
    classes: "widget",
    components: components
  };
  this.createComponents([comp]);
  this.$.input.addStyles("width:"+(this.size*70-10)+"px;");
};

widgets.BaseContainerWidget.prototype.defaultSkin = function() {
  var components = [this.inputKind];
  if (!this.noHelpText) components.unshift(this.helpKind);
  if (this.containerControlKind) components.push(this.containerControlKind);
  components = [{ components: components, fit: true }];
  if (!this.noLabel) components.unshift(this.labelKind);
  var comp = {
    kind: "FittableColumns",
    components: components
  };
  this.createComponents([comp]);
};

enyo.kind({
  name: "widgets.onyx.Widget",
  kind: "widgets.Widget",
  inputKind: { kind: "onyx.InputDecorator", components: [
    { name: "input", kind: "onyx.Input", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
    ]}
});

enyo.kind({
  name: "widgets.onyx.PasswordWidget",
  kind: "widgets.Widget",
  //* @protected
  inputKind: { kind: "onyx.InputDecorator", components: [
        { name: "input", kind: "onyx.Input", type:"password", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
    ]}
});

//* @public
enyo.kind({
  name: "widgets.onyx.EmailWidget",
  kind: "widgets.Widget",
  //* @protected
  inputKind: { kind: "onyx.InputDecorator", components: [
      { name: "input", kind: "onyx.Input", type: "email", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
    ]}
});

//* @public
enyo.kind({
  name: "widgets.onyx.CheckboxWidget",
  kind: "widgets.Widget",
  //* @protected
  inputKind: { components: [{ name: "input", kind: "onyx.Checkbox", onchange: "onInputChange" }]},
  create: function() {
    this.inputKind = { components: [{ name: "input", kind: "onyx.Checkbox", onchange: "onInputChange", value: this.value }]};
    this.inherited(arguments);
    if (this.$.label) this.$.label.addClass("checkbox");
    if (this.$.helpText) this.$.helpText.addClass("checkbox");
  }
});


//* @public
enyo.kind({
  name: "widgets.onyx.ChoiceWidget",
  kind: "widgets.ChoiceWidget",
  //* @protected
  create: function() {
    this.inherited(arguments);
    this.setChoices(this.choices);
  },
  inputKind: {kind: "onyx.PickerDecorator", components: [
    {},
    { name: "input",
      kind: "onyx.Picker",
      components: []
    }
  ]},
  getValue: function() {
    return this.value;
  },
  setChoices: function(val) {
    val = enyo.clone(val);
    if (this.choicesIndex) {
      for (var k in this.choicesIndex) {
        this.choicesIndex[k].destroy();
      }
      this.choicesIndex = undefined;
    }
    // add unchosen choice if applicable
    if (!this.required || !this.initial) val.unshift([this.nullValue, this.unchosenText]);
    var that = this;
    var choices = {};
    iterChoices = function(x) {
      if (x[1] instanceof Array) x[1].forEach(iterChoices);
      else {
        choices[x[0]] = that.$.input.createComponent({ content: x[1], value: x[0], active: that.value===x[0]});
      }
    };
    val.forEach(iterChoices);
    this.choicesIndex = choices;
  },
  handlers: { onSelect: "itemSelected" },
  itemSelected: function(inSender, inEvent) {
    this.value = inEvent.originator.value;
    this.validate();
  },
  defaultSkin: function() {
    this.inherited(arguments);
    this.$.pickerButton.setStyle("width:"+(this.size*70+8)+"px;");
    if (this.$.label) this.$.label.addClass("picker");
    if (this.$.helpText) this.$.helpText.addClass("picker");
  }
});


enyo.kind({
  name: "widgets.onyx.ChoiceCheckWidget",
  kind: "widgets.onyx.ChoiceWidget",
  //* @protected
  create: function() {
    this.inherited(arguments);
    this.setChoices(this.choices);
  },
  inputKind: { name: "input", kind: "Group", classes: "onyx-sample-tools group", onActivate:"itemSelected", highlander: true, components: []},
  itemKind: {kind:"FittableColumns", style: "padding-top:15px;", components: [
    { components: [{kind:"onyx.Checkbox", checked: true}]},
    { classes: "widget-help checkbox", allowHtml: true }
  ]},
  labelKind: { name: "label", classes: "widget-label checkbox" },
  setChoices: function(val) {
    val = enyo.clone(val);
    if (this.choicesIndex) {
      this.$.input.destroyComponents();
      this.choicesIndex = undefined;
    }
    var that = this;
    var choices = {};
    iterChoices = function(x, i) {
      if (x[1] instanceof Array) x[1].forEach(iterChoices);
      else {
        var comp = enyo.clone(that.itemKind);
        comp.components[0].components[0].value = x[0];
        comp.components[0].components[0].checked = (that.value === x[0]);
        comp.components[1].content = x[1];
        if (!i) delete comp.style;
        choices[x[0]] = that.$.input.createComponent(comp).children[0].children[0];
      }
    };
    val.forEach(iterChoices);
    this.choicesIndex = choices;
  },
  setValue: function(val) {
    var val = (val === null || val === undefined) ? this.nullValue : val;
    this.value = val;
    if (this.choicesIndex && this.choicesIndex[val]) this.choicesIndex[val].setActive();
  },
  defaultSkin: function() {
    widgets.Widget.prototype.defaultSkin.call(this);
    if (this.$.label) this.$.input.setStyle("width:");
    if (this.$.helpText) this.$.label.addClass("checkbox");
  }
});


//* @public
enyo.kind({
  name: "widgets.onyx.ContainerWidget",
  kind: "widgets.ContainerWidget"
  //* @protected
});


//* @public
enyo.kind({
  name: "widgets.onyx.ListWidget",
  kind: "widgets.ListWidget",
  //* @protected
  containerControlKind: { kind: "onyx.IconButton", src:"assets/plus.png", ontap: "addField", style:"margin-top:17px"},
  itemKind: { kind: "widgets.onyx.ListItem" }
});

//* @public
//* wrapper for subfields of a _widgets.ListWidget_. You can subclass and specify it in `ListWidget.itemKind`.
enyo.kind({
  name: "widgets.onyx.ListItem",
  kind: "widgets.ListItem",
  components: [
    { name: "_content", kind: "enyo.Control", fit: true },
    { components: [{ kind: "onyx.IconButton", src:"assets/cross.png", ontap: "handleDelete", style:"margin-top:15px;"}] }
  ]
});

