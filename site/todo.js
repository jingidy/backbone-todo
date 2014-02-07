$(function () {

// Models
var Item = Backbone.Model.extend({
  defaults: function () {
    return {
      title: '',
      created: Date.now(),
      complete: false
    };
  },

  toggle: function () {
    this.save({ complete: !this.get('complete') });
    console.log(this.get('complete'))
  }
});

var ItemsList = Backbone.Collection.extend({
  model: Item,
  localStorage: new Backbone.LocalStorage('enhanced-backbone-todo'),
  comparator: 'created'
});

// Views

var ItemView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#item-template').html()),
  events: {
    'click .complete': 'toggleComplete',
    'click .delete': 'delete',
    'blur .text': 'save',
  },

  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'destroy', this.remove);
  },

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    this.$el.toggleClass('completed', this.model.get('complete'));
    this.input = this.$('.text');
    return this;
  },

  toggleComplete: function () { this.model.toggle(); },

  delete: function () { this.model.destroy(); },

  save: function () {
    value = this.input.val();
    if (!value) this.delete();
    else this.model.save({ title: value });
  },
});

var AppView = Backbone.View.extend({
  el: $('#todoapp'),
  events: {
    'keypress #new-todo': 'createOnEnter'
  },

  initialize: function () {
    this.create$ = this.$('#new-todo');

    this.listenTo(Items,'add', this.addOne);
    this.listenTo(Items, 'reset', this.addAll);

    Items.fetch();
  },

  addOne: function (item) {
    var view = new ItemView( { model: item });
    this.$('#todo-list').append(view.render().el);
  },

  addAll: function () {
    Items.each(this.addOne, this);
  },

  createOnEnter: function (e) {
    if(e.keyCode !== 13) return;
    if (!this.create$.val()) return;
    Items.create({ title: this.create$.val() });
    this.create$.val('');
  }
});

// Finally create the data and the app

var Items = new ItemsList();
var App = new AppView();

});
