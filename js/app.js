
// Fastclick
new FastClick(document.body);

// Ember App

App = Ember.Application.create();

App.Router.map(function() {
  this.route('intro');
  this.route('pre');
  this.route('test');
  this.route('result');
});

App.IndexRoute = Em.Route.extend({
  redirect: function() {
    this.transitionTo('intro');
  }
});

App.IntroRoute = Em.Route.extend({
  model: function() {
    return this.store.find('corsi', 1);
  }
});

App.PreRoute = Em.Route.extend({
  model: function() {
    return this.store.find('corsi', 1);
  }
});

App.TestRoute = Em.Route.extend({
  model: function() {
    return this.store.find('corsi', 1);
  }
});

App.ResultRoute = Em.Route.extend({
  model: function() {
    return this.store.find('corsi', 1);
  }
});

App.IntroView = Em.View.extend({
  didInsertElement: function() {
    // reset test properties
    var controller = this.get('controller');
    controller.setProperties({
      'level': 1,
      'clicks': 1,
      'tapErrors': 0,
      'errCount': 0
    });
  }
});

App.PreView = Em.View.extend({
  didInsertElement: function() {
    var level = this.get('controller.level');

    var counter = 1;
    while (level >= counter) {
      this.$('#small-btn-' + counter).addClass('btn-flash');
      counter += 1;
    }
  },
  willDestroyElement: function() {
    this.$('.small-btns').find('.btn').removeClass('btn-flash');
  }
});

App.TestView = Em.View.extend({
  willDestroyElement: function() {
    var controller = this.get('controller');
    controller.setProperties({
      'clicks': 1,
      'tapErrors': 0
    });

    this.$('.test-btns').toggleClass('animation play');
    this.$('.btn').removeClass('btn-flash-show btn-flash btn-danger');
    this.$('.message').empty();
  },
  didInsertElement: function() {
    // set elements to  canvas
    this.setElements();
  },
  setElements: function() {
    var that = this;
    // shuffle arrays then pick up the first grid and shuffle its positions.
    var positions = _.shuffle(_.first(_.shuffle(randomGrids)));

    that.$('.test-btns').addClass('animation');
    that.$('.screen').removeClass('hidden');

    positions.forEach(function(position, index) {
      that.$('#btn-' + (index + 1)).css({
        'left': position.left,
        'top': position.top,
        'visibility': 'visible'
      });
    });

    // when elements are in position start animation with small delay
    Ember.run.next(function() {
      setTimeout(function() {
        that.flashElements();
      }, 500);
    });
  },
  flashElements: function() {
    var level = this.get('controller').get('level'),
      iteration = 1,
      that = this;

    var flashInterval = setInterval(function() {
      var $btn = that.$('#btn-' + iteration);

      $btn.addClass('btn-flash');
      setTimeout(function() {
        $btn.removeClass('btn-flash');
      }, 1300);

      if (iteration >= level) {
        clearInterval(flashInterval);
        setTimeout(function() {
          that.$('.test-btns').toggleClass('animation play');
          that.$('.screen').addClass('hidden');
        }, 2000);
      }

      iteration += 1;
    }, 2500);
  },
  click: function(evt) {
    var $tgt = $(evt.target);

    if (!$tgt.hasClass('btn')) return false;

    this.testEvent($tgt.text());
  },
  testEvent: function(value) {
    var that = this,
      counter = 1;

    var controller = that.get('controller'),
      clicks = controller.get('clicks'),
      level = controller.get('level'),
      tapErrors = controller.get('tapErrors'),
      errCount = controller.get('errCount');

    if (clicks != value) { // if false answer increment error count
      controller.set('tapErrors', tapErrors + 1);
      that.$('#btn-' + clicks).addClass('error'); // add error marker
    }

    if (level > clicks) {
      // incr. clicks
      controller.set('clicks', clicks + 1);
    } else {
      // highlight elements
      counter = 1;
      while (level >= counter) {
        that.$('#btn-' + counter).addClass('btn-flash-show');
        counter += 1;
      }
      // highlight errors
      that.$('.error').toggleClass('error btn-danger');

      if (controller.get('tapErrors') === 0) {
        $('.message').html('Vastasit tehtävään <strong>oikein</strong>.');
      } else if (controller.get('errCount') === 0) {
        $('.message').html('Vastasit tehtävään <strong>väärin</strong>. Yritä uudelleen.');
      } else {
        $('.message').html('Vastasit tehtävään <strong>väärin</strong>. Testi päättyy.');
      }

      setTimeout(function() {
        if (controller.get('tapErrors') === 0) {
          controller.set('errCount', 0);
          controller.set('level', level + 1);
        } else {
          errCount += 1;
          controller.set('errCount', errCount);
        }

        if (errCount > 1) {
          controller.transitionToRoute('result');
        } else {
          controller.transitionToRoute('pre');
        }

      }, 4000);

    }
  }
});

// Helpers

Em.Handlebars.registerBoundHelper('multiply', function(count, word) {
  return (count > 1) ? word + 'ta' : word;
});

Em.Handlebars.registerBoundHelper('conclusion', function(level) {
  var clause;

  if (level < 5) {
    clause = 'joten tuloksesi oli tavallista suoritusta heikompi.';
  } else if (level == 5) {
    clause = 'joten tuloksesi oli aivan väestön keskiarvon mukainen.';
  } else {
    clause = 'joten tuloksesi oli tavallista suoritusta parempi.';
  }

  return clause;
});

// Model

App.ApplicationAdapter = DS.FixtureAdapter;

App.Corsi = DS.Model.extend({
  level: DS.attr('number'),
  clicks: DS.attr('number'),
  tapErrors: DS.attr('number'),
  errCount: DS.attr('number')
});

App.Corsi.FIXTURES = [{
  id: 1,
  level: 1,
  clicks: 1,
  tapErrors: 0,
  errCount: 0
}];

// Random bits

var randomGrids = [
  [{"top":68,"left":43},{"top":391,"left":298},{"top":32,"left":299},{"top":19,"left":628},{"top":188,"left":562},{"top":360,"left":56},{"top":214,"left":211},{"top":227,"left":389},{"top":370,"left":614}],
  [{"top":28,"left":378},{"top":259,"left":228},{"top":40,"left":129},{"top":68,"left":570},{"top":376,"left":449},{"top":360,"left":56},{"top":201,"left":56},{"top":199,"left":395},{"top":251,"left":618}],
  [{"top":30,"left":323},{"top":212,"left":200},{"top":24,"left":75},{"top":35,"left":599},{"top":333,"left":381},{"top":360,"left":56},{"top":372,"left":530},{"top":174,"left":414},{"top":224,"left":597}],
  [{"top":20,"left":406},{"top":190,"left":238},{"top":24,"left":75},{"top":32,"left":632},{"top":335,"left":261},{"top":360,"left":56},{"top":380,"left":470},{"top":166,"left":447},{"top":234,"left":592}],
  [{"top":182,"left":173},{"top":24,"left":224},{"top":24,"left":75},{"top":394,"left":123},{"top":335,"left":261},{"top":26,"left":447},{"top":374,"left":499},{"top":166,"left":447},{"top":234,"left":592}],

  [{"top":160,"left":211},{"top":27,"left":383},{"top":24,"left":75},{"top":394,"left":123},{"top":306,"left":312},{"top":91,"left":591},{"top":374,"left":499},{"top":167,"left":452},{"top":234,"left":592}],
  [{"top":179,"left":202},{"top":14,"left":347},{"top":27,"left":642},{"top":382,"left":137},{"top":329,"left":282},{"top":245,"left":61},{"top":381,"left":499},{"top":156,"left":453},{"top":240,"left":595}],
  [{"top":160,"left":293},{"top":16,"left":165},{"top":390,"left":648},{"top":382,"left":137},{"top":329,"left":282},{"top":166,"left":80},{"top":349,"left":472},{"top":113,"left":453},{"top":226,"left":618}],
  [{"top":106,"left":201},{"top":22,"left":381},{"top":381,"left":620},{"top":404,"left":405},{"top":344,"left":219},{"top":157,"left":42},{"top":397,"left":33},{"top":30,"left":615},{"top":195,"left":532}],
  [{"top":102,"left":204},{"top":250,"left":218},{"top":381,"left":620},{"top":204,"left":501},{"top":209,"left":359},{"top":22,"left":384},{"top":362,"left":386},{"top":30,"left":615},{"top":195,"left":32}],

  [{"top":85,"left":217},{"top":372,"left":91},{"top":313,"left":615},{"top":182,"left":35},{"top":230,"left":255},{"top":22,"left":384},{"top":391,"left":367},{"top":102,"left":599},{"top":207,"left":443}],
  [{"top":50,"left":231},{"top":397,"left":248},{"top":352,"left":614},{"top":27,"left":45},{"top":328,"left":82},{"top":22,"left":384},{"top":388,"left":441},{"top":137,"left":545},{"top":207,"left":391}],
  [{"top":50,"left":231},{"top":397,"left":248},{"top":352,"left":614},{"top":52,"left":66},{"top":328,"left":82},{"top":232,"left":250},{"top":347,"left":440},{"top":188,"left":535},{"top":43,"left":636}],
  [{"top":151,"left":217},{"top":377,"left":257},{"top":42,"left":394},{"top":377,"left":631},{"top":309,"left":81},{"top":191,"left":374},{"top":347,"left":440},{"top":188,"left":535},{"top":43,"left":636}],
  [{"top":46,"left":63},{"top":352,"left":105},{"top":23,"left":474},{"top":354,"left":624},{"top":201,"left":129},{"top":176,"left":323},{"top":329,"left":281},{"top":188,"left":497},{"top":66,"left":652}]
];