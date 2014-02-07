$(function () {

// Models
var Item = Backbone.Model.extend({
  defaults: function () {
    return {
      title: '',
      createDate: Date.now(),
      completeDate: null,
      complete: false
    };
  },

  toggle: function () {
    var newComplete = !this.get('complete');
    this.save({ 
      complete: newComplete,
      completeDate: newComplete ? Date.now() : null,
    });
  }
});

var ItemsList = Backbone.Collection.extend({
  model: Item,
  localStorage: new Backbone.LocalStorage('enhanced-backbone-todo'),
  
  initialize: function () {
    this.on('change:complete', this.sort);
  },

  // Sort incomplete on top, otherwise sort by relevant date
  comparator: function (item1, item2) {
    completed1 = item1.get('complete');
    completed2 = item2.get('complete');
    if (completed2 && !completed1) return -1;
    if (completed1 && !completed2) return 1;
    
    var dateAttr = completed1 ? 'completeDate' : 'createDate';
    date1 = item1.get(dateAttr);
    date2 = item2.get(dateAttr);
    if (date1 > date2) return -1;
    if (date2 > date1) return 1;
    return 0;
  },

  getIncomplete: function () {
    return this.where({ complete: false });
  },

  getCompleted: function () {
    return this.where({ complete: true });
  },
});

// Views

var ItemView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#item-template').html()),
  events: {
    'click .complete': 'toggleComplete',
    'click .delete': 'delete',
    'blur .text': 'save',
    'focus .text': 'blurIfReadonly'
  },

  initialize: function () {
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'destroy', this.remove);
  },

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    var complete = this.model.get('complete');
    this.$el.toggleClass('completed', complete);
    this.input = this.$('.text');
    if (complete) this.input.attr('readonly', true);
    else this.input.removeAttr('readonly');
    return this;
  },

  toggleComplete: function () { this.model.toggle(); },

  delete: function () { this.model.destroy(); },

  save: function () {
    value = this.input.val();
    if (!value) this.delete();
    else this.model.save({ title: value });
  },

  blurIfReadonly: function (e) {
    if (this.input.is('[readonly]')) 
      this.input.blur();
  },
});

var AppView = Backbone.View.extend({
  el: $('#todoapp'),
  events: {
    'keypress #new-todo': 'createOnEnter'
  },

  initialize: function () {
    this.create$ = this.$('#new-todo');

    items.fetch();
    this.addAll();

    this.listenTo(items,'add', this.addOneIncomplete);
    this.listenTo(items, 'reset', this.addAll);
  },

  addOneIncomplete: function (item) {
    var prev = this.$('#todo-list li:not(.completed)').last();
    if (!prev.length) this.addOne(item);
    else {
      var view = new ItemView( { model: item });
      prev.after(view.render().el);
    }
  },

  addOne: function (item) {
    var view = new ItemView( { model: item });
    this.$('#todo-list').append(view.render().el);
  },

  addAll: function () {
    items.each(this.addOne, this);
  },

  createOnEnter: function (e) {
    if(e.keyCode !== 13) return;
    if (!this.create$.val()) return;
    items.create({ title: this.create$.val() });
    this.create$.val('');
  }
});

// Finally create the data and the app

var items = new ItemsList();
var app = new AppView();

});
