'use strict';

describe('json-formatter', function () {
  var scope, $compile, $rootScope, element, fakeModule, JSONFormatterConfig;

  function createDirective(key, open) {
    open = open === undefined ? 0 : open;
    var elm;
    var template = '<json-formatter json="' + key + '" open="' + open +
      '"></json-formatter>';

    elm = angular.element(template);
    angular.element(document.body).prepend(elm);
    scope._null = null;
    scope._undefined = undefined;
    scope.number = 42;
    scope._function = function add(a, b) {
        return a + b;
    };
    scope.promiseFunction = function getAdd(service, a) {
        return service.get(a).then(function (b) {
            return a + b;
        });
    };
    scope.string = 'Hello world!';
    scope.date = (new Date(0)).toString(); // begging of Unix time
    scope.url = 'https://example.com';
    scope.emptyObject = {};
    scope.emptyObjectWithoutPrototype = Object.create(null);
    scope.objectWithEmptyKey = {'': 1};
    scope.emptyArray = [];
    scope.array = ['one', 'two', 'three'];
    scope.simpleObject = {me: 1};
    scope.longerObject = {
      numbers: [
        1,
        2,
        3
      ],
      boolean: true,
      'null': null,
      number: 123,
      anObject: {
        a: 'b',
        c: 'd',
        e: 'f\"'
      },
      string: 'Hello World',
      url: 'https://github.com/mohsen1/json-formatter',
      date: 'Sun Aug 03 2014 20:46:55 GMT-0700 (PDT)',
      func: function add(a,b){return a + b; }
    };
    scope.mixArray = [1, '2', {number: 3}];

    $compile(elm)(scope);
    scope.$digest();

    return elm;
  }

  beforeEach(function () {
    fakeModule = angular
      .module('test.jsonFormatter', ['jsonFormatter', 'ngSanitize'])
      .config(['JSONFormatterConfigProvider', function (_JSONFormatterConfig_) {
        JSONFormatterConfig = _JSONFormatterConfig_;
      }]);
    module('test.jsonFormatter', 'jsonFormatter', 'ngSanitize');
  });
  beforeEach(inject(function(_$rootScope_, _$compile_) {
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    $compile = _$compile_;
  }));

  afterEach(function () {
    if (element) {
        element.remove();
        element = null;
    }
  });

  describe('when created with', function () {
    describe('null', function(){
      it('should render "null"', function () {
        element = createDirective('_null');
        expect(element.text()).toContain('null');
      });
    });

    describe('undefined', function(){
      it('should render "undefined"', function () {
        element = createDirective('_undefined');
        expect(element.text()).toContain('undefined');
      });
    });

    describe('function', function(){
      it('should render the function', function () {
        element = createDirective('_function');
        expect(element.text()).toContain('function');
        expect(element.text()).toContain('add');
        expect(element.text()).toContain('(a, b)');
        expect(element.text().trim().match(/function\s[^\(]*\([^\)]*\)\s*(.*)/)[1]).toBe('{…}');
      });
    });

    describe('promiseFunction', function(){
      it('should render the function', function () {
        element = createDirective('promiseFunction');
        expect(element.text()).toContain('function');
        expect(element.text()).toContain('getAdd');
        expect(element.text()).toContain('(service, a)');
        expect(element.text().trim().match(/function\s[^\(]*\([^\)]*\)\s*(.*)/)[1]).toBe('{…}');
      });
    });

    describe('string', function(){
      it('should render "Hello world!"', function () {
        element = createDirective('string');
        expect(element.text()).toContain('"Hello world!"');
      });
    });

    describe('date string', function(){
      beforeEach(function(){
        element = createDirective('date');
      });
      it('should render "' + (new Date(0)).toString() + '"', function () {
        expect(element.text()).toContain('"' + (new Date(0)).toString() + '"');
      });
      it('should add "date" class to string', function() {
        expect(element.find('span.date').length).toBe(1);
      });
    });

    describe('url string', function(){
      beforeEach(function(){
        element = createDirective('url');
      });
      it('should render "https://example.com"', function () {
        expect(element.text()).toContain('"https://example.com"');
      });
      it('should add "url" class to string', function() {
        expect(element.find('span.url').length).toBe(1);
      });
    });

    describe('empty object', function(){
      testEmptyObject('emptyObject');
    });

    describe('empty object without prototype: Object.create(null)', function(){
      testEmptyObject('emptyObjectWithoutPrototype');
    });

    // DRY for testing empty objects
    function testEmptyObject(key) {
      describe('with open="0"', function() {
        beforeEach(function(){
          element = createDirective(key);
        });
        it('should render "Object"', function() {
          expect(element.text()).toContain('Object');
        });
      });
      describe('with open="1"', function() {
        beforeEach(function(){
          element = createDirective(key, 1);
        });
        it('should render "Object"', function() {
          expect(element.text()).toContain('Object');
        });
        it('should render have toggler opened', function() {
          expect(element.find('.toggler').hasClass('open')).toBe(true);
        });
      });
    }

    describe('object with empty key', function(){
      beforeEach(function(){
        element = createDirective('objectWithEmptyKey', 1);
      });

      it('should render "" for key', function(){
        debugger
        expect(element.find('.key').text()).toContain('""');
      });
    });

    describe('empty array', function(){
      beforeEach(function(){
        element = createDirective('emptyArray');
      });
      it('should render "Array"', function(){
        expect(element.text()).toContain('Array');
      });
      it('should have brackets and length: [0]', function(){
        expect(element.text()).toContain('[0]');
      });
    });

    describe('array', function(){
      beforeEach(function(){
        element = createDirective('array');
      });
      it('should render "Array"', function(){
        expect(element.text()).toContain('Array');
      });
      it('should have brackets and length: [3]', function(){
        expect(element.text()).toContain('[3]');
      });
    });

    describe('object', function(){
      beforeEach(function(){
        element = createDirective('simpleObject');
      });
      it('should render "Object"', function(){
        expect(element.text()).toContain('Object');
      });
      it('should open when clicking on "Object"', function(){
        element.find('.constructor-name').click();
        expect(element.find('.toggler').hasClass('open')).toBe(true);
      });
    });

    describe('hover preview', function() {

      it('default is disabled', function () {
        element = createDirective('mixArray');
        expect(element.find('.thumbnail-text').length).toBe(0);
      });

      describe('set enable', function () {
        beforeEach(function () {
          JSONFormatterConfig.hoverPreviewEnabled = true;
        });

        it('should render "simple object"', function () {
          element = createDirective('simpleObject', 0);
          expect(element.find('.thumbnail-text').text().trim()).toBe('{me:1}');
        });

        it('should render "longer object"', function () {
          element = createDirective('longerObject', 0);
          expect(element.find('.thumbnail-text').text().trim()).toBe('{numbers:Array[3], boolean:true, null:null, number:123, anObject:Object…}');
        });

        it('should render "array"', function () {
          element = createDirective('array', 0);
          expect(element.find('.thumbnail-text').text().trim()).toBe('["one", "two", "three"]');
        });

        it('should render "mixArray"', function () {
          element = createDirective('mixArray', 0);
          expect(element.find('.thumbnail-text').text().trim()).toBe('[1, "2", Object]');
        });
      });

    });
  });

});